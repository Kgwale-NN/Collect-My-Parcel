import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, Clock, User, Navigation, Star } from 'lucide-react';

const statusConfig = {
  requested: { label: 'Waiting for driver', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  accepted: { label: 'Driver assigned', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  collected: { label: 'Collected', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  in_transit: { label: 'On the way', color: 'bg-primary/10 text-primary border-primary/20' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Cancelled', color: 'bg-muted text-muted-foreground border-border' }
};

export default function ParcelCard({ parcel, onClick }) {
  const status = statusConfig[parcel.status] || statusConfig.requested;

  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-all border-border/50 hover:border-primary/30 active:scale-[0.99]"
      onClick={() => onClick?.(parcel)}
    >
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold truncate">{parcel.store_name}</h3>
            <Badge variant="outline" className={`${status.color} border text-xs shrink-0`}>
              {status.label}
            </Badge>
          </div>

          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0 text-primary" />
              <span className="truncate">{parcel.pickup_address}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Navigation className="h-3 w-3 shrink-0 text-green-600" />
              <span className="truncate">{parcel.delivery_address}</span>
            </div>
            {parcel.preferred_delivery_time && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3 shrink-0" />
                <span>{parcel.preferred_delivery_time}</span>
              </div>
            )}
            {parcel.driver_name && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3 shrink-0" />
                <span>Driver: {parcel.driver_name}</span>
              </div>
            )}
          </div>

          {parcel.status === 'delivered' && parcel.driver_name && !parcel.driver_rating && (
            <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 font-medium">
              <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" /> Tap to rate your driver
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              {parcel.price && (
                <span className="text-sm font-bold text-primary">{parcel.currency || 'ZAR'} {parcel.price}</span>
              )}
              <span className="text-xs text-muted-foreground capitalize">{parcel.payment_method}</span>
            </div>
            {parcel.tracking_number && (
              <Link
                to={`/track?id=${parcel.tracking_number}`}
                onClick={e => e.stopPropagation()}
                className="text-xs text-primary hover:underline"
              >
                Track →
              </Link>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}