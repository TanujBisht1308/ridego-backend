import { findVehicleType, VEHICLE_TYPES, fareRange } from '../config/vehicleTypes.js';
import { distanceKm, estimateDurationMinutes, DEFAULT_DEMO_DISTANCE_KM } from '../utils/geo.js';
import {
  createRideRequest,
  findActiveRideForCustomer,
  findRideByIdForCustomer,
  cancelRideForCustomer,
  rateRide,
  getCustomerRideHistory,
  recalculateDriverRating,
} from '../repositories/customerRide.repository.js';

import { findById as findCustomerById } from '../repositories/customer.repository.js';

import { notifyNewRideToDrivers } from '../sockets/socketManager.js';
import { verifyRideOtpAndStart } from '../repositories/ride.repository.js';

const computeTrip = (pickupLat, pickupLng, dropLat, dropLng) => {
  const hasCoords = [pickupLat, pickupLng, dropLat, dropLng].every((v) => typeof v === 'number');
  const km = hasCoords ? distanceKm(pickupLat, pickupLng, dropLat, dropLng) : DEFAULT_DEMO_DISTANCE_KM;
  const minutes = estimateDurationMinutes(km);
  return { km: Number(km.toFixed(1)), minutes };
};

// Matches the customer app's VehicleSelectionScreen — one entry per
// vehicle type with a price range, ETA, and seat count.
export const getFareEstimate = async ({ pickupLat, pickupLng, dropLat, dropLng }) => {
  const { km, minutes } = computeTrip(pickupLat, pickupLng, dropLat, dropLng);

  return {
    distanceKm: km,
    durationMinutes: minutes,
    vehicles: VEHICLE_TYPES.map((v) => {
      const { min, max } = fareRange(v, km, minutes);
      return {
        id: v.id,
        name: v.name,
        priceMin: min,
        priceMax: max,
        etaMinutes: v.etaMinutes,
        seats: v.seats,
      };
    }),
  };
};

const toRideJson = (row) => ({
  rideId: row.id,
  status: row.status,
  pickupLocation: { address: row.pickup_address, latitude: Number(row.pickup_lat), longitude: Number(row.pickup_lng) },
  dropLocation: { address: row.drop_address, latitude: Number(row.drop_lat), longitude: Number(row.drop_lng) },
  vehicleType: row.vehicle_type,
  estimatedFare: Number(row.estimated_fare),
  finalFare: row.final_fare != null ? Number(row.final_fare) : null,
  distanceKm: Number(row.distance_km),
  durationMinutes: row.duration_minutes,
  paymentMethod: row.payment_method,
  rideotp: row.ride_otp,
  requestedAt: row.requested_at,
  acceptedAt: row.accepted_at,
  arrivedAt: row.arrived_at,
  startedAt: row.started_at,
  completedAt: row.completed_at,
  driver: row.driver_id
    ? {
        id: row.driver_id,
        name: row.driver_name,
        vehicleNumber: row.driver_vehicle_number,
        rating: row.driver_rating != null ? Number(row.driver_rating) : null,
        phone: row.driver_phone,
      }
    : null,
});
export const requestRide = async (customerId, data) => {
  const vehicle = findVehicleType(data.vehicleType);
  if (!vehicle) throw Object.assign(new Error('Invalid vehicle type'), { statusCode: 400 });

  const customer = await findCustomerById(customerId);
  const { km, minutes } = computeTrip(data.pickupLat, data.pickupLng, data.dropLat, data.dropLng);
  const { estimated } = fareRange(vehicle, km, minutes);

  const ride = await createRideRequest({
    passengerId: customerId,
    passengerName: customer.full_name || 'Rider',
    passengerPhone: customer.phone,
    passengerRating: customer.rating,
    pickupAddress: data.pickupAddress,
    pickupLat: data.pickupLat ?? null,
    pickupLng: data.pickupLng ?? null,
    dropAddress: data.dropAddress,
    dropLat: data.dropLat ?? null,
    dropLng: data.dropLng ?? null,
    estimatedFare: estimated,
    distanceKm: km,
    durationMinutes: minutes,
    vehicleType: data.vehicleType,
    paymentMethod: data.paymentMethod || 'Cash',
  });

  notifyNewRideToDrivers(data.vehicleType, toRideJson(ride));
  return toRideJson(ride);
};
export const getActiveRide = async (customerId) => {
  const ride = await findActiveRideForCustomer(customerId);
  return ride ? toRideJson(ride) : null;
};

export const getRideStatus = async (rideId, customerId) => {
  const ride = await findRideByIdForCustomer(rideId, customerId);
  return ride ? toRideJson(ride) : null;
};

export const cancelRide = async (rideId, customerId) => {
  const ride = await cancelRideForCustomer(rideId, customerId);
  return ride ? toRideJson(ride) : null;
};

export const submitRating = async (rideId, customerId, rating, review) => {
  const ride = await rateRide(rideId, customerId, rating, review);
  if (!ride) return null;
  if (ride.driver_id) await recalculateDriverRating(ride.driver_id);
  return toRideJson(ride);
};

export const fetchCustomerRideHistory = async (customerId, status, page, limit) => {
  const result = await getCustomerRideHistory(customerId, status, page, limit);
  return {
    ...result,
    rides: result.rides.map((r) => ({
      ...r,
      fare: r.fare ? Number(r.fare) : null,
      distanceKm: r.distanceKm ? Number(r.distanceKm) : null,
    })),
  };
};