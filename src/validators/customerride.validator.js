import { body } from 'express-validator';

export const requestRideValidator = [
  body('pickupAddress').notEmpty().withMessage('pickupAddress is required'),
  body('dropAddress').notEmpty().withMessage('dropAddress is required'),
  body('vehicleType').notEmpty().withMessage('vehicleType is required'),
  body('pickupLat').optional({ nullable: true }).isFloat(),
  body('pickupLng').optional({ nullable: true }).isFloat(),
  body('dropLat').optional({ nullable: true }).isFloat(),
  body('dropLng').optional({ nullable: true }).isFloat(),
];

export const rateRideValidator = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be 1-5'),
  body('review').optional().isString(),
];