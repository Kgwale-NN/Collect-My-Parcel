import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';

export default function UberAddressInput({ onPickupSelect, onDeliverySelect, mapsLoaded }) {
  const pickupRef = useRef(null);
  const deliveryRef = useRef(null);
  const pickupACRef = useRef(null);
  const deliveryACRef = useRef(null);

  const [pickupVal, setPickupVal] = useState('');
  const [deliveryVal, setDeliveryVal] = useState('');
  const [activeField, setActiveField] = useState('pickup');

  const [pickupData, setPickupData] = useState(null);
  const [deliveryData, setDeliveryData] = useState(null);

  const initAutocomplete = (inputEl, acRef, onSelect, setVal, setData) => {
    if (!window.google || !inputEl) return;
    const ac = new window.google.maps.places.Autocomplete(inputEl, {
      types: ['geocode', 'establishment'],
    });
    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place.geometry) return;
      const address = place.formatted_address || place.name;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const data = { address, lat, lng, name: place.name };
      setVal(address);
      setData(data);
      onSelect(data);
    });
    acRef.current = ac;
  };

  useEffect(() => {
    if (!mapsLoaded) return;
    if (window.google) {
      initAutocomplete(pickupRef.current, pickupACRef, onPickupSelect, setPickupVal, setPickupData);
      initAutocomplete(deliveryRef.current, deliveryACRef, onDeliverySelect, setDeliveryVal, setDeliveryData);
    }
  }, [mapsLoaded]);

  const handleSwap = () => {
    const tmpVal = pickupVal;
    const tmpData = pickupData;
    setPickupVal(deliveryVal);
    setDeliveryVal(tmpVal);
    setPickupData(deliveryData);
    setDeliveryData(tmpData);
    if (deliveryData) onPickupSelect(deliveryData);
    if (tmpData) onDeliverySelect(tmpData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-border overflow-visible">
      {/* Pickup */}
      <div
        className={`relative flex items-center gap-3 px-4 py-0 cursor-text transition-all`}
        onClick={() => { setActiveField('pickup'); pickupRef.current?.focus(); }}
      >
        {/* Dot indicator */}
        <div className="shrink-0 flex flex-col items-center pt-0.5">
          <div className={`w-3 h-3 rounded-full border-2 transition-colors ${activeField === 'pickup' ? 'border-primary bg-primary' : 'border-muted-foreground/50 bg-transparent'}`} />
        </div>
        <div className="flex-1 py-4 border-b border-border/60">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Pickup</p>
          <input
            ref={pickupRef}
            type="text"
            value={pickupVal}
            onChange={(e) => setPickupVal(e.target.value)}
            onFocus={() => setActiveField('pickup')}
            placeholder="Where are we collecting from?"
            autoFocus
            className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/60 placeholder:font-normal"
          />
        </div>
      </div>

      {/* Connector line + swap button */}
      <div className="flex items-center px-4">
        <div className="flex flex-col items-center ml-1.5 mr-3">
          <div className="w-px h-4 bg-border" />
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleSwap}
          className="h-7 w-7 rounded-full border border-border bg-background flex items-center justify-center hover:bg-muted transition-colors shadow-sm mr-0"
        >
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Delivery */}
      <div
        className={`relative flex items-center gap-3 px-4 py-0 cursor-text transition-all`}
        onClick={() => { setActiveField('delivery'); deliveryRef.current?.focus(); }}
      >
        <div className="shrink-0 flex flex-col items-center pt-0.5">
          <div className={`w-3 h-3 rounded-sm transition-colors ${activeField === 'delivery' ? 'bg-primary' : 'bg-muted-foreground/50'}`} />
        </div>
        <div className="flex-1 py-4">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Drop-off</p>
          <input
            ref={deliveryRef}
            type="text"
            value={deliveryVal}
            onChange={(e) => setDeliveryVal(e.target.value)}
            onFocus={() => setActiveField('delivery')}
            placeholder="Where should we deliver?"
            className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/60 placeholder:font-normal"
          />
        </div>
      </div>
    </div>
  );
}