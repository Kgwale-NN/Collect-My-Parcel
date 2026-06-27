import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Car, MapPin, FileText, CheckCircle, XCircle, ExternalLink, Star } from 'lucide-react';

const statusColors = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

export default function AdminDriverCard({ user, onApprove, onReject }) {
  const [loading, setLoading] = useState(false);

  const handle = async (fn) => {
    setLoading(true);
    await fn(user);
    setLoading(false);
  };

  return (
    <Card className="p-4 border-border/50">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-semibold">{user.full_name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant="outline" className={`${statusColors[user.driver_status] || statusColors.pending} border text-xs`}>
              {user.driver_status || 'pending'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {user.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {user.phone}</span>}
            {user.vehicle_type && <span className="flex items-center gap-1"><Car className="h-3 w-3" /> {user.vehicle_type}</span>}
            {user.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {user.city}{user.country ? `, ${user.country}` : ''}</span>}
            {user.total_deliveries > 0 && <span>{user.total_deliveries} deliveries</span>}
            {user.rating && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" /> {user.rating.toFixed(1)} rating
              </span>
            )}
          </div>

          {/* Document links */}
          <div className="flex gap-3 flex-wrap">
            {user.id_document_url && (
              <a href={user.id_document_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                <FileText className="h-3 w-3" /> View ID Document <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {user.license_url && (
              <a href={user.license_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                <FileText className="h-3 w-3" /> View License <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {user.driver_status === 'pending' && (
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="rounded-full gap-1 bg-green-600 hover:bg-green-700" disabled={loading}
                onClick={() => handle(onApprove)}>
                <CheckCircle className="h-3.5 w-3.5" /> Approve
              </Button>
              <Button size="sm" variant="destructive" className="rounded-full gap-1" disabled={loading}
                onClick={() => handle(onReject)}>
                <XCircle className="h-3.5 w-3.5" /> Reject
              </Button>
            </div>
          )}
          {user.driver_status === 'approved' && (
            <Button size="sm" variant="outline" className="rounded-full gap-1 text-red-600 border-red-200 hover:bg-red-50" disabled={loading}
              onClick={() => handle(onReject)}>
              <XCircle className="h-3.5 w-3.5" /> Revoke Approval
            </Button>
          )}
          {user.driver_status === 'rejected' && (
            <Button size="sm" variant="outline" className="rounded-full gap-1 text-green-600 border-green-200 hover:bg-green-50" disabled={loading}
              onClick={() => handle(onApprove)}>
              <CheckCircle className="h-3.5 w-3.5" /> Re-approve
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}