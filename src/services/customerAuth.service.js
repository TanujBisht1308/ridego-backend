import { findByPhone, createCustomer } from '../repositories/customer.repository.js';
import {
  saveRefreshToken,
  findValidRefreshToken,
  revokeRefreshToken,
} from '../repositories/customerToken.repository.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshTokenSignature,
} from '../config/jwt.js';
import { sendOtp as sendOtpCode, verifyOtp as verifyOtpCode } from './otp.service.js';

const REFRESH_TOKEN_DAYS = 7;

const toPublicCustomer = (customer) => ({
  id: customer.id,
  phoneNumber: customer.phone,
  fullName: customer.full_name,
  email: customer.email,
  rating: Number(customer.rating),
  walletBalance: Number(customer.wallet_balance),
  isProfileComplete: !!customer.full_name,
});

// role: 'customer' in the JWT payload keeps customer tokens from working
// on driver endpoints and vice versa, even though they share one secret.
const issueTokens = async (customerId) => {
  const accessToken = generateAccessToken({ id: customerId, role: 'customer' });
  const refreshToken = generateRefreshToken({ id: customerId, role: 'customer' });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);
  await saveRefreshToken(customerId, refreshToken, expiresAt);

  return { accessToken, refreshToken };
};

export const sendCustomerOtp = (phone) => sendOtpCode(phone);

export const verifyCustomerOtp = async (phone, otp) => {
  const isValid = await verifyOtpCode(phone, otp);
  if (!isValid) return null;

  let customer = await findByPhone(phone);
  if (!customer) {
    customer = await createCustomer(phone);
  }

  const tokens = await issueTokens(customer.id);
  return { ...tokens, customer: toPublicCustomer(customer) };
};

export const refreshCustomerTokens = async (refreshToken) => {
  const decoded = verifyRefreshTokenSignature(refreshToken);
  if (decoded.role !== 'customer') return null;

  const stored = await findValidRefreshToken(refreshToken);
  if (!stored) return null;

  await revokeRefreshToken(refreshToken);
  return issueTokens(stored.customer_id);
};

export const logoutCustomer = async (refreshToken) => {
  if (refreshToken) await revokeRefreshToken(refreshToken);
};