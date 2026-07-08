import { getWallet, addMoney, payForRide } from '../services/wallet.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getWalletHandler = async (req, res, next) => {
  try {
    const wallet = await getWallet(req.customer.id);
    return successResponse(res, wallet, 'Wallet fetched');
  } catch (err) {
    next(err);
  }
};

export const addMoneyHandler = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return errorResponse(res, 'Valid amount is required', 400);

    const result = await addMoney(req.customer.id, amount);
    return successResponse(res, result, 'Money added successfully');
  } catch (err) {
    next(err);
  }
};

export const payForRideHandler = async (req, res, next) => {
  try {
    const { amount, rideId } = req.body;
    if (!amount || amount <= 0) return errorResponse(res, 'Valid amount is required', 400);

    const result = await payForRide(req.customer.id, amount, rideId);
    if (!result) return errorResponse(res, 'Insufficient wallet balance', 400);

    return successResponse(res, result, 'Payment successful');
  } catch (err) {
    next(err);
  }
};