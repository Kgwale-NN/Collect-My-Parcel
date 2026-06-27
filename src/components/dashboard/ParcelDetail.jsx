import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, Navigation, Phone, Loader2, PackageCheck, Truck } from 'lucide-react';
import { toast } from 'sonner';
import DriverRating from '@/components/dashboard/DriverRating';

const statusLabels = {
  requested: 'Waiting for driver',
  accepted: 'Driver assigned',
  collected: 'Collected',
  in_transit: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

export default function ParcelDetail({ parcel, isDriver, user, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const updateParcel = async (changes, message) => {
    setLoading(true);
    try {
      await base44.entities.Parcel.update(parcel.id, changes);
      toast.success(message);
      onUpdate?.();
    } catch (error) {
      toast.error('Could not update this parcel');
    } finally {
      setLoading(false);
    }
  };

  const acceptJob = () => updateParcel({
    status: 'accepted',
    driver_email: user?.email,
    driver_name: user?.full_name,
    driver_phone: user?.phone
  }, 'Job accepted');

  const markCollected = () => updateParcel({ status: 'collected' }, 'Parcel marked as collected');
  const markInTransit = () => updateParcel({ status: 'in_transit' }, 'Parcel is now in transit');
  const markDelivered = () => updateParcel({ status: 'delivered', delivered_at: new Date().toISOString() }, 'Parcel delivered');

  const canAccept = isDriver && parcel.status === 'requested';
  const isAssignedDriver = isDriver && parcel.driver_email === user?.email;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-background w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border shadow-xl">
        <div className="sticky top-0 bg-background border-b px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-bold">{parcel.store_name}</p>
            <p className="text-xs text-muted-foreground">{parcel.tracking_number || `Parcel #${parcel.id}`}</p>
          </div>
          <button className="h-9 w-9 rounded-full border flex items-center justify-center hover:bg-muted" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <Badge variant="outline" className="rounded-full">
            {statusLabels[parcel.status] || parcel.status}
          </Badge>

          <div className="space-y-4">
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Pickup</p>
                <p className="text-sm text-muted-foreground">{parcel.pickup_address}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Navigation className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Delivery</p>
                <p className="text-sm text-muted-foreground">{parcel.delivery_address}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-muted/60 p-3">
              <p className="text-muted-foreground">Fee</p>
              <p className="font-bold">{parcel.currency || 'ZAR'} {parcel.price || 0}</p>
            </div>
            <div className="rounded-2xl bg-muted/60 p-3">
              <p className="text-muted-foreground">Payment</p>
              <p className="font-bold capitalize">{parcel.payment_method || 'cash'}</p>
            </div>
          </div>

          {(parcel.customer_name || parcel.customer_phone) && (
            <div className="rounded-2xl border p-4">
              <p className="text-sm font-semibold mb-2">Customer</p>
              <p className="text-sm">{parcel.customer_name}</p>
              {parcel.customer_phone && (
                <a href={`tel:${parcel.customer_phone}`} className="text-sm text-primary inline-flex items-center gap-1 mt-1">
                  <Phone className="h-3.5 w-3.5" /> {parcel.customer_phone}
                </a>
              )}
            </div>
          )}

          {parcel.driver_name && (
            <div className="rounded-2xl border p-4">
              <p className="text-sm font-semibold mb-2">Driver</p>
              <p className="text-sm">{parcel.driver_name}</p>
              {parcel.driver_phone && (
                <a href={`tel:${parcel.driver_phone}`} className="text-sm text-primary inline-flex items-center gap-1 mt-1">
                  <Phone className="h-3.5 w-3.5" /> {parcel.driver_phone}
                </a>
              )}
            </div>
          )}

          {parcel.notes && (
            <div className="rounded-2xl bg-muted/60 p-4">
              <p className="text-sm font-semibold mb-1">Notes</p>
              <p className="text-sm text-muted-foreground">{parcel.notes}</p>
            </div>
          )}

          {parcel.status === 'delivered' && parcel.driver_name && !parcel.driver_rating && !isDriver && (
            <DriverRating parcel={parcel} onRated={onUpdate} />
          )}

          {(canAccept || isAssignedDriver) && parcel.status !== 'delivered' && (
            <div className="space-y-2">
              {canAccept && (
                <Button className="w-full rounded-full gap-2" onClick={acceptJob} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                  Accept Job
                </Button>
              )}
              {isAssignedDriver && parcel.status === 'accepted' && (
                <Button className="w-full rounded-full gap-2" onClick={markCollected} disabled={loading}>
                  <PackageCheck className="h-4 w-4" /> Mark Collected
                </Button>
              )}
              {isAssignedDriver && parcel.status === 'collected' && (
                <Button className="w-full rounded-full gap-2" onClick={markInTransit} disabled={loading}>
                  <Truck className="h-4 w-4" /> Start Delivery
                </Button>
              )}
              {isAssignedDriver && parcel.status === 'in_transit' && (
                <Button className="w-full rounded-full gap-2" onClick={markDelivered} disabled={loading}>
                  <PackageCheck className="h-4 w-4" /> Mark Delivered
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
