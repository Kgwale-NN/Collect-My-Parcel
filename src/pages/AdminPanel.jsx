import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Package, Users, CheckCircle, ArrowLeft, Shield, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import AdminDriverCard from '@/components/admin/AdminDriverCard';
import AdminParcelRow from '@/components/admin/AdminParcelRow';

export default function AdminPanel() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  // Admin-only guard
  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.role !== 'admin') navigate('/dashboard');
    }).catch(() => base44.auth.redirectToLogin('/admin'));
  }, []);

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.filter({ role: 'driver' }),
    refetchInterval: 30000,
  });

  const { data: parcels = [], refetch: refetchParcels } = useQuery({
    queryKey: ['admin-parcels'],
    queryFn: () => base44.entities.Parcel.list('-created_date', 200),
    refetchInterval: 20000,
  });

  const pendingDrivers = users.filter(u => u.driver_status === 'pending');
  const approvedDrivers = users.filter(u => u.driver_status === 'approved');
  const rejectedDrivers = users.filter(u => u.driver_status === 'rejected');

  const handleApprove = async (user) => {
    await base44.entities.User.update(user.id, { driver_status: 'approved', role: 'driver' });
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: '🎉 You\'re approved as a CMP Driver!',
      body: `Hi ${user.full_name},\n\nGreat news! Your driver application has been approved. You can now log in and start accepting parcel delivery jobs.\n\nWelcome to the CMP Driver team!\n\nCollect My Parcel`
    });
    toast.success('Driver approved & notified');
    qc.invalidateQueries({ queryKey: ['admin-users'] });
  };

  const handleReject = async (user) => {
    await base44.entities.User.update(user.id, { driver_status: 'rejected' });
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: 'CMP Driver Application Update',
      body: `Hi ${user.full_name},\n\nThank you for applying to be a CMP driver. Unfortunately, we were unable to approve your application at this time.\n\nYou may reapply with updated documents.\n\nCollect My Parcel`
    });
    toast.success('Driver rejected & notified');
    qc.invalidateQueries({ queryKey: ['admin-users'] });
  };

  const deliveredParcels = parcels.filter(p => p.status === 'delivered');
  const totalRevenue = deliveredParcels.reduce((sum, parcel) => sum + (Number(parcel.price) || 0), 0);
  const primaryCurrency = deliveredParcels[0]?.currency || 'ZAR';

  const stats = [
    { label: 'Total Parcels', value: parcels.length, icon: Package, color: 'text-primary' },
    { label: 'Active Jobs', value: parcels.filter(p => ['requested','accepted','collected','in_transit'].includes(p.status)).length, icon: Package, color: 'text-amber-500' },
    { label: 'Delivered', value: parcels.filter(p => p.status === 'delivered').length, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Revenue', value: `${primaryCurrency} ${totalRevenue.toLocaleString()}`, icon: Banknote, color: 'text-emerald-600' },
    { label: 'Pending Drivers', value: pendingDrivers.length, icon: Users, color: 'text-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-background border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg">Admin Panel</span>
            </div>
          </div>
          {pendingDrivers.length > 0 && (
            <Badge className="bg-amber-100 text-amber-800 border border-amber-200">
              {pendingDrivers.length} pending review
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {stats.map((s, i) => (
            <Card key={i} className="p-4 border-border/50">
              <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="drivers">
          <TabsList className="mb-4">
            <TabsTrigger value="drivers">
              Driver Applications {pendingDrivers.length > 0 && `(${pendingDrivers.length})`}
            </TabsTrigger>
            <TabsTrigger value="parcels">All Parcels</TabsTrigger>
          </TabsList>

          <TabsContent value="drivers" className="space-y-6">
            {pendingDrivers.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-amber-600">⏳ Pending Review ({pendingDrivers.length})</h3>
                <div className="space-y-3">
                  {pendingDrivers.map(u => (
                    <AdminDriverCard key={u.id} user={u} onApprove={handleApprove} onReject={handleReject} />
                  ))}
                </div>
              </div>
            )}
            {approvedDrivers.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-green-600">✅ Approved Drivers ({approvedDrivers.length})</h3>
                <div className="space-y-3">
                  {approvedDrivers.map(u => (
                    <AdminDriverCard key={u.id} user={u} onApprove={handleApprove} onReject={handleReject} />
                  ))}
                </div>
              </div>
            )}
            {rejectedDrivers.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-muted-foreground">❌ Rejected ({rejectedDrivers.length})</h3>
                <div className="space-y-3">
                  {rejectedDrivers.map(u => (
                    <AdminDriverCard key={u.id} user={u} onApprove={handleApprove} onReject={handleReject} />
                  ))}
                </div>
              </div>
            )}
            {users.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No driver applications yet.</div>
            )}
          </TabsContent>

          <TabsContent value="parcels">
            <div className="rounded-xl border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium">Store</th>
                    <th className="text-left p-3 font-medium hidden sm:table-cell">Customer</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">Driver</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium hidden sm:table-cell">Price</th>
                    <th className="text-left p-3 font-medium hidden lg:table-cell">Payment</th>
                    <th className="text-left p-3 font-medium hidden xl:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {parcels.map(p => <AdminParcelRow key={p.id} parcel={p} />)}
                </tbody>
              </table>
              {parcels.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">No parcels yet.</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
