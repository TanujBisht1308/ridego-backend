import { verifyAdminAccessToken } from '../config/jwt.js';
import { findAdminById } from '../repositories/admin.repository.js';
import { errorResponse } from '../utils/response.js';

export const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAdminAccessToken(token);
    if (decoded.type !== 'admin_access') {
      return errorResponse(res, 'Invalid token type', 401);
    }

    const admin = await findAdminById(decoded.id);
    if (!admin) return errorResponse(res, 'Admin not found', 401);

    req.admin = admin;
    next();
  } catch (err) {
    return errorResponse(res, 'Authentication failed', 401);
  }
};