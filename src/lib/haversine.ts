/**
 * Calculate the great-circle distance between two points using the Haversine formula.
 * Returns distance in miles.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Format distance for display.
 * Shows meters if under 0.1 miles, otherwise miles with 1 decimal.
 */
export function formatDistance(miles: number): string {
  if (miles < 0.1) {
    const meters = Math.round(miles * 1609.34);
    return `${meters}m away`;
  }
  return `${miles.toFixed(1)} mi away`;
}
