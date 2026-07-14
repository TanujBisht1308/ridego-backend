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
export const updateFcmToken = async (customerId, token) => {
  await pool.query('UPDATE customers SET fcm_token = $1 WHERE id = $2', [token, customerId]);
};
export const getSavedPlaces = async (customerId) => {
  const result = await pool.query(
    `SELECT id, label, address, latitude, longitude, icon
     FROM customer_saved_places
     WHERE customer_id = $1
     ORDER BY created_at ASC`,
    [customerId]
  );
  return result.rows;
};

export const createSavedPlace = async (customerId, { label, address, latitude, longitude, icon }) => {
  const result = await pool.query(
    `INSERT INTO customer_saved_places (customer_id, label, address, latitude, longitude, icon)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, label, address, latitude, longitude, icon`,
    [customerId, label, address, latitude, longitude, icon || 'place']
  );
  return result.rows[0];
};

export const updateSavedPlaceById = async (customerId, placeId, fields) => {
  const setClauses = [];
  const values = [];
  let i = 1;

  for (const [key, value] of Object.entries(fields)) {
    setClauses.push(`${key} = $${i}`);
    values.push(value);
    i++;
  }
  values.push(customerId, placeId);

  const result = await pool.query(
    `UPDATE customer_saved_places
     SET ${setClauses.join(', ')}
     WHERE customer_id = $${i} AND id = $${i + 1}
     RETURNING id, label, address, latitude, longitude, icon`,
    values
  );
  return result.rows[0] || null;
};

export const deleteSavedPlaceById = async (customerId, placeId) => {
  await pool.query(
    'DELETE FROM customer_saved_places WHERE customer_id = $1 AND id = $2',
    [customerId, placeId]
  );
};