import {
  getProfile,
  setupProfile,
  submitDocuments,
  toggleOnlineStatus,
  getDashboardStats,
} from '../services/driver.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getProfileHandler = async (req, res, next) => {
  try {
    const driver = await getProfile(req.driver.id);
    if (!driver) return errorResponse(res, 'Driver not found', 404);
    return successResponse(res, driver, 'Profile fetched');
  } catch (err) {
    next(err);
  }
};

export const setupProfileHandler = async (req, res, next) => {
  try {
    const { fullName, email, vehicleNumber, vehicleType } = req.body;
    const driver = await setupProfile(req.driver.id, { fullName, email, vehicleNumber, vehicleType });
    return successResponse(res, driver, 'Profile saved');
  } catch (err) {
    next(err);
  }
};

export const submitDocumentsHandler = async (req, res, next) => {
  try {
    const status = await submitDocuments(req.driver.id);
    return successResponse(res, status, 'Documents submitted for verification. We will notify you soon.');
  } catch (err) {
    next(err);
  }
};

// ---- Phase 6 ----

// PATCH /api/driver/status
export const toggleStatusHandler = async (req, res, next) => {
  try {
    const result = await toggleOnlineStatus(req.driver.id);
    return successResponse(res, result, `You are now ${result.isOnline ? 'online' : 'offline'}`);
  } catch (err) {
    next(err);
  }
};

// GET /api/driver/dashboard/stats
export const getDashboardStatsHandler = async (req, res, next) => {
  try {
    const stats = await getDashboardStats(req.driver.id);
    return successResponse(res, stats, 'Dashboard stats fetched');
  } catch (err) {
    next(err);
  }
};