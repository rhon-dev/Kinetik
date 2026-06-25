import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
router.use(authenticate);

const timelogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  hoursLogged: z.number().min(0).max(24),
  note: z.string().optional(),
});

// Helpers
const parseLocalDate = (dateStr) => {
  // Parse YYYY-MM-DD as UTC midnight to avoid timezone drift
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const formatDate = (d) => d.toISOString().split('T')[0];

// GET /api/timelogs?from=&to=
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { from, to } = req.query;
    const where = { userId: req.userId };

    if (from || to) {
      where.date = {};
      if (from) where.date.gte = parseLocalDate(from);
      if (to) where.date.lte = parseLocalDate(to);
    }

    const logs = await prisma.timeLog.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    res.json({
      logs: logs.map((l) => ({ ...l, date: formatDate(l.date) })),
    });
  })
);

// POST /api/timelogs — upsert (one log per user per day)
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const result = timelogSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const { date, hoursLogged, note } = result.data;
    const dateObj = parseLocalDate(date);

    const log = await prisma.timeLog.upsert({
      where: { userId_date: { userId: req.userId, date: dateObj } },
      create: { userId: req.userId, date: dateObj, hoursLogged, note },
      update: { hoursLogged, note },
    });

    res.status(201).json({ log: { ...log, date: formatDate(log.date) } });
  })
);

// PUT /api/timelogs/:id
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verify ownership
    const existing = await prisma.timeLog.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Log not found' });

    const result = timelogSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const data = result.data;
    if (data.date) data.date = parseLocalDate(data.date);

    const log = await prisma.timeLog.update({ where: { id }, data });
    res.json({ log: { ...log, date: formatDate(log.date) } });
  })
);

// DELETE /api/timelogs/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existing = await prisma.timeLog.findFirst({
      where: { id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Log not found' });

    await prisma.timeLog.delete({ where: { id } });
    res.json({ message: 'Log deleted' });
  })
);

export default router;
