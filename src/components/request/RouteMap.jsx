import React, { useEffect, useRef } from 'react';

export default function RouteMap({ pickup, delivery }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsRendererRef = useRef(null);

  useEffect(() => {
    const init = () => {
      if (!window.google || !mapRef.current) return;

      const center = pickup
        ? { lat: pickup.lat, lng: pickup.lng }
        : { lat: -26.2041, lng: 28.0473 }; // Default: Johannesburg

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
        ]
      });

      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: { strokeColor: '#f97316', strokeWeight: 4 }
      });
      directionsRendererRef.current.setMap(mapInstanceRef.current);
    };

    if (window.google) init();
    else {
      const interval = setInterval(() => { if (window.google) { clearInterval(interval); init(); } }, 300);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (!window.google || !mapInstanceRef.current) return;

    if (pickup && delivery) {
      const ds = new window.google.maps.DirectionsService();
      ds.route({
        origin: { lat: pickup.lat, lng: pickup.lng },
        destination: { lat: delivery.lat, lng: delivery.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(result);
        }
      });
    } else if (pickup) {
      mapInstanceRef.current.setCenter({ lat: pickup.lat, lng: pickup.lng });
      mapInstanceRef.current.setZoom(15);
    }
  }, [pickup, delivery]);

  return (
    <div
      ref={mapRef}
      className="w-full h-56 rounded-2xl overflow-hidden border border-border/50"
    />
  );
}