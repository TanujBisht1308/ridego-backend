import { loginAdmin, fetchLogs, fetchDashboardStats } from '../services/admin.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const adminLoginHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginAdmin(email, password);
    if (!result) return errorResponse(res, 'Invalid credentials', 401);
    return successResponse(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const getLogsHandler = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const level = req.query.level || null;
    const logs = await fetchLogs(limit, level);
    return successResponse(res, logs, 'Logs fetched');
  } catch (err) {
    next(err);
  }
};

export const getDashboardHandler = async (req, res, next) => {
  try {
    const stats = await fetchDashboardStats();
    return successResponse(res, stats, 'Dashboard stats fetched');
  } catch (err) {
    next(err);
  }
};