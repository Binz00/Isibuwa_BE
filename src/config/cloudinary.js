/**
 * config/cloudinary.js — Cloudinary v1 SDK configuration
 *
 * Exports the configured cloudinary instance for use in
 * multer-storage-cloudinary and for generating signed URLs.
 */

'use strict';

const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true, // always use HTTPS
});

module.exports = cloudinary;
