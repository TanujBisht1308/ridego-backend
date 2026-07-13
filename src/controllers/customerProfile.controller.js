import { getCustomerProfile, saveCustomerProfile } from '../services/customerProfile.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getProfileHandler = async (req, res, next) => {
  try {
    const customer = await getCustomerProfile(req.customer.id);
    if (!customer) return errorResponse(res, 'Customer not found', 404);
    return successResponse(res, customer, 'Profile fetched');
  } catch (err) {
    next(err);
  }
};

export const updateProfileHandler = async (req, res, next) => {
  try {
    const { fullName, email } = req.body;
    const customer = await saveCustomerProfile(req.customer.id, { fullName, email });
    return successResponse(res, customer, 'Profile updated');
  } catch (err) {
    next(err);
  }
};
import { registerCustomerFcmToken } from '../services/customerProfile.service.js';

export const registerFcmTokenHandler = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    await registerCustomerFcmToken(req.customer.id, fcmToken);
    return successResponse(res, null, 'FCM token registered');
  } catch (err) {
    next(err);
  }
};