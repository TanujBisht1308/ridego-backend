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
import { registerFcmToken } from '../services/driver.service.js';

export const registerFcmTokenHandler = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    await registerFcmToken(req.driver.id, fcmToken);
    return successResponse(res, null, 'FCM token registered');
  } catch (err) {
    next(err);
  }
};
import {
  fetchBankDetails,
  saveBankDetails,
  setNotificationChannel,
  fetchNotifications,
} from '../services/driver.service.js';

export const getBankDetailsHandler = async (req, res, next) => {
  try {
    const details = await fetchBankDetails(req.driver.id);
    return successResponse(res, details, 'Bank details fetched');
  } catch (err) {
    next(err);
  }
};

export const updateBankDetailsHandler = async (req, res, next) => {
  try {
    const { accountHolder, accountNumber, ifsc } = req.body;
    const details = await saveBankDetails(req.driver.id, { accountHolder, accountNumber, ifsc });
    return successResponse(res, details, 'Bank details updated');
  } catch (err) {
    next(err);
  }
};

export const updateNotificationChannelHandler = async (req, res, next) => {
  try {
    const { channelId } = req.body;
    await setNotificationChannel(req.driver.id, channelId);
    return successResponse(res, null, 'Notification sound updated');
  } catch (err) {
    next(err);
  }
};

export const getNotificationsHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const notifications = await fetchNotifications(req.driver.id, page, limit);
    return successResponse(res, notifications, 'Notifications fetched');
  } catch (err) {
    next(err);
  }
};