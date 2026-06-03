/**
 * middleware/auth.js — JWT verification middleware
 *
 * Reads the Authorization header ("Bearer <token>"), verifies
 * the token against JWT_SECRET, and attaches the decoded payload
 * to req.admin. Call next() on success or return 401 on failure.
 */

'use strict';

const jwt = require('jsonwebtoken');

/**
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // { adminId, email, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired — please log in again' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = verifyToken;
