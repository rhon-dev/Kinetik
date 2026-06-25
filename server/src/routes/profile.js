import express from 'express';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadLogo, handleMulterError } from '../lib/upload.js';

const router = express.Router();
router.use(authenticate);

const profileSchema = z
  .object({
    school: z.string().optional(),
    company: z.string().optional(),
    position: z.string().optional(),
    assignedOffice: z.string().optional(),
    courseYear: z.string().optional(),
    supervisorName: z.string().optional(),
    targetHours: z.number().int().positive().optional(),
    startDate: z.string().optional(),
    hoursPerDayDefault: z.number().min(0.5).max(24).optional(),
    weeklyWorkDays: z.array(z.number().int().min(0).max(6)).optional(),
    phHolidays: z
      .array(
        z.object({
          date: z.string(),
          name: z.string(),
          included: z.boolean(),
        })
      )
      .optional(),
    onboardingComplete: z.boolean().optional(),
  })
  .strict();

// GET /api/profile
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId },
    });
    res.json({ profile: profile || null });
  })
);

// PUT /api/profile
router.put(
  '/',
  asyncHandler(async (req, res) => {
    // Validate
    const result = profileSchema.safeParse(req.body);
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

    // Coerce startDate to Date if present
    if (data.startDate) {
      data.startDate = new Date(data.startDate);
    }

    const profile = await prisma.profile.upsert({
      where: { userId: req.userId },
      create: { userId: req.userId, ...data },
      update: data,
    });

    res.json({ profile });
  })
);

// POST /api/profile/logo
router.post('/logo', (req, res, next) => {
  uploadLogo(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next);
    next();
  });
});

router.post(
  '/logo',
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Build URL path for stored file
    const logoUrl = `/uploads/logos/${req.file.filename}`;

    // Delete old logo if it exists
    const existing = await prisma.profile.findUnique({
      where: { userId: req.userId },
      select: { companyLogoUrl: true },
    });

    if (existing?.companyLogoUrl) {
      const oldPath = path.join(
        process.cwd(),
        process.env.UPLOAD_DIR || './uploads',
        existing.companyLogoUrl.replace('/uploads/', '')
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Update profile
    const profile = await prisma.profile.upsert({
      where: { userId: req.userId },
      create: { userId: req.userId, companyLogoUrl: logoUrl },
      update: { companyLogoUrl: logoUrl },
    });

    res.json({ profile, logoUrl });
  })
);

export default router;
