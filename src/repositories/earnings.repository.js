// All raw DB queries for earnings + transaction history.
import { pool } from '../config/db.js';

export const createEarningForRide = async ({
  driverId,
  rideId,
  rideFare,
  incentives = 0,
  tips = 0,
  deductions = 0,
}) => {
  const totalAmount = rideFare + incentives + tips - deductions;
  const result = await pool.query(
    `INSERT INTO earnings (driver_id, ride_id, ride_fare, incentives, tips, deductions, total_amount)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [driverId, rideId, rideFare, incentives, tips, deductions, totalAmount]
  );
  return result.rows[0];
};

// ---- Phase 8 additions ----

const dateFilter = (filter) => {
  switch (filter) {
    case 'weekly':
      return `AND earned_at >= date_trunc('week', NOW())`;
    case 'monthly':
      return `AND earned_at >= date_trunc('month', NOW())`;
    default: // daily
      return `AND earned_at::date = CURRENT_DATE`;
  }
};

export const getEarningsSummary = async (driverId, filter = 'daily') => {
  const dateClause = dateFilter(filter);
  const result = await pool.query(
    `SELECT
       COALESCE(SUM(ride_fare), 0)::float        AS ride_fare,
       COALESCE(SUM(incentives), 0)::float       AS incentives,
       COALESCE(SUM(tips), 0)::float             AS tips,
       COALESCE(SUM(deductions), 0)::float       AS deductions,
       COALESCE(SUM(total_amount), 0)::float     AS total_earnings,
       COUNT(*)::int                             AS total_rides
     FROM earnings
     WHERE driver_id = $1 ${dateClause}`,
    [driverId]
  );
  return result.rows[0];
};

export const getTransactions = async (driverId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const result = await pool.query(
    `SELECT
       e.id,
       e.ride_id,
       e.total_amount AS fare,
       e.payment_method,
       e.earned_at    AS date,
       r.passenger_name,
       r.pickup_address,
       r.drop_address
     FROM earnings e
     LEFT JOIN rides r ON r.id = e.ride_id
     WHERE e.driver_id = $1
     ORDER BY e.earned_at DESC
     LIMIT $2 OFFSET $3`,
    [driverId, limit, offset]
  );

  const countResult = await pool.query(
    'SELECT COUNT(*)::int AS total FROM earnings WHERE driver_id = $1',
    [driverId]
  );

  return {
    transactions: result.rows,
    totalCount: countResult.rows[0].total,
    page,
    limit,
  };
};