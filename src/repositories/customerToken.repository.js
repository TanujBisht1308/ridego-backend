import { pool } from '../config/db.js';

export const saveRefreshToken = async (customerId, token, expiresAt) => {
  await pool.query(
    `INSERT INTO customer_refresh_tokens (customer_id, token, expires_at)
     VALUES ($1, $2, $3) ON CONFLICT (token) DO NOTHING`,
    [customerId, token, expiresAt]
  );
};

export const findValidRefreshToken = async (token) => {
  const result = await pool.query(
    `SELECT crt.*, c.id as customer_id FROM customer_refresh_tokens crt
     JOIN customers c ON c.id = crt.customer_id
     WHERE crt.token = $1 AND crt.expires_at > NOW()`,
    [token]
  );
  return result.rows[0] || null;
};

export const revokeRefreshToken = async (token) => {
  await pool.query('DELETE FROM customer_refresh_tokens WHERE token = $1', [token]);
};