import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Package, ArrowLeft, MapPin, Navigation, Clock, Star, ChevronDown, ChevronUp, Plus, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import ParcelDetail from '@/components/dashboard/ParcelDetail';

const statusConfig = {
  requested:  { label: 'Waiting for driver', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  accepted:   { label: 'Driver assigned',    color: 'bg-blue-100 text-blue-800 border-blue-200' },
  collected:  { label: 'Collected',          color: 'bg-purple-100 text-purple-800 border-purple-200' },
  in_transit: { label: 'On the way',         color: 'bg-orange-100 text-orange-800 border-orange-200' },
  delivered:  { label: 'Delivered',          color: 'bg-green-100 text-green-800 border-green-200' },
  cancelled:  { label: 'Cancelled',          color: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const ACTIVE = ['requested', 'accepted', 'collected', 'in_transit'];

function DeliveryCard({ parcel, onSelect }) {
  const status = statusConfig[parcel.status] || statusConfig.requested;
  const isActive = ACTIVE.includes(parcel.status);

  return (
    <div
      className="bg-card rounded-2xl border border-border/50 p-5 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.99]"
      onClick={() => onSelect(parcel)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-primary/10' : 'bg-muted'}`}>
            <Package className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <p className="font-semibold leading-tight">{parcel.store_name}</p>
            {parcel.tracking_number && (
              <p className="text-xs text-muted-foreground font-mono">#{parcel.tracking_number}</p>
            )}
          </div>
        </div>
        <Badge variant="outline" className={`${status.color} border text-xs shrink-0`}>
          {status.label}
        </Badge>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0 mt-0.5 text-primary" />
          <span className="truncate">{parcel.pickup_address}</span>
        </div>
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Navigation className="h-3 w-3 shrink-0 mt-0.5 text-green-600" />
          <span className="truncate">{parcel.delivery_address}</span>
        </div>
        {parcel.preferred_delivery_time && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" />
            <span>{parcel.preferred_delivery_time}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/40">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-primary">{parcel.currency || 'ZAR'} {parcel.price || 0}</span>
          <span className="text-xs text-muted-foreground capitalize">{parcel.payment_method}</span>
          {parcel.driver_name && (
            <span className="text-xs text-muted-foreground">· {parcel.driver_name}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {parcel.status === 'delivered' && parcel.driver_rating && (
            <span className="flex items-center gap-1 text-xs text-amber-600">
              <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" /> {parcel.driver_rating}/5
            </span>
          )}
          {parcel.status === 'delivered' && !parcel.driver_rating && parcel.driver_name && (
            <span className="text-xs text-primary font-medium">Rate driver →</span>
          )}
          <span className="text-xs text-muted-foreground">
            {parcel.created_date ? format(new Date(parcel.created_date), 'dd MMM yyyy') : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MyDeliveries() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('active');
  const [selectedParcel, setSelectedParcel] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (!u) base44.auth.redirectToLogin('/my-deliveries');
    }).catch(() => base44.auth.redirectToLogin('/my-deliveries'));
  }, []);

  const { data: parcels = [], isLoading, refetch } = useQuery({
    queryKey: ['my-deliveries', user?.email],
    queryFn: () => base44.entities.Parcel.filter({ customer_email: user.email }, '-created_date', 100),
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (!user?.email) return;
    const unsub = base44.entities.Parcel.subscribe(() => refetch());
    return unsub;
  }, [user?.email, refetch]);

  const active    = parcels.filter(p => ACTIVE.includes(p.status));
  const delivered = parcels.filter(p => p.status === 'delivered');
  const cancelled = parcels.filter(p => p.status === 'cancelled');

  const displayedParcels =
    tab === 'active'    ? active :
    tab === 'delivered' ? delivered : cancelled;

  const unrated = delivered.filter(p => p.driver_name && !p.driver_rating).length;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <button className="h-9 w-9 rounded-full border flex items-center justify-center hover:bg-muted">
                <ArrowLeft className="h-4 w-4" />
              </button>
            </Link>
            <div>
              <h1 className="font-bold leading-tight">My Deliveries</h1>
              <p className="text-xs text-muted-foreground">{parcels.length} total requests</p>
            </div>
          </div>
          <Link to="/request">
            <Button size="sm" className="rounded-full gap-1">
              <Plus className="h-4 w-4" /> New
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active',    value: active.length,    color: 'text-primary' },
            { label: 'Delivered', value: delivered.length, color: 'text-green-600' },
            { label: 'Cancelled', value: cancelled.length, color: 'text-muted-foreground' },
          ].map((s, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border/50 p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Unrated nudge */}
        {unrated > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-sm text-amber-800">
            <Star className="h-4 w-4 fill-amber-400 stroke-amber-400 shrink-0" />
            You have <strong>{unrated}</strong> delivered parcel{unrated > 1 ? 's' : ''} waiting for a driver rating. Tap to rate!
          </div>
        )}

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-muted w-full">
            <TabsTrigger value="active" className="flex-1">Active {active.length > 0 && `(${active.length})`}</TabsTrigger>
            <TabsTrigger value="delivered" className="flex-1">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled" className="flex-1">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayedParcels.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-semibold mb-1">No {tab} deliveries</p>
            {tab === 'active' && (
              <>
                <p className="text-sm text-muted-foreground mb-4">Request a pickup to get started.</p>
                <Link to="/request"><Button className="rounded-full">Request Pickup</Button></Link>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedParcels.map(p => (
              <DeliveryCard key={p.id} parcel={p} onSelect={setSelectedParcel} />
            ))}
          </div>
        )}
      </div>

      {selectedParcel && (
        <ParcelDetail
          parcel={selectedParcel}
          isDriver={false}
          user={user}
          onClose={() => setSelectedParcel(null)}
          onUpdate={() => { refetch(); setSelectedParcel(null); }}
        />
      )}
    </div>
  );
}