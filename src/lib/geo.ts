import type { GeoPosition, PlaceInfo } from "./types";

export function getCurrentPosition(
  options?: PositionOptions,
): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not available on this device."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? null,
        });
      },
      (err) => {
        reject(new Error(err.message || "Unable to read GPS location."));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
        ...options,
      },
    );
  });
}

/** Demo fallback near Shah Alam when GPS is denied / unavailable */
export const DEMO_FALLBACK_POSITION: GeoPosition = {
  latitude: 3.0738,
  longitude: 101.5183,
  accuracy: 25,
};

export function formatCoords(lat: number, lng: number, digits = 5): string {
  return `${lat.toFixed(digits)}, ${lng.toFixed(digits)}`;
}

const LOCAL_PLACES: Array<{
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}> = [
  { city: "Shah Alam", state: "Selangor", latitude: 3.0733, longitude: 101.5185 },
  { city: "Petaling Jaya", state: "Selangor", latitude: 3.1073, longitude: 101.6067 },
  { city: "Subang Jaya", state: "Selangor", latitude: 3.0488, longitude: 101.5851 },
  { city: "Klang", state: "Selangor", latitude: 3.0449, longitude: 101.4456 },
  { city: "Puchong", state: "Selangor", latitude: 3.0312, longitude: 101.6178 },
  { city: "Kajang", state: "Selangor", latitude: 2.9927, longitude: 101.7909 },
  { city: "Ampang", state: "Selangor", latitude: 3.1486, longitude: 101.7636 },
  { city: "Kuala Lumpur", state: "Wilayah Persekutuan", latitude: 3.139, longitude: 101.6869 },
  { city: "Johor Bahru", state: "Johor", latitude: 1.4927, longitude: 103.7414 },
  { city: "Pasir Gudang", state: "Johor", latitude: 1.4703, longitude: 103.902 },
  { city: "Skudai", state: "Johor", latitude: 1.537, longitude: 103.6579 },
  { city: "Kulai", state: "Johor", latitude: 1.6561, longitude: 103.6032 },
];

function haversineKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export function resolvePlaceLocal(
  latitude: number,
  longitude: number,
): PlaceInfo {
  let best = LOCAL_PLACES[0];
  let bestDist = Number.POSITIVE_INFINITY;
  for (const place of LOCAL_PLACES) {
    const d = haversineKm(
      latitude,
      longitude,
      place.latitude,
      place.longitude,
    );
    if (d < bestDist) {
      bestDist = d;
      best = place;
    }
  }
  return { city: best.city, state: best.state, source: "local" };
}

type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  suburb?: string;
  county?: string;
  state?: string;
};

/**
 * Reverse-geocode GPS to city + state.
 * Tries OpenStreetMap Nominatim, then nearest known MY city.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<PlaceInfo> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "json");
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));
    url.searchParams.set("zoom", "12");
    url.searchParams.set("addressdetails", "1");

    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (res.ok) {
      const data = (await res.json()) as { address?: NominatimAddress };
      const addr = data.address ?? {};
      const city =
        addr.city ||
        addr.town ||
        addr.municipality ||
        addr.village ||
        addr.suburb ||
        addr.county;
      const state = addr.state;
      if (city && state) {
        return { city, state, source: "nominatim" };
      }
      if (state) {
        const local = resolvePlaceLocal(latitude, longitude);
        return { city: city || local.city, state, source: "nominatim" };
      }
    }
  } catch {
    // fall through
  }

  return resolvePlaceLocal(latitude, longitude);
}
