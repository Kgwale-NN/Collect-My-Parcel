import React, { useState } from 'react';
import { DollarSign, TrendingUp, Star, Truck, ChevronDown, ChevronUp, Banknote, CreditCard, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

function EarningsStat({ icon: IconComp, label, value, color }) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4">
      <IconComp className={`h-5 w-5 ${color} mb-2`} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

const statusColors = {
  delivered: 'bg-green-100 text-green-800 border-green-200',
  in_transit: 'bg-orange-100 text-orange-800 border-orange-200',
  collected: 'bg-purple-100 text-purple-800 border-purple-200',
  accepted: 'bg-blue-100 text-blue-800 border-blue-200',
  requested: 'bg-amber-100 text-amber-800 border-amber-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function DriverEarnings({ parcels, user }) {
  const [showAll, setShowAll] = useState(false);

  // Only count jobs this driver completed
  const myDelivered = parcels.filter(
    p => p.status === 'delivered' && p.driver_email === user?.email
  );
  const myAll = parcels.filter(p => p.driver_email === user?.email);

  const totalEarnings = myDelivered.reduce((sum, p) => sum + (p.price || 0), 0);
  const currency = myDelivered[0]?.currency || 'ZAR';

  // This week earnings
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekEarnings = myDelivered
    .filter(p => new Date(p.created_date) >= weekAgo)
    .reduce((sum, p) => sum + (p.price || 0), 0);

  const avgRating = user?.rating ? user.rating.toFixed(1) : '—';

  // Today's earnings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEarnings = myDelivered
    .filter(p => new Date(p.created_date) >= today)
    .reduce((sum, p) => sum + (p.price || 0), 0);

  // Cash vs card breakdown
  const cashEarnings = myDelivered.filter(p => p.payment_method === 'cash').reduce((sum, p) => sum + (p.price || 0), 0);
  const cardEarnings = myDelivered.filter(p => p.payment_method === 'card').reduce((sum, p) => sum + (p.price || 0), 0);

  const displayedTrips = showAll ? myAll : myAll.slice(0, 5);

  return (
    <div className="mb-6 space-y-4">

      {/* Payment hero banner */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
        <p className="text-sm font-medium opacity-80 mb-1">Total Earnings</p>
        <p className="text-4xl font-extrabold tracking-tight mb-4">
          {currency} {totalEarnings.toLocaleString()}
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/15 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="h-3.5 w-3.5 opacity-80" />
              <span className="text-xs opacity-80">Today</span>
            </div>
            <p className="font-bold text-sm">{currency} {todayEarnings.toLocaleString()}</p>
          </div>
          <div className="bg-white/15 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Banknote className="h-3.5 w-3.5 opacity-80" />
              <span className="text-xs opacity-80">Cash</span>
            </div>
            <p className="font-bold text-sm">{currency} {cashEarnings.toLocaleString()}</p>
          </div>
          <div className="bg-white/15 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <CreditCard className="h-3.5 w-3.5 opacity-80" />
              <span className="text-xs opacity-80">Card</span>
            </div>
            <p className="font-bold text-sm">{currency} {cardEarnings.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Earnings stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <EarningsStat
          icon={DollarSign}
          label="Total Earned"
          value={`${currency} ${totalEarnings.toLocaleString()}`}
          color="text-green-600"
        />
        <EarningsStat
          icon={TrendingUp}
          label="This Week"
          value={`${currency} ${weekEarnings.toLocaleString()}`}
          color="text-primary"
        />
        <EarningsStat
          icon={Truck}
          label="Completed Trips"
          value={myDelivered.length}
          color="text-blue-500"
        />
        <EarningsStat
          icon={Star}
          label="Avg. Rating"
          value={avgRating}
          color="text-amber-500"
        />
      </div>

      {/* Trip history */}
      {myAll.length > 0 && (
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between">
            <p className="font-semibold text-sm">Trip History</p>
            <span className="text-xs text-muted-foreground">{myAll.length} total</span>
          </div>
          <div className="divide-y divide-border/40">
            {displayedTrips.map(p => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.store_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.delivery_address}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.created_date ? format(new Date(p.created_date), 'dd MMM yyyy') : '—'}
                    {p.distance_km ? ` · ${p.distance_km.toFixed(1)} km` : ''}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {p.status === 'delivered' && (
                    <span className="text-sm font-bold text-green-600">
                      +{p.currency || currency} {p.price || 0}
                    </span>
                  )}
                  <Badge variant="outline" className={`${statusColors[p.status]} border text-xs`}>
                    {p.status?.replace('_', ' ')}
                  </Badge>
                  {p.driver_rating && (
                    <span className="text-xs text-amber-600 flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" /> {p.driver_rating}/5
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {myAll.length > 5 && (
            <button
              className="w-full py-3 text-xs text-primary font-medium flex items-center justify-center gap-1 hover:bg-muted/40 transition-colors border-t border-border/40"
              onClick={() => setShowAll(v => !v)}
            >
              {showAll ? (
                <><ChevronUp className="h-3.5 w-3.5" /> Show less</>
              ) : (
                <><ChevronDown className="h-3.5 w-3.5" /> Show all {myAll.length} trips</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}