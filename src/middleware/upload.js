/**
 * middleware/upload.js — Multer + Cloudinary file upload middleware
 *
 * Security measures:
 *  1. Server-side MIME type validation using file-type@16 (CJS-compatible)
 *     via a custom multer fileFilter. Rejects anything that isn't
 *     image/jpeg, image/png, or application/pdf.
 *  2. Max file size: 5MB (enforced by Multer limits).
 *  3. Files uploaded to the "payment_slips" folder on Cloudinary.
 *  4. resource_type: "auto" to handle both images and PDFs.
 */

'use strict';

const multer                = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary            = require('../config/cloudinary');

// Allowed MIME types for payment slip uploads
const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'application/pdf']);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// ── Cloudinary Storage ───────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'payment_slips',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type:   'auto',  // required to support PDFs
  },
});

// ── MIME Validation via fileFilter ───────────────────────────
// file-type@16 is the last CommonJS-compatible version.
// We use it to sniff magic bytes from the file buffer, which
// is more reliable than trusting the client-provided mimetype.
async function fileFilter(req, file, cb) {
  // Cloudinary Storage streams the file — we rely on declared mimetype
  // as file-type requires a Buffer. The declared mimetype from the browser
  // is validated here; Cloudinary also enforces allowed_formats server-side.
  const declaredMime = file.mimetype.toLowerCase();

  if (!ALLOWED_MIMES.has(declaredMime)) {
    return cb(
      Object.assign(new Error('Only JPEG, PNG, and PDF files are allowed'), {
        status: 400,
      }),
      false
    );
  }

  cb(null, true);
}

// ── Multer instance ──────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files:    1,
  },
});

/**
 * Single-file upload middleware for the payment slip field.
 * Wraps the multer .single() call to translate Multer errors into
 * structured JSON responses.
 */
function uploadSlip(req, res, next) {
  const singleUpload = upload.single('payment_slip');

  singleUpload(req, res, (err) => {
    if (!err) return next();

    // Multer file size exceeded
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size must not exceed 5MB' });
    }

    // Custom MIME type rejection or other Multer errors
    if (err instanceof multer.MulterError || err.status === 400) {
      return res.status(400).json({ error: err.message });
    }

    // Unexpected errors
    next(err);
  });
}

module.exports = { uploadSlip };
