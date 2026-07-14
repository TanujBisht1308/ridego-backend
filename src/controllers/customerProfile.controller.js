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
import {
  fetchSavedPlaces,
  addSavedPlace,
  editSavedPlace,
  removeSavedPlace,
} from '../services/customerProfile.service.js';

export const getSavedPlacesHandler = async (req, res, next) => {
  try {
    const places = await fetchSavedPlaces(req.customer.id);
    return successResponse(res, places, 'Saved places fetched');
  } catch (err) {
    next(err);
  }
};

export const createSavedPlaceHandler = async (req, res, next) => {
  try {
    const { label, address, latitude, longitude, icon } = req.body;
    const place = await addSavedPlace(req.customer.id, { label, address, latitude, longitude, icon });
    return successResponse(res, place, 'Saved place added', 201);
  } catch (err) {
    next(err);
  }
};

export const updateSavedPlaceHandler = async (req, res, next) => {
  try {
    const { label, address, latitude, longitude, icon } = req.body;
    const fields = {};
    if (label !== undefined) fields.label = label;
    if (address !== undefined) fields.address = address;
    if (latitude !== undefined) fields.latitude = latitude;
    if (longitude !== undefined) fields.longitude = longitude;
    if (icon !== undefined) fields.icon = icon;

    const place = await editSavedPlace(req.customer.id, req.params.id, fields);
    if (!place) return errorResponse(res, 'Saved place not found', 404);
    return successResponse(res, place, 'Saved place updated');
  } catch (err) {
    next(err);
  }
};

export const deleteSavedPlaceHandler = async (req, res, next) => {
  try {
    await removeSavedPlace(req.customer.id, req.params.id);
    return successResponse(res, null, 'Saved place deleted');
  } catch (err) {
    next(err);
  }
};