import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '1048576', 10); // 1MB default
const ALLOWED_MIME_TYPES = (
  process.env.ALLOWED_MIME_TYPES || 'image/png,image/jpeg,image/jpg'
).split(',');

// Ensure upload directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const logoStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = path.join(UPLOAD_DIR, 'logos');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${crypto.randomUUID()}${ext}`;
    cb(null, name);
  },
});

const photoStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = path.join(UPLOAD_DIR, 'photos');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${crypto.randomUUID()}${ext}`;
    cb(null, name);
  },
});

const mimeFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Only image files are allowed. Got: ${file.mimetype}`));
  }
};

export const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: mimeFilter,
}).single('logo');

export const uploadPhotos = multer({
  storage: photoStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: mimeFilter,
}).array('photos', 8);

export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files. Maximum 8 photos per report.',
      });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err && err.message && err.message.includes('Only image files')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
};
