import express from 'express';
import { z } from 'zod';
import { Packer } from 'docx';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadPhotos, handleMulterError } from '../lib/upload.js';
import { generateDOCX, generatePDF } from '../lib/reportGenerator.js';

const router = express.Router();
router.use(authenticate);

const formatDate = (d) => {
  if (typeof d === 'string') d = new Date(d);
  return d.toISOString().split('T')[0];
};

const parseLocalDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const reportSchema = z.object({
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  customDays: z.array(z.string()).optional(),
  previousAccumulatedHours: z.number().min(0).default(0),
  remarks: z.string().optional(),
  photoIds: z.array(z.string()).max(8).optional(),
  format: z.enum(['docx', 'pdf']).default('docx'),
});

// POST /api/reports/photos
router.post('/photos', (req, res, next) => {
  uploadPhotos(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next);
    next();
  });
});

router.post(
  '/photos',
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const photoUrls = req.files.map((f) => `/uploads/photos/${f.filename}`);
    res.json({ photos: photoUrls });
  })
);

// POST /api/reports/weekly
router.post(
  '/weekly',
  asyncHandler(async (req, res) => {
    const result = reportSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors,
      });
    }

    const { periodStart, periodEnd, customDays, previousAccumulatedHours, remarks, photoIds, format } = result.data;

    // Validate date range
    if (!periodStart && !customDays) {
      return res.status(400).json({
        error: 'Either periodStart/periodEnd or customDays must be provided',
      });
    }

    // Get user and profile
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { fullName: true, email: true },
    });

    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId },
    });

    if (!profile) {
      return res.status(400).json({ error: 'Complete onboarding first' });
    }

    // Get logs
    let logs = [];
    if (periodStart && periodEnd) {
      logs = await prisma.timeLog.findMany({
        where: {
          userId: req.userId,
          date: {
            gte: parseLocalDate(periodStart),
            lte: parseLocalDate(periodEnd),
          },
        },
        orderBy: { date: 'asc' },
      });
    } else if (customDays) {
      logs = await prisma.timeLog.findMany({
        where: {
          userId: req.userId,
          date: { in: customDays.map(parseLocalDate) },
        },
        orderBy: { date: 'asc' },
      });
    }

    if (logs.length === 0) {
      return res.status(400).json({ error: 'No logs found for the specified period' });
    }

    const photoUrls = photoIds || [];

    const reportData = {
      user,
      profile,
      logs: logs.map((l) => ({ ...l, date: formatDate(l.date) })),
      previousAccumulated: previousAccumulatedHours,
      remarks: remarks || '',
      photoUrls,
      periodStart: periodStart || (customDays && customDays[0]),
      periodEnd: periodEnd || (customDays && customDays[customDays.length - 1]),
    };

    // Generate report
    if (format === 'docx') {
      const doc = await generateDOCX(reportData);
      const buffer = await Packer.toBuffer(doc);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="report_${Date.now()}.docx"`);
      res.send(buffer);
    } else {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="report_${Date.now()}.pdf"`);
      generatePDF(reportData, res);
    }
  })
);

export default router;
