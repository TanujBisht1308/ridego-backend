import { body } from 'express-validator';

export const updateSettingsValidator = [
  body('soundAndVibration')
    .isBoolean().withMessage('soundAndVibration must be true or false'),
  body('navigationApp')
    .notEmpty().withMessage('navigationApp is required')
    .isString().withMessage('navigationApp must be a string'),
  body('onlinePreferences')
    .isBoolean().withMessage('onlinePreferences must be true or false'),
];