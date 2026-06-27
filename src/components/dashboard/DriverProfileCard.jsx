import React from 'react';
import { Star, Truck, ToggleRight } from 'lucide-react';

export default function DriverProfileCard({ user }) {
  const rating = user?.rating || 5.0;
  const deliveries = user?.total_deliveries || 0;
  const vehicle = user?.vehicle_type || 'vehicle';

  const vehicleEmoji = {
    motorcycle: '🏍️',
    bicycle: '🚲',
    car: '🚗',
    on_foot: '🚶',
  }[vehicle] || '🚗';

  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20 p-5 mb-6 flex flex-wrap gap-4 items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Driver Profile</p>
        <p className="font-bold text-lg">{user?.full_name}</p>
        <p className="text-sm text-muted-foreground">{vehicleEmoji} {vehicle.replace('_', ' ')}</p>
      </div>
      <div className="flex gap-6">
        <div className="text-center">
          <div className="flex items-center gap-1 justify-center">
            <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />
            <span className="text-xl font-bold">{rating.toFixed(1)}</span>
          </div>
          <p className="text-xs text-muted-foreground">Rating</p>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-1 justify-center">
            <Truck className="h-4 w-4 text-primary" />
            <span className="text-xl font-bold">{deliveries}</span>
          </div>
          <p className="text-xs text-muted-foreground">Deliveries</p>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-1 justify-center">
            <ToggleRight className={`h-4 w-4 ${user?.is_available ? 'text-green-500' : 'text-muted-foreground'}`} />
            <span className={`text-sm font-semibold ${user?.is_available ? 'text-green-600' : 'text-muted-foreground'}`}>
              {user?.is_available ? 'Online' : 'Offline'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Status</p>
        </div>
      </div>
    </div>
  );
}