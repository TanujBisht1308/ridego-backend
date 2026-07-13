// All raw DB queries for the drivers table + dashboard aggregates.

import { pool } from '../config/db.js';

export const findByPhone = async (phone) => {
  const result = await pool.query('SELECT * FROM drivers WHERE phone = $1', [phone]);
  return result.rows[0] || null;
};
export const findById = async (id) => {
  const result = await pool.query(
    `SELECT
       d.id, d.phone, d.full_name, d.email, d.vehicle_number,
       d.vehicle_type, d.is_verified, d.is_online, d.online_since,
       d.rating, d.total_rides, d.created_at,
       CASE WHEN dd.id IS NOT NULL THEN true ELSE false END AS is_document_submitted
     FROM drivers d
     LEFT JOIN driver_documents dd ON dd.driver_id = d.id
     WHERE d.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};
export const createDriver = async (phone) => {
  const result = await pool.query(
    'INSERT INTO drivers (phone) VALUES ($1) RETURNING *',
    [phone]
  );
  return result.rows[0];
};

export const createDefaultSettings = async (driverId) => {
  await pool.query('INSERT INTO driver_settings (driver_id) VALUES ($1)', [driverId]);
};

export const updateProfile = async (driverId, { fullName, email, vehicleNumber, vehicleType }) => {
  const result = await pool.query(
    `UPDATE drivers
     SET full_name = $1, email = $2, vehicle_number = $3, vehicle_type = $4, updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [fullName, email || null, vehicleNumber, vehicleType || 'sedan', driverId]
  );
  return result.rows[0];
};
export const upsertDocumentSubmission = async (driverId) => {
  await pool.query(
    `INSERT INTO driver_documents (driver_id, status, submitted_at)
     VALUES ($1, 'pending', NOW())
     ON CONFLICT (driver_id)
     DO UPDATE SET status = 'pending', submitted_at = NOW()`,
    [driverId]
  );
};

export const getDocumentStatus = async (driverId) => {
  const result = await pool.query(
    'SELECT status, submitted_at, reviewed_at FROM driver_documents WHERE driver_id = $1',
    [driverId]
  );
  return result.rows[0] || null;
};

// ---- Phase 6 additions ----

// Flips is_online and stamps/clears online_since accordingly.
// Returns the updated row so the caller can read the new state back.
export const setOnlineStatus = async (driverId, isOnline) => {
  const result = await pool.query(
    `UPDATE drivers
     SET is_online = $1,
         online_since = CASE WHEN $1 = true THEN NOW() ELSE NULL END,
         updated_at = NOW()
     WHERE id = $2
     RETURNING id, is_online, online_since`,
    [isOnline, driverId]
  );
  return result.rows[0];
};

// Today's completed rides count + distance, for this driver.
export const getTodaysRideStats = async (driverId) => {
  const result = await pool.query(
    `SELECT
       COUNT(*)::int AS completed_rides,
       COALESCE(SUM(distance_km), 0)::float AS distance_covered_km
     FROM rides
     WHERE driver_id = $1
       AND status = 'completed'
       AND completed_at::date = CURRENT_DATE`,
    [driverId]
  );
  return result.rows[0];
};

// Today's total earnings for this driver.
export const getTodaysEarnings = async (driverId) => {
  const result = await pool.query(
    `SELECT COALESCE(SUM(total_amount), 0)::float AS todays_earnings
     FROM earnings
     WHERE driver_id = $1
       AND earned_at::date = CURRENT_DATE`,
    [driverId]
  );
  return result.rows[0].todays_earnings;
};
export const incrementTotalRides = async (driverId) => {
  await pool.query('UPDATE drivers SET total_rides = total_rides + 1 WHERE id = $1', [driverId]);
};
export const updateFcmToken = async (driverId, token) => {
  await pool.query('UPDATE drivers SET fcm_token = $1 WHERE id = $2', [token, driverId]);
};