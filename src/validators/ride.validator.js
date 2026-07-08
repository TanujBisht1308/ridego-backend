import { body } from 'express-validator';

export const rideIdValidator = [
  body('rideId')
    .notEmpty().withMessage('rideId is required')
    .isUUID().withMessage('rideId must be a valid UUID'),
];