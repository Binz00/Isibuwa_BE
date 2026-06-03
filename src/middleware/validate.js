/**
 * middleware/validate.js — Joi request body validation
 *
 * Usage: router.post('/path', validate(schema), controller)
 * Returns 422 with error details on validation failure.
 */

'use strict';

const Joi = require('joi');

// ── Schemas ──────────────────────────────────────────────────

/**
 * Booking submission schema.
 * Note: file upload is validated separately in upload.js middleware.
 */
const bookingSchema = Joi.object({
  name:  Joi.string().min(2).max(100).required().messages({
    'string.min':  'Name must be at least 2 characters',
    'string.max':  'Name must be at most 100 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  phone: Joi.string().min(7).max(20).required().messages({
    'string.min':  'Phone number must be at least 7 characters',
    'any.required': 'Phone number is required',
  }),
  district: Joi.string().min(2).max(50).required().messages({
    'string.min':  'District must be at least 2 characters',
    'any.required': 'District is required',
  }),
  payment_reference: Joi.string().min(3).max(50).required().messages({
    'string.min':  'Payment reference must be at least 3 characters',
    'any.required': 'Payment reference number is required',
  }),
});

/**
 * Admin login schema.
 */
const adminLoginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// ── Middleware factory ────────────────────────────────────────

/**
 * Returns an Express middleware that validates req.body against the given Joi schema.
 * @param {Joi.ObjectSchema} schema
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,  // collect all errors, not just the first
      stripUnknown: true, // remove extra fields from body
    });

    if (error) {
      const details = error.details.map((d) => ({
        field:   d.path.join('.'),
        message: d.message,
      }));
      return res.status(422).json({ error: 'Validation failed', details });
    }

    req.body = value; // use the sanitized/coerced value
    next();
  };
}

module.exports = { bookingSchema, adminLoginSchema, validate };
