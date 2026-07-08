import { pool } from '../config/db.js';

export const createRideRequest = async (ride) => {
  const result = await pool.query(
    `INSERT INTO rides (
       passenger_id, passenger_name, passenger_phone, passenger_rating,
       pickup_address, pickup_lat, pickup_lng,
       drop_address, drop_lat, drop_lng,
       estimated_fare, distance_km, duration_minutes,
       vehicle_type, payment_method, status
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'pending')
     RETURNING *`,
    [
      ride.passengerId, ride.passengerName, ride.passengerPhone, ride.passengerRating,
      ride.pickupAddress, ride.pickupLat, ride.pickupLng,
      ride.dropAddress, ride.dropLat, ride.dropLng,
      ride.estimatedFare, ride.distanceKm, ride.durationMinutes,
      ride.vehicleType, ride.paymentMethod,
    ]
  );
  return result.rows[0];
};

// The customer's currently active ride, if any — joined with driver info
// once one has been assigned, so the app can show DriverAssigned/LiveTracking.
export const findActiveRideForCustomer = async (customerId) => {
  const result = await pool.query(
    `SELECT r.*, d.full_name AS driver_name, d.vehicle_number AS driver_vehicle_number,
            d.rating AS driver_rating, d.phone AS driver_phone
     FROM rides r
     LEFT JOIN drivers d ON d.id = r.driver_id
     WHERE r.passenger_id = $1
       AND r.status IN ('pending', 'accepted', 'driverArrived', 'inProgress')
     ORDER BY r.requested_at DESC
     LIMIT 1`,
    [customerId]
  );
  return result.rows[0] || null;
};

export const findRideByIdForCustomer = async (rideId, customerId) => {
  const result = await pool.query(
    `SELECT r.*, d.full_name AS driver_name, d.vehicle_number AS driver_vehicle_number,
            d.rating AS driver_rating, d.phone AS driver_phone
     FROM rides r
     LEFT JOIN drivers d ON d.id = r.driver_id
     WHERE r.id = $1 AND r.passenger_id = $2`,
    [rideId, customerId]
  );
  return result.rows[0] || null;
};

export const cancelRideForCustomer = async (rideId, customerId) => {
  const result = await pool.query(
    `UPDATE rides SET status = 'cancelled'
     WHERE id = $1 AND passenger_id = $2 AND status IN ('pending', 'accepted')
     RETURNING *`,
    [rideId, customerId]
  );
  return result.rows[0] || null;
};

export const rateRide = async (rideId, customerId, rating, review) => {
  const result = await pool.query(
    `UPDATE rides SET customer_rating = $1, customer_review = $2
     WHERE id = $3 AND passenger_id = $4 AND status = 'completed'
     RETURNING *`,
    [rating, review || null, rideId, customerId]
  );
  return result.rows[0] || null;
};

export const getCustomerRideHistory = async (customerId, status, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const statusClause = status === 'all'
    ? `AND status IN ('completed', 'cancelled')`
    : `AND status = $2`;
  const params = status === 'all'
    ? [customerId, limit, offset]
    : [customerId, status, limit, offset];
  const limitIdx = status === 'all' ? '$2' : '$3';
  const offsetIdx = status === 'all' ? '$3' : '$4';

  const result = await pool.query(
    `SELECT id AS "rideId", driver_id AS "driverId", pickup_address AS "pickupAddress",
            drop_address AS "dropAddress", final_fare AS fare, distance_km AS "distanceKm",
            duration_minutes AS "durationMinutes", completed_at AS date, status
     FROM rides
     WHERE passenger_id = $1 ${statusClause}
     ORDER BY COALESCE(completed_at, created_at) DESC
     LIMIT ${limitIdx} OFFSET ${offsetIdx}`,
    params
  );

  const countParams = status === 'all' ? [customerId] : [customerId, status];
  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM rides WHERE passenger_id = $1 ${statusClause}`,
    countParams
  );

  return { rides: result.rows, totalCount: countResult.rows[0].total, page, limit };
};

// Recomputes a driver's average rating from all their rated completed rides.
export const recalculateDriverRating = async (driverId) => {
  await pool.query(
    `UPDATE drivers SET rating = (
       SELECT COALESCE(AVG(customer_rating), 5.0) FROM rides
       WHERE driver_id = $1 AND customer_rating IS NOT NULL
     ) WHERE id = $1`,
    [driverId]
  );
};