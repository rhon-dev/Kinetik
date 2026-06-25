import express from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { rateLimit } from 'express-rate-limit';
import prisma from '../lib/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import {
  issueAccessToken,
  issueRefreshToken,
  hashToken,
  setAuthCookies,
  clearAuthCookies,
} from '../lib/tokens.js';

const router = express.Router();

// Rate limiter: 20 attempts per 10 minutes per IP in dev, 5 in production
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 20,
  message: { error: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development', // disable entirely in dev
});

// Validation schemas
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(1, 'Full name is required'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// POST /api/auth/signup
router.post(
  '/signup',
  authLimiter,
  validate(signupSchema),
  asyncHandler(async (req, res) => {
    const { email, password, fullName } = req.body;

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password (cost 12)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
      },
    });

    // Issue tokens
    const accessToken = issueAccessToken(user.id);
    const refreshToken = issueRefreshToken();
    const tokenHash = hashToken(refreshToken);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  })
);

// POST /api/auth/login
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Issue tokens
    const accessToken = issueAccessToken(user.id);
    const refreshToken = issueRefreshToken();
    const tokenHash = hashToken(refreshToken);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  })
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const tokenHash = hashToken(refreshToken);

    // Find token
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!storedToken) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Issue new tokens
    const newAccessToken = issueAccessToken(storedToken.userId);
    const newRefreshToken = issueRefreshToken();
    const newTokenHash = hashToken(newRefreshToken);

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        userId: storedToken.userId,
        tokenHash: newTokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Set new cookies
    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.json({
      user: {
        id: storedToken.user.id,
        email: storedToken.user.email,
        fullName: storedToken.user.fullName,
      },
    });
  })
);

// POST /api/auth/logout
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await prisma.refreshToken.updateMany({
        where: {
          tokenHash,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    }

    clearAuthCookies(res);
    res.json({ message: 'Logged out successfully' });
  })
);

// GET /api/auth/me
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  })
);

export default router;
