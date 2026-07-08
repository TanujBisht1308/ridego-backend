// Thin proxy over Google's Places Autocomplete + Place Details + Geocoding.
// Keeping the API key server-side only — the phone never sees it.

const PLACES_BASE = 'https://places.googleapis.com/v1';
const GEOCODE_BASE = 'https://maps.googleapis.com/maps/api/geocode/json';

const apiKey = () => process.env.GOOGLE_PLACES_API_KEY;

export const autocomplete = async (input, sessionToken) => {
  const response = await fetch(`${PLACES_BASE}/places:autocomplete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey(),
    },
    body: JSON.stringify({
      input,
      sessionToken,
      // Bias toward India since the app is India-focused (Delhi NCR demo data).
      regionCode: 'IN',
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw Object.assign(new Error(data.error?.message || 'Places autocomplete failed'), { statusCode: 502 });
  }

  return (data.suggestions || []).map((s) => ({
    placeId: s.placePrediction?.placeId,
    text: s.placePrediction?.text?.text,
  })).filter((s) => s.placeId);
};

export const getPlaceDetails = async (placeId, sessionToken) => {
  const response = await fetch(`${PLACES_BASE}/places/${placeId}?fields=location,formattedAddress`, {
    headers: {
      'X-Goog-Api-Key': apiKey(),
      'X-Goog-FieldMask': 'location,formattedAddress',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw Object.assign(new Error(data.error?.message || 'Place details failed'), { statusCode: 502 });
  }

  return {
    address: data.formattedAddress,
    latitude: data.location?.latitude,
    longitude: data.location?.longitude,
  };
};

// Reverse geocode — used for "current location" on the home screen,
// converting raw GPS lat/lng into a readable address.
export const reverseGeocode = async (lat, lng) => {
  const url = `${GEOCODE_BASE}?latlng=${lat},${lng}&key=${apiKey()}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK' || !data.results?.length) {
    throw Object.assign(new Error('Could not resolve address for this location'), { statusCode: 502 });
  }

  return { address: data.results[0].formatted_address, latitude: lat, longitude: lng };
};
const DIRECTIONS_BASE = 'https://maps.googleapis.com/maps/api/directions/json';

// Decodes Google's polyline encoding into a list of {lat, lng} points.
const decodePolyline = (encoded) => {
  const points = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let shift = 0, result = 0, byte;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
};

export const getRoute = async (pickupLat, pickupLng, dropLat, dropLng) => {
  const url = `${DIRECTIONS_BASE}?origin=${pickupLat},${pickupLng}&destination=${dropLat},${dropLng}&key=${apiKey()}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK' || !data.routes?.length) {
    throw Object.assign(new Error('Could not find a route between these points'), { statusCode: 502 });
  }

  const route = data.routes[0];
  const leg = route.legs[0];

  return {
    points: decodePolyline(route.overview_polyline.points),
    distanceKm: leg.distance.value / 1000,
    durationMinutes: Math.round(leg.duration.value / 60),
  };
};