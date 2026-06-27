import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Eye, Bike, Phone, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

const statusColors = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  not_applied: 'bg-muted text-muted-foreground border-border'
};

export default function AdminDrivers() {
  const queryClient = useQueryClient();
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loadingAction, setLoadingAction] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['admin-drivers'],
    queryFn: () => base44.entities.User.filter({ role: 'driver' }, '-created_date', 100),
  });

  const filtered = filterStatus === 'all'
    ? drivers
    : drivers.filter(d => d.driver_status === filterStatus);

  const handleApprove = async (driver) => {
    setLoadingAction('approve');
    await base44.entities.User.update(driver.id, { driver_status: 'approved', is_available: true });
    await base44.integrations.Core.SendEmail({
      to: driver.email,
      subject: '🎉 You\'re approved as a CMP Driver!',
      body: `Hi ${driver.full_name},\n\nGreat news! Your driver application for Collect My Parcel has been approved.\n\nYou can now log in and start accepting parcel pickup jobs.\n\nWelcome to the team!\n\nThe CMP Team`
    });
    toast.success('Driver approved and notified by email');
    setSelectedDriver(null);
    setLoadingAction(null);
    queryClient.invalidateQueries(['admin-drivers']);
  };

  const handleReject = async (driver) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setLoadingAction('reject');
    await base44.entities.User.update(driver.id, {
      driver_status: 'rejected',
      rejection_reason: rejectionReason,
      is_available: false
    });
    await base44.integrations.Core.SendEmail({
      to: driver.email,
      subject: 'Your CMP Driver Application Update',
      body: `Hi ${driver.full_name},\n\nThank you for applying to be a CMP driver.\n\nUnfortunately, we're unable to approve your application at this time.\n\nReason: ${rejectionReason}\n\nYou're welcome to re-apply with updated documents.\n\nThe CMP Team`
    });
    toast.success('Driver rejected and notified by email');
    setSelectedDriver(null);
    setRejectionReason('');
    setLoadingAction(null);
    queryClient.invalidateQueries(['admin-drivers']);
  };

  const pendingCount = drivers.filter(d => d.driver_status === 'pending').length;

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['pending', 'approved', 'rejected', 'all'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filterStatus === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            {s === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-primary-foreground text-primary rounded-full px-1.5 py-0.5 text-xs">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No {filterStatus === 'all' ? '' : filterStatus} driver applications
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(driver => (
            <Card key={driver.id} className="p-4 border-border/50">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                    {driver.full_name?.[0] || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{driver.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{driver.email}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {driver.vehicle_type && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Bike className="h-3 w-3" /> {driver.vehicle_type}
                        </span>
                      )}
                      {driver.phone && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" /> {driver.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={`${statusColors[driver.driver_status || 'not_applied']} border text-xs`}>
                    {driver.driver_status || 'not applied'}
                  </Badge>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => setSelectedDriver(driver)}>
                    <Eye className="h-3.5 w-3.5" /> Review
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Driver Review Dialog */}
      {selectedDriver && (
        <Dialog open onOpenChange={() => { setSelectedDriver(null); setRejectionReason(''); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Driver Application</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Driver Info */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground w-20">Name:</span>
                  <span className="font-medium">{selectedDriver.full_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground w-20">Email:</span>
                  <span className="font-medium">{selectedDriver.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground w-20">Phone:</span>
                  <span className="font-medium">{selectedDriver.phone || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground w-20">Vehicle:</span>
                  <span className="font-medium">{selectedDriver.vehicle_type || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground w-20">Area:</span>
                  <span className="font-medium">{selectedDriver.address || '—'}</span>
                </div>
              </div>

              {/* ID Document */}
              <div>
                <p className="text-sm font-medium mb-2">Uploaded ID / License</p>
                {selectedDriver.id_document_url ? (
                  <a
                    href={selectedDriver.id_document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 border rounded-xl hover:bg-muted/50 transition-colors text-sm text-primary"
                  >
                    <FileText className="h-4 w-4" />
                    View Document
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No document uploaded</p>
                )}
              </div>

              {/* Rejection reason input */}
              {selectedDriver.driver_status === 'pending' && (
                <div>
                  <p className="text-sm font-medium mb-2">Rejection reason (only if rejecting)</p>
                  <Input
                    placeholder="e.g. ID photo is unclear, please resubmit"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              )}

              {/* Action buttons */}
              {selectedDriver.driver_status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 gap-2 rounded-full"
                    onClick={() => handleApprove(selectedDriver)}
                    disabled={!!loadingAction}
                  >
                    {loadingAction === 'approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2 rounded-full"
                    onClick={() => handleReject(selectedDriver)}
                    disabled={!!loadingAction}
                  >
                    {loadingAction === 'reject' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    Reject
                  </Button>
                </div>
              )}

              {selectedDriver.driver_status === 'approved' && (
                <p className="text-center text-sm text-green-600 font-medium">✓ This driver is approved</p>
              )}

              {selectedDriver.driver_status === 'rejected' && (
                <div className="bg-red-50 rounded-xl p-3 text-sm text-red-700">
                  <strong>Rejected reason:</strong> {selectedDriver.rejection_reason}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}