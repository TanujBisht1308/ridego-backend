import { body } from 'express-validator';

export const addMoneyValidator = [
  body('amount').isFloat({ min: 1 }).withMessage('amount must be a positive number'),
];

export const payForRideValidator = [
  body('amount').isFloat({ min: 1 }).withMessage('amount must be a positive number'),
  body('rideId').optional().isUUID().withMessage('rideId must be a valid UUID'),
];