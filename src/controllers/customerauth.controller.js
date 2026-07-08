import {
  sendCustomerOtp,
  verifyCustomerOtp,
  refreshCustomerTokens,
  logoutCustomer,
} from '../services/customerAuth.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const sendOtpHandler = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    await sendCustomerOtp(phoneNumber);
    return successResponse(res, null, 'OTP sent successfully');
  } catch (err) {
    next(err);
  }
};

export const verifyOtpHandler = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;
    const result = await verifyCustomerOtp(phoneNumber, otp);
    if (!result) return errorResponse(res, 'Invalid or expired OTP', 400);
    return successResponse(res, result, 'OTP verified successfully');
  } catch (err) {
    next(err);
  }
};

export const refreshTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return errorResponse(res, 'Refresh token required', 400);

    const tokens = await refreshCustomerTokens(refreshToken);
    if (!tokens) return errorResponse(res, 'Invalid or expired refresh token', 401);

    return successResponse(res, tokens, 'Token refreshed');
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid or expired refresh token', 401);
    }
    next(err);
  }
};

export const logoutHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await logoutCustomer(refreshToken);
    return successResponse(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};