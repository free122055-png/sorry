import { db } from "../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export interface UserLocationData {
  userId: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  addressName?: string;
  movementStatus?: string;
  lastUpdated: any;
}

import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

let watchId: string | number | null = null;
let lastGeocodeTime = 0;
let cachedAddress = "";

/**
 * Reverse geocodes latitude & longitude to a human-readable area name in Bangladesh / Worldwide
 */
export const getAddressFromCoords = async (lat: number, lon: number): Promise<string> => {
  const now = Date.now();
  // Cache address for 30 seconds to prevent rate limits
  if (cachedAddress && now - lastGeocodeTime < 30000) {
    return cachedAddress;
  }

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
      headers: { 'Accept-Language': 'bn,en' }
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data.address;
      const villageOrSub = addr?.suburb || bgVillage(addr) || addr?.neighbourhood || addr?.city_district || addr?.town || addr?.city || "বাংলাদেশ";
      const district = addr?.state_district || addr?.district || addr?.state || "";
      const formatted = district ? `${villageOrSub}, ${district}` : villageOrSub;
      cachedAddress = formatted;
      lastGeocodeTime = now;
      return formatted;
    }
  } catch (err) {
    console.warn("Geocoding notice:", err);
  }
  return cachedAddress || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
};

function bgVillage(addr: any) {
  return addr?.village || addr?.residential || addr?.quarter || addr?.road;
}

/**
 * Calculates movement status based on speed in km/h
 */
export const getMovementStatus = (speedMetersPerSec: number | null): string => {
  if (speedMetersPerSec === null || speedMetersPerSec < 0) return "এক জায়গায় অবস্থান করছেন 📍";
  const speedKmH = speedMetersPerSec * 3.6;
  if (speedKmH > 15) return `গাড়িতে চলমান 🚗 (${Math.round(speedKmH)} কিমি/ঘণ্টা)`;
  if (speedKmH > 2) return `হাঁটছেন 🚶 (${Math.round(speedKmH)} কিমি/ঘণ্টা)`;
  return "এক জায়গায় অবস্থান করছেন 📍";
};

let lastFirestoreWriteTime = 0;
const MIN_WRITE_INTERVAL_MS = 3000; // Minimum 3 seconds between Firestore location writes

export const startLocationTracking = async (userId: string, onUpdate?: (loc: UserLocationData) => void) => {
  if (Capacitor.isNativePlatform()) {
    try {
      const permissions = await Geolocation.checkPermissions();
      if (permissions.location !== 'granted') {
        const req = await Geolocation.requestPermissions();
        if (req.location !== 'granted') {
          console.error("Location permission denied on native device");
          return;
        }
      }
    } catch (e) {
      console.warn("Capacitor permission check warning:", e);
    }
  } else if (!navigator.geolocation) {
    console.error("Geolocation is not supported by this browser.");
    return;
  }

  if (watchId !== null) {
    if (Capacitor.isNativePlatform()) {
      Geolocation.clearWatch({ id: watchId as string });
    } else {
      navigator.geolocation.clearWatch(watchId as number);
    }
  }

  const handleUpdate = async (position: any) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const speed = position.coords.speed;
    const movementStatus = getMovementStatus(speed);

    // Async fetch address without blocking coordinates update
    const addressName = await getAddressFromCoords(lat, lon);

    const loc: UserLocationData = {
      userId,
      latitude: lat,
      longitude: lon,
      speed: position.coords.speed,
      heading: position.coords.heading,
      accuracy: position.coords.accuracy,
      addressName,
      movementStatus,
      lastUpdated: serverTimestamp(),
    };

    // Always update local UI state immediately for 60fps smooth map rendering
    if (onUpdate) onUpdate(loc);

    // Throttle Firestore database writes to max once every 3 seconds to prevent [resource-exhausted] write stream error
    const now = Date.now();
    if (now - lastFirestoreWriteTime >= MIN_WRITE_INTERVAL_MS) {
      lastFirestoreWriteTime = now;
      try {
        await setDoc(doc(db, "user_locations", userId), loc, { merge: true });
      } catch (err: any) {
        console.warn("Throttled location write notice:", err?.message || err);
      }
    }
  };

  const handleError = (error: any) => {
    console.warn("Geolocation tracking warning:", error.message);
  };

  const options = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 1000,
  };

  if (Capacitor.isNativePlatform()) {
    watchId = await Geolocation.watchPosition(options, (pos, err) => {
      if (err) handleError(err);
      if (pos) handleUpdate(pos);
    });
  } else {
    watchId = navigator.geolocation.watchPosition(handleUpdate, handleError, options);
  }
};


export const stopLocationTracking = () => {
  if (watchId !== null) {
    if (Capacitor.isNativePlatform()) {
      Geolocation.clearWatch({ id: watchId as string });
    } else {
      navigator.geolocation.clearWatch(watchId as number);
    }
    watchId = null;
  }
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

