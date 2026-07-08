// Runs the express-validator rules attached to a route and short-circuits
// with a 422 if any failed.

import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/response.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(
      res,
      'Validation failed',
      422,
      errors.array().map((e) => ({ field: e.path, message: e.msg }))
    );
  }
  next();
};