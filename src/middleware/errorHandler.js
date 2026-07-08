// Global error handler — must be registered last, after all routes.
// Any error passed to next(err) anywhere in the app lands here.

import { errorResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', err);

  if (err.code === '23505') {
    return errorResponse(res, 'Duplicate entry — resource already exists', 409);
  }
  if (err.code === '23503') {
    return errorResponse(res, 'Referenced resource not found', 404);
  }

  return errorResponse(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    500
  );
};