// All raw DB queries for rides.

import { pool } from '../config/db.js';

export const findNextPendingRide = async (driverId, driverVehicleType) => {
  const result = await pool.query(
    `SELECT * FROM rides
     WHERE status = 'pending'
       AND vehicle_type = $2
       AND id NOT IN (SELECT ride_id FROM ride_rejections WHERE driver_id = $1)
     ORDER BY requested_at ASC
     LIMIT 1`,
    [driverId, driverVehicleType]
  );
  return result.rows[0] || null;
};
export const findRideById = async (rideId) => {
  const result = await pool.query('SELECT * FROM rides WHERE id = $1', [rideId]);
  return result.rows[0] || null;
};

export const assignDriverToRide = async (rideId, driverId) => {
  const result = await pool.query(
    `UPDATE rides
     SET driver_id = $1, status = 'accepted', accepted_at = NOW()
     WHERE id = $2 AND status = 'pending'
     RETURNING *`,
    [driverId, rideId]
  );
  return result.rows[0] || null;
};

export const rejectRideForDriver = async (rideId, driverId) => {
  await pool.query(
    `INSERT INTO ride_rejections (ride_id, driver_id)
     VALUES ($1, $2)
     ON CONFLICT (ride_id, driver_id) DO NOTHING`,
    [rideId, driverId]
  );
};

export const markArrived = async (rideId, driverId) => {
  const result = await pool.query(
    `UPDATE rides SET status = 'driverArrived', arrived_at = NOW()
     WHERE id = $1 AND driver_id = $2
     RETURNING *`,
    [rideId, driverId]
  );
  return result.rows[0] || null;
};

export const markStarted = async (rideId, driverId) => {
  const result = await pool.query(
    `UPDATE rides SET status = 'inProgress', started_at = NOW()
     WHERE id = $1 AND driver_id = $2
     RETURNING *`,
    [rideId, driverId]
  );
  return result.rows[0] || null;
};

export const markCompleted = async (rideId, driverId, finalFare) => {
  const result = await pool.query(
    `UPDATE rides SET status = 'completed', completed_at = NOW(), final_fare = $3
     WHERE id = $1 AND driver_id = $2
     RETURNING *`,
    [rideId, driverId, finalFare]
  );
  return result.rows[0] || null;
};
// ---- Phase 8 additions ----

export const getRideHistory = async (driverId, status, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const statusClause =
    status === 'all'
      ? `AND status IN ('completed', 'cancelled')`
      : `AND status = $2`;

  const params =
    status === 'all'
      ? [driverId, limit, offset]
      : [driverId, status, limit, offset];

  const limitParam = status === 'all' ? '$2' : '$3';
  const offsetParam = status === 'all' ? '$3' : '$4';

  const result = await pool.query(
    `SELECT
       id            AS "rideId",
       passenger_name AS "passengerName",
       pickup_address AS "pickupAddress",
       drop_address   AS "dropAddress",
       final_fare     AS fare,
       distance_km    AS "distanceKm",
       duration_minutes AS "durationMinutes",
       completed_at   AS date,
       status
     FROM rides
     WHERE driver_id = $1
       ${statusClause}
     ORDER BY COALESCE(completed_at, created_at) DESC
     LIMIT ${limitParam} OFFSET ${offsetParam}`,
    params
  );

  const countParams = status === 'all' ? [driverId] : [driverId, status];
  const countClause =
    status === 'all'
      ? `AND status IN ('completed', 'cancelled')`
      : `AND status = $2`;

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM rides WHERE driver_id = $1 ${countClause}`,
    countParams
  );

  return {
    rides: result.rows,
    totalCount: countResult.rows[0].total,
    page,
    limit,
  };
};