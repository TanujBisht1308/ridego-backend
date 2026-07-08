
import { successResponse, errorResponse } from '../utils/response.js';
import { autocomplete, getPlaceDetails, reverseGeocode, getRoute } from '../services/places.service.js';
export const autocompleteHandler = async (req, res, next) => {
  try {
    const { input, sessionToken } = req.query;
    if (!input) return errorResponse(res, 'input query param is required', 400);
    const suggestions = await autocomplete(input, sessionToken);
    return successResponse(res, suggestions, 'Suggestions fetched');
  } catch (err) {
    if (err.statusCode) return errorResponse(res, err.message, err.statusCode);
    next(err);
  }
};

export const placeDetailsHandler = async (req, res, next) => {
  try {
    const { placeId, sessionToken } = req.query;
    if (!placeId) return errorResponse(res, 'placeId query param is required', 400);
    const details = await getPlaceDetails(placeId, sessionToken);
    return successResponse(res, details, 'Place details fetched');
  } catch (err) {
    if (err.statusCode) return errorResponse(res, err.message, err.statusCode);
    next(err);
  }
};

export const reverseGeocodeHandler = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return errorResponse(res, 'lat and lng query params are required', 400);
    const result = await reverseGeocode(parseFloat(lat), parseFloat(lng));
    return successResponse(res, result, 'Address resolved');
  } catch (err) {
    if (err.statusCode) return errorResponse(res, err.message, err.statusCode);
    next(err);
  }
};
export const routeHandler = async (req, res, next) => {
  try {
    const { pickupLat, pickupLng, dropLat, dropLng } = req.query;
    if (!pickupLat || !pickupLng || !dropLat || !dropLng) {
      return errorResponse(res, 'pickupLat, pickupLng, dropLat, dropLng are all required', 400);
    }
    const route = await getRoute(
      parseFloat(pickupLat), parseFloat(pickupLng),
      parseFloat(dropLat), parseFloat(dropLng)
    );
    return successResponse(res, route, 'Route fetched');
  } catch (err) {
    if (err.statusCode) return errorResponse(res, err.message, err.statusCode);
    next(err);
  }
};