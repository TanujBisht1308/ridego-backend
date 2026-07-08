import { getBalance, getTransactions, creditWallet, debitWallet } from '../repositories/wallet.repository.js';

const toPublicTransaction = (tx) => ({
  id: tx.id,
  type: tx.type,
  amount: Number(tx.amount),
  description: tx.description,
  createdAt: tx.created_at,
});

export const getWallet = async (customerId) => {
  const balance = await getBalance(customerId);
  const transactions = await getTransactions(customerId);
  return {
    balance,
    transactions: transactions.map(toPublicTransaction),
  };
};

export const addMoney = async (customerId, amount) => {
  const result = await creditWallet(customerId, amount, 'Wallet Top-up');
  return {
    balance: result.balance,
    transaction: toPublicTransaction(result.transaction),
  };
};

export const payForRide = async (customerId, amount, rideId) => {
  const result = await debitWallet(customerId, amount, 'Ride Payment', rideId);
  if (!result) return null;
  return {
    balance: result.balance,
    transaction: toPublicTransaction(result.transaction),
  };
};