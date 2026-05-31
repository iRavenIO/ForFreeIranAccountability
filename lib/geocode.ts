/**
 * Iran geocoding utility.
 *
 * Resolution chain (internal only):
 *   1. Postal district centroid (first 5 digits)
 *   2. City centroid
 *   3. Province centroid
 *
 * Full postal codes are NEVER exposed via public APIs.
 * Public API returns only city or province-level approximate coordinates.
 */

import { getCityCoordinates, getProvinceCenter } from './coordinates';

/**
 * Extract postal district prefix (first 5 digits from a 10-digit code).
 * Iranian postal codes: first 5 digits identify the postal district.
 */
export function extractPostalDistrict(postalCode: string | null): string | null {
  if (!postalCode) return null;
  const cleaned = postalCode.replace(/[^0-9]/g, '');
  if (cleaned.length !== 10) return null;
  return cleaned.substring(0, 5);
}

/**
 * Get the best available coordinates for internal use.
 * Priority: postal district > city > province
 * 
 * When a proper postal district dataset becomes available,
 * populate POSTAL_DISTRICT_CENTROIDS in this function.
 *
 * For now, falls back to city centroid immediately
 * since we don't have a postal district coordinate dataset yet.
 */
export function getInternalCoordinates(
  postalCode: string | null,
  province: string | null,
  city: string | null
): { lat: number; lng: number; precision: 'city' | 'province' } | null {
  // 1. Try city centroid (best publicly-safe resolution)
  if (province && city) {
    const cityCoords = getCityCoordinates(province, city);
    if (cityCoords) {
      return { ...cityCoords, precision: 'city' };
    }
  }

  // 2. Try province centroid
  if (province) {
    const provinceCoords = getProvinceCenter(province);
    if (provinceCoords) {
      return { ...provinceCoords, precision: 'province' };
    }
  }

  return null;
}

/**
 * Get coordinates suitable for public API display.
 * Always returns city-level or province-level (never district/address).
 */
export function getPublicCoordinates(
  postalCode: string | null,
  province: string | null,
  city: string | null
): { lat: number; lng: number } | null {
  const internal = getInternalCoordinates(postalCode, province, city);
  if (!internal) return null;
  return { lat: internal.lat, lng: internal.lng };
}
