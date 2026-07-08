// All raw DB queries for OTP verification — nothing else touches this table.

import { pool } from '../config/db.js';

export const invalidatePreviousOtps = async (phone) => {
  await pool.query(
    'UPDATE otp_verifications SET is_used = true WHERE phone = $1 AND is_used = false',
    [phone]
  );
};

export const insertOtp = async (phone, otp, expiresAt) => {
  await pool.query(
    'INSERT INTO otp_verifications (phone, otp, expires_at) VALUES ($1, $2, $3)',
    [phone, otp, expiresAt]
  );
};

export const findValidOtp = async (phone, otp) => {
  const result = await pool.query(
    `SELECT id FROM otp_verifications
     WHERE phone = $1 AND otp = $2 AND is_used = false AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [phone, otp]
  );
  return result.rows[0] || null;
};

export const markOtpUsed = async (id) => {
  await pool.query('UPDATE otp_verifications SET is_used = true WHERE id = $1', [id]);
};