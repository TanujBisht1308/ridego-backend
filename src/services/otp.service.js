// OTP business logic: generation, "sending" (console in dev), and verification.
// No req/res here — this is pure logic the controller calls into.

import {
  invalidatePreviousOtps,
  insertOtp,
  findValidOtp,
  markOtpUsed,
} from '../repositories/otp.repository.js';

const OTP_EXPIRY_MINUTES = 5;

const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

// In development, OTP just prints to the terminal.
// In production, replace this with a real SMS gateway (MSG91, Twilio, etc.)
const sendSms = async (phone, otp) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] OTP for ${phone}: ${otp}`);
    return true;
  }
  // TODO: integrate SMS gateway here
  return true;
};

export const sendOtp = async (phone) => {
  await invalidatePreviousOtps(phone);

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await insertOtp(phone, otp, expiresAt);
  await sendSms(phone, otp);

  return true;
};

export const verifyOtp = async (phone, otp) => {
  const record = await findValidOtp(phone, otp);
  if (!record) return false;

  await markOtpUsed(record.id);
  return true;
};