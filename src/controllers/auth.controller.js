// Thin HTTP layer — parses req, calls services, shapes res. No business logic here.

import { sendOtp, verifyOtp } from '../services/otp.service.js';
import { loginOrRegister, refreshTokens, logout } from '../services/auth.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

// POST /api/auth/send-otp
export const sendOtpHandler = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    await sendOtp(phoneNumber);
    return successResponse(res, null, 'OTP sent successfully');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/verify-otp
export const verifyOtpHandler = async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;

    const isValid = await verifyOtp(phoneNumber, otp);
    if (!isValid) {
      return errorResponse(res, 'Invalid or expired OTP', 400);
    }

    const result = await loginOrRegister(phoneNumber);
    return successResponse(res, result, 'OTP verified successfully');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh-token
export const refreshTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return errorResponse(res, 'Refresh token required', 400);
    }

    const tokens = await refreshTokens(refreshToken);
    if (!tokens) {
      return errorResponse(res, 'Invalid or expired refresh token', 401);
    }

    return successResponse(res, tokens, 'Token refreshed');
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid or expired refresh token', 401);
    }
    next(err);
  }
};

// POST /api/auth/logout
export const logoutHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await logout(refreshToken);
    return successResponse(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};