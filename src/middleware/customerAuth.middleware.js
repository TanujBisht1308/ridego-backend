import { verifyAccessToken } from '../config/jwt.js';
import { findById } from '../repositories/customer.repository.js';
import { errorResponse } from '../utils/response.js';

export const authenticateCustomer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (decoded.type !== 'access' || decoded.role !== 'customer') {
      return errorResponse(res, 'Invalid token type', 401);
    }

    const customer = await findById(decoded.id);
    if (!customer) return errorResponse(res, 'Customer not found', 401);

    req.customer = customer;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return errorResponse(res, 'Token expired', 401);
    if (err.name === 'JsonWebTokenError') return errorResponse(res, 'Invalid token', 401);
    return errorResponse(res, 'Authentication failed', 500);
  }
};