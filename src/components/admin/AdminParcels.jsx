import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Package, MapPin, User } from 'lucide-react';

const statusConfig = {
  requested: { label: 'Requested', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  collected: { label: 'Collected', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  in_transit: { label: 'In Transit', color: 'bg-primary/10 text-primary border-primary/20' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Cancelled', color: 'bg-muted text-muted-foreground border-border' }
};

export default function AdminParcels() {
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: parcels = [], isLoading } = useQuery({
    queryKey: ['admin-parcels'],
    queryFn: () => base44.entities.Parcel.list('-created_date', 200),
  });

  const filtered = filterStatus === 'all' ? parcels : parcels.filter(p => p.status === filterStatus);

  const counts = Object.keys(statusConfig).reduce((acc, s) => {
    acc[s] = parcels.filter(p => p.status === s).length;
    return acc;
  }, {});

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
        {Object.entries(statusConfig).map(([s, cfg]) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s === filterStatus ? 'all' : s)}
            className={`rounded-xl p-3 text-left border transition-all ${filterStatus === s ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-card hover:border-primary/20'}`}
          >
            <p className="text-lg font-bold">{counts[s]}</p>
            <p className="text-xs text-muted-foreground">{cfg.label}</p>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No parcels found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(parcel => {
            const status = statusConfig[parcel.status] || statusConfig.requested;
            return (
              <Card key={parcel.id} className="p-4 border-border/50">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-semibold">{parcel.store_name}</h3>
                      <Badge variant="outline" className={`${status.color} border text-xs`}>{status.label}</Badge>
                    </div>
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{parcel.customer_name || parcel.customer_email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{parcel.pickup_address} → {parcel.delivery_address}</span>
                      </div>
                      {parcel.driver_name && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>Driver: {parcel.driver_name}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm font-bold text-primary">R{parcel.price || 0}</span>
                      {parcel.parcel_size && (
                        <span className="text-xs px-2 py-0.5 rounded bg-muted capitalize">{parcel.parcel_size}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}