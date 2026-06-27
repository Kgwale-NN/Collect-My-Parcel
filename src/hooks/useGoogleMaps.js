import { useEffect, useState } from 'react';

// Google Maps API key — set VITE_GOOGLE_MAPS_API_KEY in your environment
// In Google Cloud Console, restrict this key to your domain for security
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let scriptLoaded = false;
let scriptLoading = false;
const callbacks = [];

function loadScript(apiKey) {
  if (scriptLoaded || scriptLoading) return;
  // Check if already loaded externally
  if (window.google?.maps) { scriptLoaded = true; callbacks.forEach(cb => cb()); return; }
  scriptLoading = true;
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=_googleMapsCallback`;
  script.async = true;
  script.defer = true;
  window._googleMapsCallback = () => {
    scriptLoaded = true;
    scriptLoading = false;
    callbacks.forEach(cb => cb());
  };
  script.onerror = () => { scriptLoading = false; };
  document.head.appendChild(script);
}

export function useGoogleMaps() {
  const [loaded, setLoaded] = useState(scriptLoaded || !!window.google?.maps);

  useEffect(() => {
    if (scriptLoaded || window.google?.maps) { setLoaded(true); return; }
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn('Set VITE_GOOGLE_MAPS_API_KEY in your environment variables');
      return;
    }
    const cb = () => setLoaded(true);
    callbacks.push(cb);
    loadScript(GOOGLE_MAPS_API_KEY);
    return () => { const i = callbacks.indexOf(cb); if (i > -1) callbacks.splice(i, 1); };
  }, []);

  return loaded;
}