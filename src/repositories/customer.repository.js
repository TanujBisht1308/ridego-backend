import { pool } from '../config/db.js';

export const findByPhone = async (phone) => {
  const result = await pool.query('SELECT * FROM customers WHERE phone = $1', [phone]);
  return result.rows[0] || null;
};

export const findById = async (id) => {
  const result = await pool.query(
    'SELECT id, phone, full_name, email, rating, wallet_balance FROM customers WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

export const createCustomer = async (phone) => {
  const result = await pool.query(
    'INSERT INTO customers (phone) VALUES ($1) RETURNING *',
    [phone]
  );
  return result.rows[0];
};

export const updateProfile = async (customerId, { fullName, email }) => {
  const result = await pool.query(
    `UPDATE customers SET full_name = $1, email = $2, updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [fullName, email || null, customerId]
  );
  return result.rows[0];
};