// Haversine distance between two coordinates, in kilometers.
export const distanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

// Rough duration estimate assuming ~25 km/h average city speed.
export const estimateDurationMinutes = (km) => Math.max(3, Math.round((km / 25) * 60));

// Fallback demo distance when the app hasn't sent coordinates yet
// (customer app has no Places Autocomplete / geocoding wired in yet).
export const DEFAULT_DEMO_DISTANCE_KM = 8.5;