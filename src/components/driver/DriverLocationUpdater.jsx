import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Silently broadcasts the driver's GPS location to the active parcel every 15s.
 * Mount this on the Dashboard when the user is a driver with an active job.
 */
export default function DriverLocationUpdater({ activeParcels }) {
  const watchIdRef = useRef(null);
  const lastPosRef = useRef(null);

  useEffect(() => {
    if (!activeParcels?.length) return;
    if (!navigator.geolocation) return;

    const pushLocation = (lat, lng) => {
      const now = new Date().toISOString();
      activeParcels.forEach(parcel => {
        if (['accepted', 'collected', 'in_transit'].includes(parcel.status) &&
            parcel.driver_lat !== lat && parcel.driver_lng !== lng) {
          base44.entities.Parcel.update(parcel.id, {
            driver_lat: lat,
            driver_lng: lng,
            driver_last_seen: now,
          }).catch(() => {});
        }
      });
    };

    const handlePosition = (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      lastPosRef.current = { lat, lng };
      pushLocation(lat, lng);
    };

    // Watch position continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [activeParcels?.map(p => p.id).join(',')]);

  return null;
}