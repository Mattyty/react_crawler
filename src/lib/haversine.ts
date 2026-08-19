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


/**
 * Get display end time for an offer, merging with next-day continuation if applicable.
 * If end_time is >= 23:00 and there's a continuation (start < 06:00), use that end time.
 */
export function getDisplayEndTime(offer: { end_time?: string; start_time?: string; bar_id: number; 'deal summary'?: string }, allOffers: any[]): string | undefined {
  if (!offer.end_time) return undefined;
  if (offer.end_time < '23:00:00') return offer.end_time;

  // Look for a continuation offer (same bar, same deal, starts before 06:00)
  const continuation = allOffers.find((o: any) =>
    o.bar_id === offer.bar_id &&
    o['deal summary'] === offer['deal summary'] &&
    o.start_time && o.start_time < '06:00:00' &&
    o.id !== (offer as any).id
  );

  return continuation?.end_time || offer.end_time;
}
