import React, { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { base44 } from '@/api/base44Client';
import { Clock, MapPin, Loader2, Navigation } from 'lucide-react';

const DRIVER_ICON = {
  path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
  fillColor: '#f97316',
  fillOpacity: 1,
  strokeColor: '#fff',
  strokeWeight: 2,
  scale: 1.4,
  anchor: { x: 12, y: 24 },
};

export default function LiveTrackingMap({ parcel }) {
  const mapsLoaded = useGoogleMaps();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const [eta, setEta] = useState(parcel.eta_minutes || null);
  const [driverPos, setDriverPos] = useState(
    parcel.driver_lat ? { lat: parcel.driver_lat, lng: parcel.driver_lng } : null
  );
  const [lastSeen, setLastSeen] = useState(parcel.driver_last_seen || null);

  // Init map
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current) return;
    const defaultCenter = { lat: -26.2041, lng: 28.0473 };
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: driverPos || defaultCenter,
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
    });

    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers: false,
      polylineOptions: { strokeColor: '#f97316', strokeWeight: 4, strokeOpacity: 0.8 },
    });
    directionsRendererRef.current.setMap(mapInstanceRef.current);

    // Pickup marker
    if (parcel.pickup_lat) {
      new window.google.maps.Marker({
        position: { lat: parcel.pickup_lat, lng: parcel.pickup_lng },
        map: mapInstanceRef.current,
        title: 'Pickup: ' + parcel.pickup_address,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });
    }

    // Delivery marker
    if (parcel.delivery_lat) {
      new window.google.maps.Marker({
        position: { lat: parcel.delivery_lat, lng: parcel.delivery_lng },
        map: mapInstanceRef.current,
        title: 'Delivery: ' + parcel.delivery_address,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#22c55e',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });
    }
  }, [mapsLoaded]);

  // Driver marker update
  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current || !driverPos) return;

    if (!driverMarkerRef.current) {
      driverMarkerRef.current = new window.google.maps.Marker({
        position: driverPos,
        map: mapInstanceRef.current,
        title: 'Driver',
        icon: {
          ...DRIVER_ICON,
          anchor: new window.google.maps.Point(12, 24),
        },
        animation: window.google.maps.Animation.DROP,
        zIndex: 10,
      });
    } else {
      driverMarkerRef.current.setPosition(driverPos);
    }

    // Draw route from driver → delivery
    if (parcel.delivery_lat && parcel.status === 'in_transit') {
      const ds = new window.google.maps.DirectionsService();
      ds.route({
        origin: driverPos,
        destination: { lat: parcel.delivery_lat, lng: parcel.delivery_lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(result);
          const leg = result.routes[0]?.legs[0];
          if (leg?.duration?.value) {
            const mins = Math.ceil(leg.duration.value / 60);
            setEta(mins);
          }
        }
      });
      mapInstanceRef.current.panTo(driverPos);
    } else if (parcel.pickup_lat && parcel.status === 'accepted') {
      const ds = new window.google.maps.DirectionsService();
      ds.route({
        origin: driverPos,
        destination: { lat: parcel.pickup_lat, lng: parcel.pickup_lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(result);
          const leg = result.routes[0]?.legs[0];
          if (leg?.duration?.value) {
            const mins = Math.ceil(leg.duration.value / 60);
            setEta(mins);
          }
        }
      });
      mapInstanceRef.current.panTo(driverPos);
    }
  }, [mapsLoaded, driverPos]);

  // Poll for live driver location every 10s
  useEffect(() => {
    if (!['accepted', 'collected', 'in_transit'].includes(parcel.status)) return;

    const poll = async () => {
      const updated = await base44.entities.Parcel.filter({ id: parcel.id });
      const p = updated?.[0];
      if (p?.driver_lat && p?.driver_lng) {
        setDriverPos({ lat: p.driver_lat, lng: p.driver_lng });
        setLastSeen(p.driver_last_seen);
        if (p.eta_minutes) setEta(p.eta_minutes);
      }
    };

    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [parcel.id, parcel.status]);

  const isTracking = ['accepted', 'collected', 'in_transit'].includes(parcel.status);

  return (
    <div className="rounded-xl overflow-hidden border border-border">
      {/* ETA Bar */}
      {isTracking && (
        <div className="bg-primary px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-foreground">
            <Navigation className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-semibold">
              {parcel.status === 'in_transit' ? 'Driver heading to you' :
               parcel.status === 'accepted' ? 'Driver heading to pickup' :
               'Parcel collected, preparing delivery'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
            <Clock className="h-3.5 w-3.5 text-primary-foreground" />
            <span className="text-sm font-bold text-primary-foreground">
              {eta ? `~${eta} min` : '—'}
            </span>
          </div>
        </div>
      )}

      {/* Map */}
      {!mapsLoaded ? (
        <div className="h-52 flex items-center justify-center bg-muted gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading map...
        </div>
      ) : (
        <div ref={mapRef} className="w-full h-52" />
      )}

      {/* Driver location info */}
      {driverPos ? (
        <div className="px-4 py-2.5 bg-card flex items-center justify-between text-xs text-muted-foreground border-t border-border">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Driver location live</span>
          </div>
          {lastSeen && (
            <span>Updated {new Date(lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>
      ) : isTracking ? (
        <div className="px-4 py-2.5 bg-card flex items-center gap-1.5 text-xs text-muted-foreground border-t border-border">
          <MapPin className="h-3.5 w-3.5" />
          <span>Waiting for driver location...</span>
        </div>
      ) : null}
    </div>
  );
}