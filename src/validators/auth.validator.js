// express-validator rule sets for auth routes — declared once, reused in routes.

import { body } from 'express-validator';

export const sendOtpValidator = [
  body('phoneNumber')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Invalid phone number format'),
];

export const verifyOtpValidator = [
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('otp')
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 4, max: 6 }).withMessage('OTP must be 4-6 digits')
    .isNumeric().withMessage('OTP must be numeric'),
];

export const refreshTokenValidator = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];