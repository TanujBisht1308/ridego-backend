// Static vehicle type + pricing config. Edit values here to change fares
// without a migration. Move to a DB table later if you want this editable
// without a redeploy.

export const VEHICLE_TYPES = [
  { id: 'bike',  name: 'Bike',  baseFare: 20, perKm: 6,  perMin: 0.5, seats: 1, etaMinutes: 2 },
  { id: 'auto',  name: 'Auto',  baseFare: 30, perKm: 10, perMin: 1,   seats: 4, etaMinutes: 4 },
  { id: 'mini',  name: 'Mini',  baseFare: 40, perKm: 14, perMin: 1.5, seats: 4, etaMinutes: 5 },
  { id: 'sedan', name: 'Sedan', baseFare: 60, perKm: 18, perMin: 2,   seats: 6, etaMinutes: 8 },
];

export const findVehicleType = (id) => VEHICLE_TYPES.find((v) => v.id === id);

// ±15% spread around the calculated fare, to show a "price range" like
// the UI does (e.g. "₹150 - ₹250") instead of one fixed number.
export const fareRange = (vehicle, distanceKm, durationMinutes) => {
  const base = vehicle.baseFare + vehicle.perKm * distanceKm + vehicle.perMin * durationMinutes;
  return {
    min: Math.round(base * 0.85),
    max: Math.round(base * 1.15),
    estimated: Math.round(base),
  };
};