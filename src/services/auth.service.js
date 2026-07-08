// Login/register + token lifecycle logic. Controllers stay thin and just
// call these functions and shape the HTTP response.

import {
  findByPhone,
  createDriver,
  createDefaultSettings,
} from '../repositories/driver.repository.js';
import {
  saveRefreshToken,
  findValidRefreshToken,
  revokeRefreshToken,
} from '../repositories/token.repository.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshTokenSignature,
} from '../config/jwt.js';

const REFRESH_TOKEN_DAYS = 7;

const toPublicDriver = (driver) => ({
  id: driver.id,
  phoneNumber: driver.phone,
  fullName: driver.full_name,
  email: driver.email,
  vehicleNumber: driver.vehicle_number,
  vehicleType: driver.vehicle_type || 'sedan',
  memberSince: driver.created_at,              // ← add this
  rating: Number(driver.rating) || 0,          // ← add this too
  totalRides: driver.total_rides || 0,         // ← and this
  isProfileComplete: !!(driver.full_name && driver.vehicle_number),
  isDocumentVerified: driver.is_verified,
  isDocumentSubmitted: driver.is_document_submitted ?? false,
});
const issueTokens = async (driverId) => {
  const accessToken = generateAccessToken({ id: driverId });
  const refreshToken = generateRefreshToken({ id: driverId });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);
  await saveRefreshToken(driverId, refreshToken, expiresAt);

  return { accessToken, refreshToken };
};

// Called after OTP is verified — creates the driver if new, logs in if returning.
export const loginOrRegister = async (phone) => {
  let driver = await findByPhone(phone);

  if (!driver) {
    driver = await createDriver(phone);
    await createDefaultSettings(driver.id);
  }

  const tokens = await issueTokens(driver.id);

  return {
    ...tokens,
    driver: toPublicDriver(driver),
  };
};

export const refreshTokens = async (refreshToken) => {
  // Verify signature first — cheap check before hitting the DB
  verifyRefreshTokenSignature(refreshToken);

  const stored = await findValidRefreshToken(refreshToken);
  if (!stored) return null;

  await revokeRefreshToken(refreshToken);
  return issueTokens(stored.driver_id);
};

export const logout = async (refreshToken) => {
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }
};