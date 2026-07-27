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