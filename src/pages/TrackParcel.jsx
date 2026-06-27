import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Package, ArrowLeft, MapPin, Clock, User, CheckCircle2, Truck, Circle, Navigation } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const STATUS_STEPS = [
  { key: 'requested', label: 'Requested', icon: Package },
  { key: 'accepted', label: 'Driver Assigned', icon: User },
  { key: 'collected', label: 'Collected', icon: CheckCircle2 },
  { key: 'in_transit', label: 'In Transit', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

const STATUS_COLORS = {
  requested: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  accepted: 'bg-blue-100 text-blue-800 border-blue-200',
  collected: 'bg-purple-100 text-purple-800 border-purple-200',
  in_transit: 'bg-orange-100 text-orange-800 border-orange-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

export default function TrackParcel() {
  const [search, setSearch] = useState('');
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [user, setUser] = useState(null);

  // Pre-fill from URL param
  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) { setSearch(id); handleSearch(id); }
  }, []);

  const handleSearch = async (val) => {
    const query = (val || search).trim();
    if (!query) return;
    setLoading(true);
    setNotFound(false);
    setParcel(null);

    // Try by tracking number first, then by parcel id
    let results = await base44.entities.Parcel.filter({ tracking_number: query }, '-created_date', 1);
    if (!results.length) {
      try {
        const byId = await base44.entities.Parcel.filter({ id: query }, '-created_date', 1);
        results = byId;
      } catch (_) { results = []; }
    }

    if (results.length) {
      setParcel(results[0]);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  const currentStepIndex = parcel ? STATUS_STEPS.findIndex(s => s.key === parcel.status) : -1;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/dashboard">
            <button className="h-9 w-9 rounded-full border flex items-center justify-center hover:bg-muted">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="font-bold leading-tight">Track Parcel</h1>
            <p className="text-xs text-muted-foreground">Enter tracking or order number</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Tracking number or order ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="rounded-xl h-12"
          />
          <Button onClick={() => handleSearch()} disabled={loading} className="rounded-xl h-12 px-5">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Track'}
          </Button>
        </div>

        {notFound && (
          <div className="bg-card rounded-2xl border border-border p-6 text-center">
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold">Parcel not found</p>
            <p className="text-sm text-muted-foreground mt-1">Check the tracking number and try again.</p>
          </div>
        )}

        {parcel && (
          <div className="space-y-4">
            {/* Status header */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-lg">{parcel.store_name}</p>
                  {parcel.tracking_number && (
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">#{parcel.tracking_number}</p>
                  )}
                </div>
                <Badge className={`${STATUS_COLORS[parcel.status]} border text-xs capitalize`}>
                  {parcel.status?.replace('_', ' ')}
                </Badge>
              </div>

              {/* Progress steps */}
              {parcel.status !== 'cancelled' && (
                <div className="flex items-center justify-between relative mt-6">
                  {/* connector line */}
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-border" />
                  <div
                    className="absolute top-4 left-4 h-0.5 bg-primary transition-all duration-500"
                    style={{ width: `${currentStepIndex <= 0 ? 0 : (currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                  />

                  {STATUS_STEPS.map((step, i) => {
                    const done = i <= currentStepIndex;
                    const active = i === currentStepIndex;
                    return (
                      <div key={step.key} className="flex flex-col items-center gap-1.5 z-10">
                        <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all
                          ${done ? 'bg-primary border-primary' : 'bg-background border-border'}`}>
                          <step.icon className={`h-3.5 w-3.5 ${done ? 'text-white' : 'text-muted-foreground'}`} />
                        </div>
                        <p className={`text-[9px] text-center leading-tight max-w-[50px] ${active ? 'font-bold text-primary' : done ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-card rounded-2xl border border-border divide-y divide-border">
              {[
                { icon: MapPin, label: 'Pickup from', value: parcel.pickup_address },
                { icon: Navigation, label: 'Deliver to', value: parcel.delivery_address },
                { icon: Clock, label: 'Preferred time', value: parcel.preferred_delivery_time || 'ASAP' },
                ...(parcel.driver_name ? [{ icon: User, label: 'Driver', value: parcel.driver_name }] : []),
              ].map((row, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                  <row.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{row.label}</p>
                    <p className="text-sm font-medium">{row.value}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between px-5 py-3.5">
                <p className="text-sm text-muted-foreground">Total fee</p>
                <p className="text-lg font-bold text-primary">{parcel.currency || 'ZAR'} {parcel.price}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}