import {
  findNextPendingRide,
  findRideById,
  assignDriverToRide,
  rejectRideForDriver,
  markArrived,
  verifyRideOtpAndStart,
  markCompleted,
  getRideHistory,
} from '../repositories/ride.repository.js';
import { notifyCustomerRideUpdate, notifyRideTaken } from '../sockets/socketManager.js';

import { createEarningForRide } from '../repositories/earnings.repository.js';
import { incrementTotalRides } from '../repositories/driver.repository.js';
import { findById as findDriverById } from '../repositories/driver.repository.js';
const toRideJson = (row) => ({
  rideId: row.id,
  passengerId: row.passenger_id,
  passengerName: row.passenger_name,
  passengerRating: Number(row.passenger_rating),
  passengerAvatarUrl: null,
  pickupLocation: {
    address: row.pickup_address,
    latitude: Number(row.pickup_lat),
    longitude: Number(row.pickup_lng),
  },
  dropLocation: {
    address: row.drop_address,
    latitude: Number(row.drop_lat),
    longitude: Number(row.drop_lng),
  },
  estimatedFare: Number(row.estimated_fare),
  distanceKm: Number(row.distance_km),
  estimatedDurationMinutes: row.duration_minutes,
  paymentMethod: row.payment_method,
  status: row.status,
  requestedAt: row.requested_at,
  acceptedAt: row.accepted_at,
  arrivedAt: row.arrived_at,
  startedAt: row.started_at,
  completedAt: row.completed_at,
  rideOtp: row.ride_otp,
});

export const getIncomingRide = async (driverId) => {
  const driver = await findDriverById(driverId);
  if (!driver.vehicle_type) return null; // driver hasn't set a vehicle type yet

  const ride = await findNextPendingRide(driverId, driver.vehicle_type);
  return ride ? toRideJson(ride) : null;
};

export const acceptRide = async (rideId, driverId) => {
  const ride = await assignDriverToRide(rideId, driverId);
  if (!ride) return null;
  const rideJson = toRideJson(ride);
  notifyCustomerRideUpdate(ride.passenger_id, rideJson);
  notifyRideTaken(ride.vehicle_type, rideId);
  return rideJson;
};

export const rejectRide = async (rideId, driverId) => {
  await rejectRideForDriver(rideId, driverId);
};

export const reachedPickup = async (rideId, driverId) => {
  const ride = await markArrived(rideId, driverId);
  if (!ride) return null;
  const rideJson = toRideJson(ride);
  notifyCustomerRideUpdate(ride.passenger_id, rideJson);
  return rideJson;
};

export const startRide = async (rideId, driverId, otp) => {
  const ride = await verifyRideOtpAndStart(rideId, driverId, otp);
  if (!ride) return null;
  const rideJson = toRideJson(ride);
  notifyCustomerRideUpdate(ride.passenger_id, rideJson);
  return rideJson;
};
export const completeRide = async (rideId, driverId) => {
  const ride = await findRideById(rideId);
  if (!ride || ride.driver_id !== driverId) return null;

  const finalFare = Number(ride.estimated_fare);
  const completed = await markCompleted(rideId, driverId, finalFare);
  await createEarningForRide({ driverId, rideId, rideFare: finalFare });
  await incrementTotalRides(driverId);

  const summary = {
    rideId: completed.id,
    totalFare: finalFare,
    rideFare: finalFare,
    incentives: 0,
    tips: 0,
    deductions: 0,
    totalEarnings: finalFare,
    distanceKm: Number(completed.distance_km),
    durationMinutes: completed.duration_minutes,
    paymentMethod: completed.payment_method,
    passengerName: completed.passenger_name,
    completedAt: completed.completed_at,
  };

  notifyCustomerRideUpdate(completed.passenger_id, { ...summary, status: 'completed' });
  return summary;
};
export const fetchRideHistory = async (driverId, status, page, limit) => {
  const result = await getRideHistory(driverId, status, page, limit);
  return {
    ...result,
    rides: result.rides.map((r) => ({
      ...r,
      fare: r.fare ? Number(r.fare) : null,
      distanceKm: r.distanceKm ? Number(r.distanceKm) : null,
    })),
  };
};