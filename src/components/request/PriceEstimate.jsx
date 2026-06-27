import React from 'react';
import { MapPin, Clock, DollarSign } from 'lucide-react';

export default function PriceEstimate({ estimate, currency = 'ZAR' }) {
  return (
    <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-primary">Price Estimate</p>
        <span className="text-xs text-muted-foreground">Auto-calculated</span>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-background rounded-xl p-3 border border-border/50">
          <MapPin className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-sm font-bold">{estimate.distance_km?.toFixed(1)} km</p>
          <p className="text-xs text-muted-foreground">Distance</p>
        </div>
        <div className="bg-background rounded-xl p-3 border border-border/50">
          <Clock className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-sm font-bold">
            {estimate.duration_minutes ? `~${estimate.duration_minutes} min` : 'Varies'}
          </p>
          <p className="text-xs text-muted-foreground">Est. time</p>
        </div>
        <div className="bg-primary rounded-xl p-3">
          <DollarSign className="h-4 w-4 text-primary-foreground mx-auto mb-1" />
          <p className="text-lg font-extrabold text-primary-foreground">{estimate.price}</p>
          <p className="text-xs text-primary-foreground/80">{currency}</p>
        </div>
      </div>
    </div>
  );
}