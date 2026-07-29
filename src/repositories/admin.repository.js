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
export const getAllDrivers = async (search, status, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let i = 1;

  if (search) {
    conditions.push(`(full_name ILIKE $${i} OR phone ILIKE $${i} OR vehicle_number ILIKE $${i})`);
    values.push(`%${search}%`);
    i++;
  }
  if (status === 'online') {
    conditions.push('is_online = true');
  } else if (status === 'offline') {
    conditions.push('is_online = false');
  } else if (status === 'pending_verification') {
    conditions.push('is_verified = false');
  } else if (status === 'verified') {
    conditions.push('is_verified = true');
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT id, phone, full_name, email, vehicle_number, vehicle_type,
            is_verified, is_online, rating, total_rides, created_at
     FROM drivers
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    [...values, limit, offset]
  );

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM drivers ${whereClause}`,
    values
  );

  return { drivers: result.rows, total: countResult.rows[0].total };
};

export const getDriverFullDetail = async (driverId) => {
  const driver = await pool.query('SELECT * FROM drivers WHERE id = $1', [driverId]);
  if (!driver.rows[0]) return null;

  const documents = await pool.query('SELECT * FROM driver_documents WHERE driver_id = $1', [driverId]);
  const earnings = await pool.query(
    `SELECT COALESCE(SUM(total_amount), 0)::float AS total_earnings, COUNT(*)::int AS total_rides
     FROM earnings WHERE driver_id = $1`,
    [driverId]
  );
  const recentRides = await pool.query(
    `SELECT id, passenger_name, pickup_address, drop_address, final_fare, status, completed_at
     FROM rides WHERE driver_id = $1 ORDER BY created_at DESC LIMIT 10`,
    [driverId]
  );

  return {
    driver: driver.rows[0],
    documents: documents.rows[0] || null,
    earnings: earnings.rows[0],
    recentRides: recentRides.rows,
  };
};

export const setDriverVerification = async (driverId, isVerified) => {
  await pool.query('UPDATE drivers SET is_verified = $1 WHERE id = $2', [isVerified, driverId]);
};

export const suspendDriverAccount = async (driverId, suspended) => {
  await pool.query(
    'UPDATE drivers SET is_online = false, is_suspended = $1 WHERE id = $2',
    [suspended, driverId]
  );
};
export const getAllCustomers = async (search, status, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let i = 1;

  if (search) {
    conditions.push(`(full_name ILIKE $${i} OR phone ILIKE $${i} OR email ILIKE $${i})`);
    values.push(`%${search}%`);
    i++;
  }
  if (status === 'blocked') {
    conditions.push('is_blocked = true');
  } else if (status === 'active') {
    conditions.push('is_blocked = false');
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT id, phone, full_name, email, wallet_balance, is_blocked, created_at
     FROM customers
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    [...values, limit, offset]
  );

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM customers ${whereClause}`,
    values
  );

  return { customers: result.rows, total: countResult.rows[0].total };
};

export const getCustomerFullDetail = async (customerId) => {
  const customer = await pool.query('SELECT * FROM customers WHERE id = $1', [customerId]);
  if (!customer.rows[0]) return null;

  const rideStats = await pool.query(
    `SELECT COUNT(*)::int AS total_rides,
            COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_rides,
            COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled_rides
     FROM rides WHERE passenger_id = $1`,
    [customerId]
  );

  const recentRides = await pool.query(
    `SELECT id, pickup_address, drop_address, final_fare, status, completed_at
     FROM rides WHERE passenger_id = $1 ORDER BY created_at DESC LIMIT 10`,
    [customerId]
  );

  const walletTransactions = await pool.query(
    `SELECT id, type, amount, description, created_at
     FROM wallet_transactions WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 10`,
    [customerId]
  );

  return {
    customer: customer.rows[0],
    rideStats: rideStats.rows[0],
    recentRides: recentRides.rows,
    walletTransactions: walletTransactions.rows,
  };
};

export const toggleCustomerBlock = async (customerId, blocked) => {
  await pool.query('UPDATE customers SET is_blocked = $1 WHERE id = $2', [blocked, customerId]);
};