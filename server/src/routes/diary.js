import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { DEFAULT_PHRASE_TEMPLATES, composeText } from '../lib/templates.js';

const router = express.Router();
router.use(authenticate);

const formatDate = (d) => d.toISOString().split('T')[0];
const parseLocalDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const diarySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.string(),
  detail: z.string(),
  tags: z.array(z.string()).optional(),
});

// Ensure default templates exist for user
const ensureDefaultTemplates = async (userId) => {
  const existing = await prisma.phraseTemplate.count({
    where: { userId, isUserSaved: false },
  });

  if (existing === 0) {
    await prisma.phraseTemplate.createMany({
      data: DEFAULT_PHRASE_TEMPLATES.map((t) => ({
        ...t,
        userId,
        isUserSaved: false,
      })),
    });
  }
};

// GET /api/phrase-templates
router.get(
  '/phrase-templates',
  asyncHandler(async (req, res) => {
    await ensureDefaultTemplates(req.userId);

    const templates = await prisma.phraseTemplate.findMany({
      where: { userId: req.userId },
      orderBy: [{ isUserSaved: 'desc' }, { category: 'asc' }, { lastUsedAt: 'desc' }],
    });

    res.json({ templates });
  })
);

// POST /api/phrase-templates
router.post(
  '/phrase-templates',
  asyncHandler(async (req, res) => {
    const result = z
      .object({
        category: z.string(),
        templateText: z.string(),
      })
      .safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const template = await prisma.phraseTemplate.create({
      data: {
        userId: req.userId,
        category: result.data.category,
        templateText: result.data.templateText,
        isUserSaved: true,
      },
    });

    res.status(201).json({ template });
  })
);

// DELETE /api/phrase-templates/:id
router.delete(
  '/phrase-templates/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const template = await prisma.phraseTemplate.findFirst({
      where: { id, userId: req.userId, isUserSaved: true },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found or cannot be deleted' });
    }

    await prisma.phraseTemplate.delete({ where: { id } });
    res.json({ message: 'Template deleted' });
  })
);

// GET /api/diary
router.get(
  '/diary',
  asyncHandler(async (req, res) => {
    const entries = await prisma.diaryEntry.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
    });

    res.json({
      entries: entries.map((e) => ({ ...e, date: formatDate(e.date) })),
    });
  })
);

// POST /api/diary
router.post(
  '/diary',
  asyncHandler(async (req, res) => {
    const result = diarySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors,
      });
    }

    const { date, category, detail, tags = [] } = result.data;

    // Get template for category
    const template = await prisma.phraseTemplate.findFirst({
      where: { userId: req.userId, category },
      orderBy: [{ isUserSaved: 'desc' }, { lastUsedAt: 'desc' }],
    });

    const templateText =
      template?.templateText || DEFAULT_PHRASE_TEMPLATES.find((t) => t.category === category)?.templateText || '{{detail}}';

    const composedText = composeText(templateText, detail, tags);

    const entry = await prisma.diaryEntry.create({
      data: {
        userId: req.userId,
        date: parseLocalDate(date),
        category,
        detail,
        tags,
        composedText,
      },
    });

    res.status(201).json({ entry: { ...entry, date: formatDate(entry.date) } });
  })
);

// PUT /api/diary/:id
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existing = await prisma.diaryEntry.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Entry not found' });

    const result = diarySchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Validation failed' });
    }

    const data = result.data;
    if (data.date) data.date = parseLocalDate(data.date);

    const entry = await prisma.diaryEntry.update({ where: { id }, data });
    res.json({ entry: { ...entry, date: formatDate(entry.date) } });
  })
);

// DELETE /api/diary/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existing = await prisma.diaryEntry.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Entry not found' });

    await prisma.diaryEntry.delete({ where: { id } });
    res.json({ message: 'Entry deleted' });
  })
);

// GET /api/diary/weekly-digest?from=&to=
router.get(
  '/diary/weekly-digest',
  asyncHandler(async (req, res) => {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to dates required' });
    }

    const entries = await prisma.diaryEntry.findMany({
      where: {
        userId: req.userId,
        date: {
          gte: parseLocalDate(from),
          lte: parseLocalDate(to),
        },
      },
    });

    const categoryCounts = {};
    entries.forEach((e) => {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    });

    res.json({ digest: categoryCounts, total: entries.length });
  })
);

export default router;
