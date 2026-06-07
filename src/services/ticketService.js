/**
 * services/ticketService.js — Unique ticket code generator
 *
 * Generates codes in the format: EVT-YYYY-XXXXXXXXXXXX
 * where YYYY = current year, XXXXXXXXXXXX = random 12-char uppercase alphanumeric.
 *
 * 36^12 ≈ 4.7 × 10¹⁸ possible combinations — virtually impossible to brute-force.
 * Uses crypto.randomBytes for cryptographically strong randomness.
 * Checks the DB for collisions before returning a code.
 */

'use strict';

const crypto = require('crypto');
const pool   = require('../config/db');

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 12; // 12-char random suffix

/**
 * Generates a random CODE_LENGTH-character alphanumeric suffix
 * using cryptographically secure randomness.
 * @returns {string}
 */
function randomSuffix() {
  const bytes = crypto.randomBytes(CODE_LENGTH);
  return Array.from(bytes)
    .map((b) => CHARSET[b % CHARSET.length])
    .join('');
}

/**
 * Generates a unique ticket code, verifying uniqueness against the DB.
 * Retries up to 10 times on collision (collision probability is negligible
 * but we handle it gracefully).
 *
 * @returns {Promise<string>} e.g. "EVT-2026-A3F7K9X2R4M8"
 */
async function generateTicketCode() {
  const year = new Date().getFullYear();
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = `EVT-${year}-${randomSuffix()}`;

    const { rows } = await pool.query(
      'SELECT id FROM tickets WHERE ticket_code = $1',
      [code]
    );

    if (rows.length === 0) {
      return code; // Unique — safe to use
    }

    // Extremely rare collision — try again
    console.warn(`Ticket code collision on attempt ${attempt + 1}: ${code}`);
  }

  throw new Error('Failed to generate a unique ticket code after 10 attempts');
}

module.exports = { generateTicketCode };

