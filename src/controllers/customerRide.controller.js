import {
  getFareEstimate,
  requestRide,
  getActiveRide,
  getRideStatus,
  cancelRide,
  submitRating,
  fetchCustomerRideHistory,
} from '../services/customerRide.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const estimateHandler = async (req, res, next) => {
  try {
    const { pickupLat, pickupLng, dropLat, dropLng } = req.body;
    const estimate = await getFareEstimate({ pickupLat, pickupLng, dropLat, dropLng });
    return successResponse(res, estimate, 'Fare estimate calculated');
  } catch (err) {
    next(err);
  }
};

export const requestRideHandler = async (req, res, next) => {
  try {
    const ride = await requestRide(req.customer.id, req.body);
    return successResponse(res, ride, 'Ride requested', 201);
  } catch (err) {
    if (err.statusCode) return errorResponse(res, err.message, err.statusCode);
    next(err);
  }
};

export const activeRideHandler = async (req, res, next) => {
  try {
    const ride = await getActiveRide(req.customer.id);
    return successResponse(res, ride, ride ? 'Active ride found' : 'No active ride');
  } catch (err) {
    next(err);
  }
};

export const rideStatusHandler = async (req, res, next) => {
  try {
    const ride = await getRideStatus(req.params.rideId, req.customer.id);
    if (!ride) return errorResponse(res, 'Ride not found', 404);
    return successResponse(res, ride, 'Ride status fetched');
  } catch (err) {
    next(err);
  }
};

export const cancelRideHandler = async (req, res, next) => {
  try {
    const ride = await cancelRide(req.params.rideId, req.customer.id);
    if (!ride) return errorResponse(res, 'Ride cannot be cancelled', 409);
    return successResponse(res, ride, 'Ride cancelled');
  } catch (err) {
    next(err);
  }
};

export const rateRideHandler = async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    const ride = await submitRating(req.params.rideId, req.customer.id, rating, review);
    if (!ride) return errorResponse(res, 'Ride not found or not completed yet', 404);
    return successResponse(res, ride, 'Rating submitted');
  } catch (err) {
    next(err);
  }
};

export const rideHistoryHandler = async (req, res, next) => {
  try {
    const status = req.query.status || 'all';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const data = await fetchCustomerRideHistory(req.customer.id, status, page, limit);
    return successResponse(res, data, 'Ride history fetched');
  } catch (err) {
    next(err);
  }
};