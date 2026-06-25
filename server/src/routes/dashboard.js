import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();
router.use(authenticate);

// GET /api/dashboard/summary
router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    // Get profile
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId },
    });

    if (!profile) {
      return res.json({
        summary: null,
        message: 'Complete onboarding first',
      });
    }

    // Get all logged hours
    const logs = await prisma.timeLog.findMany({
      where: { userId: req.userId },
      select: { hoursLogged: true },
    });

    const totalHours = logs.reduce((sum, log) => sum + log.hoursLogged, 0);
    const daysLogged = logs.length;
    const dailyAvg = daysLogged > 0 ? totalHours / daysLogged : 0;
    const targetHours = profile.targetHours || 0;
    const hoursRemaining = Math.max(0, targetHours - totalHours);
    const percentComplete = targetHours > 0 ? (totalHours / targetHours) * 100 : 0;

    res.json({
      summary: {
        totalHours: parseFloat(totalHours.toFixed(2)),
        daysLogged,
        dailyAvg: parseFloat(dailyAvg.toFixed(2)),
        hoursRemaining: parseFloat(hoursRemaining.toFixed(2)),
        percentComplete: parseFloat(percentComplete.toFixed(2)),
        targetHours,
      },
    });
  })
);

export default router;
