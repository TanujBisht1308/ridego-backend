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
import { updateFcmToken as saveCustomerFcmToken } from '../repositories/customer.repository.js';

export const registerCustomerFcmToken = async (customerId, token) => {
  await saveCustomerFcmToken(customerId, token);
};
import {
  getSavedPlaces,
  createSavedPlace,
  updateSavedPlaceById,
  deleteSavedPlaceById,
} from '../repositories/customer.repository.js';

const toPublicPlace = (row) => ({
  id: row.id,
  label: row.label,
  address: row.address,
  latitude: row.latitude != null ? Number(row.latitude) : null,
  longitude: row.longitude != null ? Number(row.longitude) : null,
  icon: row.icon,
});

export const fetchSavedPlaces = async (customerId) => {
  const rows = await getSavedPlaces(customerId);
  return rows.map(toPublicPlace);
};

export const addSavedPlace = async (customerId, data) => {
  const row = await createSavedPlace(customerId, data);
  return toPublicPlace(row);
};

export const editSavedPlace = async (customerId, placeId, data) => {
  const row = await updateSavedPlaceById(customerId, placeId, data);
  return row ? toPublicPlace(row) : null;
};

export const removeSavedPlace = async (customerId, placeId) => {
  await deleteSavedPlaceById(customerId, placeId);
};