// Driver profile, document, and dashboard business logic.

import {
  findById,
  updateProfile,
  upsertDocumentSubmission,
  getDocumentStatus,
  setOnlineStatus,
  getTodaysRideStats,
  getTodaysEarnings,
} from '../repositories/driver.repository.js';

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
export const getProfile = async (driverId) => {
  const driver = await findById(driverId);
  return driver ? toPublicDriver(driver) : null;
};

export const setupProfile = async (driverId, data) => {
  const driver = await updateProfile(driverId, data);
  return toPublicDriver(driver);
};
export const submitDocuments = async (driverId) => {
  await upsertDocumentSubmission(driverId);
  return getDocumentStatus(driverId);
};

// ---- Phase 6 ----

// Toggles online/offline. The Flutter toggle just calls this with no
// body — it flips whatever the current state is.
export const toggleOnlineStatus = async (driverId) => {
  const driver = await findById(driverId);
  const newStatus = !driver.is_online;
  const updated = await setOnlineStatus(driverId, newStatus);
  return {
    isOnline: updated.is_online,
    onlineSince: updated.online_since,
  };
};

const minutesSince = (timestamp) => {
  if (!timestamp) return 0;
  const diffMs = Date.now() - new Date(timestamp).getTime();
  return Math.max(0, Math.floor(diffMs / 60000));
};

// Matches the Flutter DashboardStats entity: todaysEarnings, completedRides,
// distanceCoveredKm, onlineDuration (sent as minutes — Flutter side converts
// to a Duration).
export const getDashboardStats = async (driverId) => {
  const driver = await findById(driverId);
  const rideStats = await getTodaysRideStats(driverId);
  const todaysEarnings = await getTodaysEarnings(driverId);

  return {
    isOnline: driver.is_online,
    todaysEarnings,
    completedRides: rideStats.completed_rides,
    distanceCoveredKm: rideStats.distance_covered_km,
    onlineDurationMinutes: minutesSince(driver.online_since),
    rating: driver.rating,
  };
};