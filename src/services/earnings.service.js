// Earnings + transaction business logic.
import {
  getEarningsSummary,
  getTransactions,
} from '../repositories/earnings.repository.js';

const VALID_FILTERS = ['daily', 'weekly', 'monthly'];

export const getEarnings = async (driverId, filter = 'daily') => {
  const safeFilter = VALID_FILTERS.includes(filter) ? filter : 'daily';
  const summary = await getEarningsSummary(driverId, safeFilter);

  return {
    filter: safeFilter,
    totalEarnings: summary.total_earnings,
    totalRides: summary.total_rides,
    rideFare: summary.ride_fare,
    incentives: summary.incentives,
    tips: summary.tips,
    deductions: summary.deductions,
    totalEarningsAfterDeductions: summary.total_earnings,
    paymentMethod: 'Cash',
  };
};

export const fetchTransactions = async (driverId, page, limit) => {
  const result = await getTransactions(driverId, page, limit);
  return {
    ...result,
    transactions: result.transactions.map((t) => ({
      rideId: t.ride_id,
      passengerName: t.passenger_name,
      pickupAddress: t.pickup_address,
      dropAddress: t.drop_address,
      fare: Number(t.fare),
      date: t.date,
      paymentMethod: t.payment_method || 'Cash',
    })),
  };
};