import React, { useEffect, useMemo, useRef } from 'react';
import { Clock, MapPin, Navigation, Satellite, Truck } from 'lucide-react';
import { hasGoogleMapsApiKey, useGoogleMaps } from '@/hooks/useGoogleMaps';

function getDestination(parcel) {
  if (!parcel) return null;
  if (parcel.status === 'accepted' || parcel.status === 'collected') {
    return {
      lat: parcel.pickup_lat,
      lng: parcel.pickup_lng,
      label: 'Pickup'
    };
  }
  return {
    lat: parcel.delivery_lat,
    lng: parcel.delivery_lng,
    label: 'Delivery'
  };
}

export default function LiveTrackingMap({ parcel }) {
  const mapsLoaded = useGoogleMaps();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const etaRef = useRef(null);

  const driverPosition = useMemo(() => {
    if (!parcel?.driver_lat || !parcel?.driver_lng) return null;
    return { lat: Number(parcel.driver_lat), lng: Number(parcel.driver_lng) };
  }, [parcel?.driver_lat, parcel?.driver_lng]);

  const destination = useMemo(() => getDestination(parcel), [parcel]);
  const hasDestination = destination?.lat && destination?.lng;

  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || mapInstanceRef.current) return;

    const center = driverPosition || (hasDestination ? { lat: Number(destination.lat), lng: Number(destination.lng) } : { lat: -26.2041, lng: 28.0473 });
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }]
    });

    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: { strokeColor: '#2563eb', strokeWeight: 5 }
    });
    directionsRendererRef.current.setMap(mapInstanceRef.current);
  }, [destination, driverPosition, hasDestination, mapsLoaded]);

  useEffect(() => {
    if (!mapsLoaded || !mapInstanceRef.current) return;

    if (driverPosition) {
      if (!driverMarkerRef.current) {
        driverMarkerRef.current = new window.google.maps.Marker({
          map: mapInstanceRef.current,
          title: 'Driver',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: '#2563eb',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3
          }
        });
      }
      driverMarkerRef.current.setPosition(driverPosition);
    }

    if (hasDestination) {
      const destinationPosition = { lat: Number(destination.lat), lng: Number(destination.lng) };
      if (!destinationMarkerRef.current) {
        destinationMarkerRef.current = new window.google.maps.Marker({
          map: mapInstanceRef.current,
          title: destination.label
        });
      }
      destinationMarkerRef.current.setPosition(destinationPosition);

      if (driverPosition) {
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route({
          origin: driverPosition,
          destination: destinationPosition,
          travelMode: window.google.maps.TravelMode.DRIVING
        }, (result, status) => {
          if (status === 'OK') {
            directionsRendererRef.current.setDirections(result);
            etaRef.current = result.routes?.[0]?.legs?.[0]?.duration?.text || null;
          }
        });
      } else {
        mapInstanceRef.current.setCenter(destinationPosition);
      }
    }
  }, [destination, driverPosition, hasDestination, mapsLoaded]);

  if (!hasGoogleMapsApiKey()) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        <div className="flex items-center gap-2 font-semibold mb-1">
          <Satellite className="h-4 w-4" /> Live map needs configuration
        </div>
        Add <strong>VITE_GOOGLE_MAPS_API_KEY</strong> to enable production Google Maps tracking.
      </div>
    );
  }

  if (!mapsLoaded) {
    return (
      <div className="h-72 rounded-2xl border bg-muted/60 flex items-center justify-center text-sm text-muted-foreground">
        Loading live map...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-card">
      <div ref={mapRef} className="h-72 w-full" />
      <div className="grid grid-cols-3 divide-x divide-border text-sm">
        <div className="p-3">
          <p className="text-xs text-muted-foreground">Driver</p>
          <p className="font-semibold flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-primary" />
            {driverPosition ? 'Live' : 'Waiting'}
          </p>
        </div>
        <div className="p-3">
          <p className="text-xs text-muted-foreground">Route</p>
          <p className="font-semibold flex items-center gap-1">
            <Navigation className="h-3.5 w-3.5 text-green-600" />
            {destination?.label || 'Delivery'}
          </p>
        </div>
        <div className="p-3">
          <p className="text-xs text-muted-foreground">ETA</p>
          <p className="font-semibold flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            {etaRef.current || 'Updating'}
          </p>
        </div>
      </div>
      {parcel?.driver_last_seen && (
        <div className="px-3 py-2 border-t text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          Last GPS update: {new Date(parcel.driver_last_seen).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
