import { pool } from '../config/db.js';

export const findAdminByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const findAdminById = async (id) => {
  const result = await pool.query('SELECT id, email, full_name, role FROM admins WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const getRecentLogs = async (limit = 100, level = null) => {
  const query = level
    ? { text: 'SELECT * FROM system_logs WHERE level = $1 ORDER BY created_at DESC LIMIT $2', values: [level, limit] }
    : { text: 'SELECT * FROM system_logs ORDER BY created_at DESC LIMIT $1', values: [limit] };
  const result = await pool.query(query);
  return result.rows;
};

export const getDashboardCounts = async () => {
  const [rides, drivers, customers, onlineDrivers] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'completed')::int AS completed, COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled FROM rides WHERE created_at::date = CURRENT_DATE`),
    pool.query('SELECT COUNT(*)::int AS total FROM drivers'),
    pool.query('SELECT COUNT(*)::int AS total FROM customers'),
    pool.query('SELECT COUNT(*)::int AS total FROM drivers WHERE is_online = true'),
  ]);
  return {
    todayRides: rides.rows[0],
    totalDrivers: drivers.rows[0].total,
    totalCustomers: customers.rows[0].total,
    onlineDrivers: onlineDrivers.rows[0].total,
  };
};