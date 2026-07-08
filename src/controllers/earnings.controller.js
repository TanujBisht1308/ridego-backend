import { getEarnings, fetchTransactions } from '../services/earnings.service.js';
import { successResponse } from '../utils/response.js';

// GET /api/driver/earnings?filter=daily|weekly|monthly
export const getEarningsHandler = async (req, res, next) => {
  try {
    const filter = req.query.filter || 'daily';
    const data = await getEarnings(req.driver.id, filter);
    return successResponse(res, data, 'Earnings fetched');
  } catch (err) {
    next(err);
  }
};

// GET /api/driver/earnings/transactions?page=1&limit=20
export const getTransactionsHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const data = await fetchTransactions(req.driver.id, page, limit);
    return successResponse(res, data, 'Transactions fetched');
  } catch (err) {
    next(err);
  }
};