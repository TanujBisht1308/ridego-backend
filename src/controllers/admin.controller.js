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
import {
  fetchDrivers,
  fetchDriverDetail,
  verifyDriver,
  toggleDriverSuspension,
} from '../services/admin.service.js';

export const getDriversHandler = async (req, res, next) => {
  try {
    const { search = '', status = 'all', page = 1, limit = 20 } = req.query;
    const result = await fetchDrivers(search, status, parseInt(page, 10), parseInt(limit, 10));
    return successResponse(res, result, 'Drivers fetched');
  } catch (err) {
    next(err);
  }
};

export const getDriverDetailHandler = async (req, res, next) => {
  try {
    const detail = await fetchDriverDetail(req.params.id);
    if (!detail) return errorResponse(res, 'Driver not found', 404);
    return successResponse(res, detail, 'Driver detail fetched');
  } catch (err) {
    next(err);
  }
};

export const verifyDriverHandler = async (req, res, next) => {
  try {
    const { approve } = req.body;
    await verifyDriver(req.params.id, approve);
    return successResponse(res, null, approve ? 'Driver verified' : 'Driver rejected');
  } catch (err) {
    next(err);
  }
};

export const suspendDriverHandler = async (req, res, next) => {
  try {
    const { suspend } = req.body;
    await toggleDriverSuspension(req.params.id, suspend);
    return successResponse(res, null, suspend ? 'Driver suspended' : 'Driver reinstated');
  } catch (err) {
    next(err);
  }
};