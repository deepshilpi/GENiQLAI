import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { Request } from 'express';

// Create uploads directory if it doesn't exist
const uploadsDir = path.resolve('./uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    // Generate a unique filename with original extension
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// File filter to only allow certain image types
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'));
  }
};

// Configure multer upload
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Function to get public URL for an upload
export function getUploadUrl(filename: string, req: Request): string {
  // Use protocol, host, etc. from request to build URL
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${filename}`;
}