import {
  getIncomingRide,
  acceptRide,
  rejectRide,
  reachedPickup,
  startRide,
  completeRide,
  fetchRideHistory,
} from '../services/ride.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

// GET /api/driver/ride/incoming
export const getIncomingRideHandler = async (req, res, next) => {
  try {
    const ride = await getIncomingRide(req.driver.id);
    return successResponse(res, ride, ride ? 'Incoming ride found' : 'No incoming ride');
  } catch (err) {
    next(err);
  }
};

// POST /api/driver/ride/accept
export const acceptRideHandler = async (req, res, next) => {
  try {
    const { rideId } = req.body;
    const ride = await acceptRide(rideId, req.driver.id);
    if (!ride) return errorResponse(res, 'Ride is no longer available', 409);
    return successResponse(res, ride, 'Ride accepted');
  } catch (err) {
    next(err);
  }
};

// POST /api/driver/ride/reject
export const rejectRideHandler = async (req, res, next) => {
  try {
    const { rideId } = req.body;
    await rejectRide(rideId, req.driver.id);
    return successResponse(res, null, 'Ride rejected');
  } catch (err) {
    next(err);
  }
};

// POST /api/driver/ride/reached-pickup
export const reachedPickupHandler = async (req, res, next) => {
  try {
    const { rideId } = req.body;
    const ride = await reachedPickup(rideId, req.driver.id);
    if (!ride) return errorResponse(res, 'Ride not found for this driver', 404);
    return successResponse(res, ride, 'Marked as arrived at pickup');
  } catch (err) {
    next(err);
  }
};

// POST /api/driver/ride/start
export const startRideHandler = async (req, res, next) => {
  try {
    const { rideId } = req.body;
    const ride = await startRide(rideId, req.driver.id);
    if (!ride) return errorResponse(res, 'Ride not found for this driver', 404);
    return successResponse(res, ride, 'Ride started');
  } catch (err) {
    next(err);
  }
};

// POST /api/driver/ride/complete
export const completeRideHandler = async (req, res, next) => {
  try {
    const { rideId } = req.body;
    const summary = await completeRide(rideId, req.driver.id);
    if (!summary) return errorResponse(res, 'Ride not found for this driver', 404);
    return successResponse(res, summary, 'Ride completed');
  } catch (err) {
    next(err);
  }
};

// GET /api/driver/ride/history?status=all|completed|cancelled
export const getRideHistoryHandler = async (req, res, next) => {
  try {
    const status = req.query.status || 'all';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const data = await fetchRideHistory(req.driver.id, status, page, limit);
    return successResponse(res, data, 'Ride history fetched');
  } catch (err) {
    next(err);
  }
};