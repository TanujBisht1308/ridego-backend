import { body } from 'express-validator';

export const setupProfileValidator = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('vehicleNumber').notEmpty().withMessage('Vehicle number is required'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('vehicleType')
    .optional()
    .isIn(['bike', 'auto', 'mini', 'sedan'])
    .withMessage('vehicleType must be bike, auto, mini, or sedan'),
];