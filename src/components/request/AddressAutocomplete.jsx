import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

export default function AddressAutocomplete({ label, placeholder, value, onSelect, icon, iconColor = 'text-primary' }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [inputVal, setInputVal] = useState(value || '');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = () => {
      if (!window.google || !inputRef.current) return;
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode', 'establishment'],
      });
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (!place.geometry) return;
        const address = place.formatted_address || place.name;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setInputVal(address);
        onSelect({ address, lat, lng, name: place.name });
      });
      setReady(true);
    };

    if (window.google) {
      init();
    } else {
      const interval = setInterval(() => {
        if (window.google) { clearInterval(interval); init(); }
      }, 300);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1.5">
        <MapPin className={`h-3.5 w-3.5 ${iconColor}`} />
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}