// All raw DB queries for refresh tokens.

import { pool } from '../config/db.js';

export const saveRefreshToken = async (driverId, token, expiresAt) => {
  await pool.query(
    `INSERT INTO refresh_tokens (driver_id, token, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (token) DO NOTHING`,
    [driverId, token, expiresAt]
  );
};

export const findValidRefreshToken = async (token) => {
  const result = await pool.query(
    `SELECT rt.*, d.id as driver_id
     FROM refresh_tokens rt
     JOIN drivers d ON d.id = rt.driver_id
     WHERE rt.token = $1 AND rt.expires_at > NOW()`,
    [token]
  );
  return result.rows[0] || null;
};

export const revokeRefreshToken = async (token) => {
  await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
};