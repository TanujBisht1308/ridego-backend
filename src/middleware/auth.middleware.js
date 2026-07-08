// Verifies the JWT access token on protected routes and attaches req.driver.

import { verifyAccessToken } from '../config/jwt.js';
import { findById } from '../repositories/driver.repository.js';
import { errorResponse } from '../utils/response.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (decoded.type !== 'access') {
      return errorResponse(res, 'Invalid token type', 401);
    }

    const driver = await findById(decoded.id);
    if (!driver) {
      return errorResponse(res, 'Driver not found', 401);
    }

    req.driver = driver;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token', 401);
    }
    return errorResponse(res, 'Authentication failed', 500);
  }
};