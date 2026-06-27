import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Truck, CheckCircle2, Clock, LogOut, Shield, AlertCircle } from 'lucide-react';
import ParcelCard from '@/components/dashboard/ParcelCard';
import ParcelDetail from '@/components/dashboard/ParcelDetail';
import AvailabilityToggle from '@/components/driver/AvailabilityToggle';
import DriverLocationUpdater from '@/components/driver/DriverLocationUpdater';
import DriverProfileCard from '@/components/dashboard/DriverProfileCard';
import DriverEarnings from '@/components/dashboard/DriverEarnings';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('all');
  const [selectedParcel, setSelectedParcel] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const isDriver = user?.role === 'driver';
  const isAdmin = user?.role === 'admin';
  const isPendingDriver = user?.driver_status === 'pending';

  const { data: parcels = [], isLoading, refetch } = useQuery({
    queryKey: ['parcels', user?.email, isDriver, isAdmin],
    queryFn: async () => {
      if (isAdmin) return base44.entities.Parcel.list('-created_date', 200);
      if (isDriver) {
        // Drivers see: all unassigned requested jobs + their own jobs
        const [open, mine] = await Promise.all([
          base44.entities.Parcel.filter({ status: 'requested' }, '-created_date', 50),
          base44.entities.Parcel.filter({ driver_email: user.email }, '-created_date', 50),
        ]);
        // Merge, deduplicate by id
        const map = new Map();
        [...open, ...mine].forEach(p => map.set(p.id, p));
        return Array.from(map.values()).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      }
      return base44.entities.Parcel.filter({ customer_email: user.email }, '-created_date', 50);
    },
    enabled: !!user?.email,
  });

  // Real-time updates
  useEffect(() => {
    if (!user?.email) return;
    const unsub = base44.entities.Parcel.subscribe(() => refetch());
    return unsub;
  }, [user?.email, refetch]);

  const filteredParcels = tab === 'all'
    ? parcels
    : tab === 'active'
    ? parcels.filter(p => ['requested', 'accepted', 'collected', 'in_transit'].includes(p.status))
    : parcels.filter(p => p.status === 'delivered');

  const stats = {
    total: parcels.length,
    active: parcels.filter(p => ['requested', 'accepted', 'collected', 'in_transit'].includes(p.status)).length,
    delivered: parcels.filter(p => p.status === 'delivered').length,
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">CMP</span>
          </Link>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="gap-1 rounded-full">
                  <Shield className="h-3.5 w-3.5" /> Admin
                </Button>
              </Link>
            )}
            {isDriver && user?.driver_status === 'approved' && (
              <AvailabilityToggle user={user} onUpdate={() => base44.auth.me().then(setUser)} />
            )}
            {!isDriver && !isAdmin && (
              <>
                <Link to="/my-deliveries">
                  <Button variant="outline" size="sm" className="gap-1 rounded-full hidden sm:flex">
                    <Truck className="h-3.5 w-3.5" /> My Deliveries
                  </Button>
                </Link>
                <Link to="/track">
                  <Button variant="outline" size="sm" className="gap-1 rounded-full hidden sm:flex">
                    <Package className="h-3.5 w-3.5" /> Track
                  </Button>
                </Link>
              </>
            )}
            {isPendingDriver && (
              <Badge className="bg-amber-100 text-amber-800 border border-amber-200 text-xs">
                <Clock className="h-3 w-3 mr-1" /> Under Review
              </Badge>
            )}
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.full_name}</span>
            <Button variant="ghost" size="icon" onClick={() => base44.auth.logout()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Driver profile card */}
        {isDriver && user?.driver_status === 'approved' && (
          <DriverProfileCard user={user} />
        )}

        {/* Driver earnings + trip history */}
        {isDriver && user?.driver_status === 'approved' && !isLoading && (
          <DriverEarnings parcels={parcels} user={user} />
        )}

        {/* Pending driver notice */}
        {isPendingDriver && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">Application Under Review</p>
              <p className="text-sm text-amber-700">Your driver application is being reviewed. You'll receive an email once approved (within 24 hours).</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Package, label: 'Total', value: stats.total, color: 'text-foreground' },
            { icon: Clock, label: 'Active', value: stats.active, color: 'text-primary' },
            { icon: CheckCircle2, label: 'Delivered', value: stats.delivered, color: 'text-green-600' },
          ].map((s, i) => (
            <div key={i} className="bg-card rounded-2xl p-4 border border-border/50">
              <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="bg-muted">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
            </TabsList>
          </Tabs>

          {!isDriver && !isAdmin && (
            <Link to="/request">
              <Button size="sm" className="rounded-full gap-1">
                <Plus className="h-4 w-4" /> New
              </Button>
            </Link>
          )}
        </div>

        {/* Parcel list */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredParcels.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-semibold mb-1">No parcels yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              {isDriver ? 'No jobs available right now. Check back soon.' : 'Request your first pickup to get started.'}
            </p>
            {!isDriver && !isAdmin && (
              <Link to="/request">
                <Button className="rounded-full">Request Pickup</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredParcels.map(parcel => (
              <ParcelCard key={parcel.id} parcel={parcel} onClick={setSelectedParcel} />
            ))}
          </div>
        )}
      </div>

      {/* Silently broadcast driver GPS to active parcels */}
      {isDriver && user?.driver_status === 'approved' && (
        <DriverLocationUpdater
          activeParcels={parcels.filter(p =>
            ['accepted', 'collected', 'in_transit'].includes(p.status) &&
            p.driver_email === user?.email
          )}
        />
      )}

      {selectedParcel && (
        <ParcelDetail
          parcel={selectedParcel}
          isDriver={isDriver && user?.driver_status === 'approved'}
          user={user}
          onClose={() => setSelectedParcel(null)}
          onUpdate={() => { refetch(); setSelectedParcel(null); }}
        />
      )}
    </div>
  );
}