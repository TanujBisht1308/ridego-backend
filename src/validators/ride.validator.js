import { body } from 'express-validator';

export const rideIdValidator = [
  body('rideId')
    .notEmpty().withMessage('rideId is required')
    .isUUID().withMessage('rideId must be a valid UUID'),
];

export const startRideValidator = [
  body('rideId')
    .notEmpty().withMessage('rideId is required')
    .isUUID().withMessage('rideId must be a valid UUID'),
  body('otp')
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 4, max: 4 }).withMessage('OTP must be 4 digits')
    .isNumeric().withMessage('OTP must be numeric'),
];