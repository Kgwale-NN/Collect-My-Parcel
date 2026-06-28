import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, MapPin, Clock, User, Phone, Hash, FileText, Loader2, DollarSign, Navigation, Star } from 'lucide-react';
import { toast } from 'sonner';
import LiveTrackingMap from './LiveTrackingMap';
import DriverRating from './DriverRating';

const statusFlow = {
  requested: 'accepted',
  accepted: 'collected',
  collected: 'in_transit',
  in_transit: 'delivered'
};

const statusLabels = {
  requested: 'Waiting for driver',
  accepted: 'Driver assigned',
  collected: 'Collected',
  in_transit: 'On the way',
  delivered: 'Delivered ✅',
  cancelled: 'Cancelled'
};

const nextActionLabel = {
  requested: 'Accept Job',
  accepted: 'Mark as Collected',
  collected: 'Start Delivery',
  in_transit: 'Mark as Delivered'
};

const emailMessages = {
  accepted: (parcel) => ({
    subject: '🏍️ A driver is on the way to collect your parcel!',
    body: `Hi ${parcel.customer_name},\n\nGreat news! ${parcel.driver_name} has accepted your pickup job from ${parcel.store_name}.\n\nThey are heading to collect your parcel now.\n\nCollect My Parcel 📦`
  }),
  collected: (parcel) => ({
    subject: '📦 Your parcel has been collected!',
    body: `Hi ${parcel.customer_name},\n\nYour parcel from ${parcel.store_name} has been collected by ${parcel.driver_name}.\n\nIt will be delivered to: ${parcel.delivery_address}\nPreferred time: ${parcel.preferred_delivery_time || 'As soon as possible'}\n\nCollect My Parcel 📦`
  }),
  in_transit: (parcel) => ({
    subject: '🚀 Your parcel is on the way!',
    body: `Hi ${parcel.customer_name},\n\nYour parcel from ${parcel.store_name} is now on its way to you!\n\nDelivery address: ${parcel.delivery_address}\n\nGet ready — your driver ${parcel.driver_name} is heading your way!\n\nCollect My Parcel 📦`
  }),
  delivered: (parcel) => ({
    subject: '🎉 Your parcel has been delivered!',
    body: `Hi ${parcel.customer_name},\n\nYour parcel from ${parcel.store_name} has been successfully delivered!\n\nPayment: ${parcel.payment_method === 'cash' ? `Cash · $${parcel.price}` : `Card · $${parcel.price} (paid)`}\n\nThank you for using Collect My Parcel. We hope to serve you again!\n\nCollect My Parcel 📦`
  })
};

export default function ParcelDetail({ parcel, isDriver, user, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async () => {
    setLoading(true);
    const nextStatus = statusFlow[parcel.status];
    const updateData = { status: nextStatus };

    if (parcel.status === 'requested') {
      updateData.driver_email = user.email;
      updateData.driver_name = user.full_name;
    }

    // Update parcel
    await base44.entities.Parcel.update(parcel.id, updateData);

    // Increment driver delivery count when delivered
    if (nextStatus === 'delivered' && user?.email) {
      const currentCount = user.total_deliveries || 0;
      await base44.auth.updateMe({ total_deliveries: currentCount + 1 });
    }

    // Send email notification to customer
    const updatedParcel = { ...parcel, ...updateData };
    const emailData = emailMessages[nextStatus]?.(updatedParcel);
    if (emailData && parcel.customer_email) {
      await base44.integrations.Core.SendEmail({
        to: parcel.customer_email,
        subject: emailData.subject,
        body: emailData.body
      });
    }

    toast.success(`Status updated: ${statusLabels[nextStatus]}`);
    setLoading(false);
    onUpdate();
  };

  const handleCancel = async () => {
    setLoading(true);
    await base44.entities.Parcel.update(parcel.id, { status: 'cancelled' });
    await base44.integrations.Core.SendEmail({
      to: parcel.customer_email,
      subject: '❌ Parcel Request Cancelled',
      body: `Hi ${parcel.customer_name},\n\nYour parcel pickup request from ${parcel.store_name} has been cancelled.\n\nYou can submit a new request anytime on the app.\n\nCollect My Parcel 📦`
    });
    toast.success('Request cancelled');
    setLoading(false);
    onUpdate();
  };

  const rows = [
    { icon: Package, label: 'Store', value: parcel.store_name },
    { icon: Hash, label: 'Tracking', value: parcel.tracking_number || '—' },
    { icon: MapPin, label: 'Pickup from', value: parcel.pickup_address },
    { icon: Navigation, label: 'Deliver to', value: parcel.delivery_address },
    { icon: Clock, label: 'Preferred time', value: parcel.preferred_delivery_time || '—' },
    { icon: Phone, label: 'Customer phone', value: parcel.customer_phone || '—' },
    { icon: User, label: 'Customer', value: parcel.customer_name || parcel.customer_email },
    { icon: FileText, label: 'Notes', value: parcel.notes || '—' },
  ];

  if (parcel.driver_name) {
    rows.push({ icon: User, label: 'Driver', value: parcel.driver_name });
  }

  const canAdvance = isDriver && statusFlow[parcel.status] &&
    (parcel.driver_email === user?.email || parcel.status === 'requested');
  const canCancel = !isDriver && ['requested', 'accepted'].includes(parcel.status);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{parcel.store_name}</DialogTitle>
              <Badge variant="outline" className="mt-1 text-xs">{statusLabels[parcel.status]}</Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Live map — show when driver is active */}
        {['accepted', 'collected', 'in_transit'].includes(parcel.status) && (
          <div className="mt-2 mb-1">
            <LiveTrackingMap parcel={parcel} />
          </div>
        )}

        <div className="space-y-3 mt-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-start gap-3">
              <row.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{row.label}</p>
                <p className="text-sm font-medium">{row.value}</p>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2 border-t gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>{parcel.distance_km ? `${parcel.distance_km.toFixed(1)} km` : 'Distance N/A'}</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{parcel.payment_method === 'cash' ? '💵 Cash on delivery' : '💳 Card'}</p>
              <p className="text-xl font-bold text-primary">{parcel.currency || '$'}{parcel.price || 0}</p>
            </div>
          </div>
        </div>

        {/* Rating prompt for customers after delivery */}
        {!isDriver && parcel.status === 'delivered' && parcel.driver_name && !parcel.driver_rating && (
          <DriverRating parcel={parcel} onRated={onUpdate} />
        )}

        {/* Show submitted rating */}
        {!isDriver && parcel.status === 'delivered' && parcel.driver_rating && (
          <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2">
            <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />
            <span className="text-sm text-green-800">You rated {parcel.driver_name} <strong>{parcel.driver_rating}/5</strong></span>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          {canAdvance && (
            <Button onClick={handleStatusUpdate} className="flex-1 rounded-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : nextActionLabel[parcel.status]}
            </Button>
          )}
          {canCancel && (
            <Button variant="destructive" onClick={handleCancel} className="flex-1 rounded-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}