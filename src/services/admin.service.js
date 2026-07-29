import bcrypt from 'bcryptjs';
import { findAdminByEmail, getRecentLogs, getDashboardCounts } from '../repositories/admin.repository.js';
import { generateAdminAccessToken } from '../config/jwt.js';

export const loginAdmin = async (email, password) => {
  const admin = await findAdminByEmail(email);
  if (!admin) return null;

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) return null;

  const token = generateAdminAccessToken({ id: admin.id, role: admin.role });
  return {
    token,
    admin: { id: admin.id, email: admin.email, fullName: admin.full_name, role: admin.role },
  };
};

export const fetchLogs = async (limit, level) => getRecentLogs(limit, level);

export const fetchDashboardStats = async () => getDashboardCounts();
import {
  getAllDrivers,
  getDriverFullDetail,
  setDriverVerification,
  suspendDriverAccount,
} from '../repositories/admin.repository.js';

export const fetchDrivers = async (search, status, page, limit) => {
  return getAllDrivers(search, status, page, limit);
};

export const fetchDriverDetail = async (driverId) => {
  return getDriverFullDetail(driverId);
};

export const verifyDriver = async (driverId, approve) => {
  await setDriverVerification(driverId, approve);
};

export const toggleDriverSuspension = async (driverId, suspend) => {
  await suspendDriverAccount(driverId, suspend);
};
import {
  getAllCustomers,
  getCustomerFullDetail,
  toggleCustomerBlock,
} from '../repositories/admin.repository.js';

export const fetchCustomers = async (search, status, page, limit) => {
  return getAllCustomers(search, status, page, limit);
};

export const fetchCustomerDetail = async (customerId) => {
  return getCustomerFullDetail(customerId);
};

export const blockCustomerAccount = async (customerId, block) => {
  await toggleCustomerBlock(customerId, block);
};