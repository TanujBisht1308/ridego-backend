import { findById, updateProfile } from '../repositories/customer.repository.js';

const toPublicCustomer = (customer) => ({
  id: customer.id,
  phoneNumber: customer.phone,
  fullName: customer.full_name,
  email: customer.email,
  rating: Number(customer.rating),
  walletBalance: Number(customer.wallet_balance),
  isProfileComplete: !!customer.full_name,
});

export const getCustomerProfile = async (customerId) => {
  const customer = await findById(customerId);
  return customer ? toPublicCustomer(customer) : null;
};

export const saveCustomerProfile = async (customerId, data) => {
  const customer = await updateProfile(customerId, data);
  return toPublicCustomer(customer);
};