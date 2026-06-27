import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Bike, Loader2, Upload, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function DriverSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({ id: false, license: false });
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    phone: '',
    vehicle_type: 'motorcycle',
    address: '',
    city: '',
    country: '',
    id_document_url: '',
    license_url: ''
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u) setForm(prev => ({
        ...prev,
        phone: u.phone || '',
        city: u.city || '',
        country: u.country || '',
        id_document_url: u.id_document_url || '',
        license_url: u.license_url || '',
      }));
    });
  }, []);

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(prev => ({ ...prev, [field]: true }));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, [`${field}_url`]: file_url }));
    setUploading(prev => ({ ...prev, [field]: false }));
    toast.success('Document uploaded');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id_document_url) { toast.error('Please upload your ID document'); return; }
    setLoading(true);
    await base44.auth.updateMe({
      role: 'driver',
      driver_status: 'pending',
      phone: form.phone,
      vehicle_type: form.vehicle_type,
      address: form.address,
      city: form.city,
      country: form.country,
      id_document_url: form.id_document_url,
      license_url: form.license_url,
      is_available: false
    });

    // Notify admin via email
    await base44.integrations.Core.SendEmail({
      to: 'admin@collectmyparcel.com',
      subject: '🆕 New Driver Application',
      body: `New driver application from ${user?.full_name} (${user?.email}).\n\nVehicle: ${form.vehicle_type}\nCity: ${form.city}, ${form.country}\nPhone: ${form.phone}\n\nPlease review in the Admin Panel.`
    });

    toast.success('Application submitted! We\'ll review and notify you within 24 hours.');
    navigate('/driver-pending');
    setLoading(false);
  };

  // Already applied
  if (user?.driver_status === 'pending') {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-0 shadow-xl text-center p-8">
          <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Application Under Review</h2>
          <p className="text-muted-foreground mb-6">Your driver application is being reviewed. We'll email you within 24 hours.</p>
          <Link to="/dashboard"><Button className="rounded-full">Go to Dashboard</Button></Link>
        </Card>
      </div>
    );
  }

  if (user?.driver_status === 'approved') {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-0 shadow-xl text-center p-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">You're an Approved Driver!</h2>
          <p className="text-muted-foreground mb-6">You can now accept and complete parcel delivery jobs.</p>
          <Link to="/dashboard"><Button className="rounded-full">Go to Dashboard</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
              <Bike className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Become a Driver</CardTitle>
            <p className="text-sm text-muted-foreground">Upload your documents and we'll review your application within 24 hours.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={user?.full_name || ''} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled className="bg-muted" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input placeholder="+1 234 567 8900" value={form.phone}
                  onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input placeholder="e.g. Johannesburg" value={form.city}
                    onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Input placeholder="e.g. South Africa" value={form.country}
                    onChange={(e) => setForm(prev => ({ ...prev, country: e.target.value }))} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Vehicle Type *</Label>
                <Select value={form.vehicle_type} onValueChange={(v) => setForm(prev => ({ ...prev, vehicle_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motorcycle">🏍️ Motorcycle</SelectItem>
                    <SelectItem value="bicycle">🚲 Bicycle</SelectItem>
                    <SelectItem value="car">🚗 Car</SelectItem>
                    <SelectItem value="on_foot">🚶 On Foot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ID Upload */}
              <div className="space-y-2">
                <Label>ID Document / Passport *</Label>
                <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${form.id_document_url ? 'border-green-400 bg-green-50' : 'border-border hover:border-primary/50'}`}>
                  {form.id_document_url ? (
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">ID uploaded successfully</span>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {uploading.id ? 'Uploading...' : 'Click to upload ID or Passport'}
                      </p>
                      <input type="file" className="hidden" accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, 'id_document')} disabled={uploading.id} />
                    </label>
                  )}
                </div>
              </div>

              {/* License Upload */}
              <div className="space-y-2">
                <Label>Driver's License <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${form.license_url ? 'border-green-400 bg-green-50' : 'border-border hover:border-primary/50'}`}>
                  {form.license_url ? (
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">License uploaded</span>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {uploading.license ? 'Uploading...' : 'Click to upload driver\'s license'}
                      </p>
                      <input type="file" className="hidden" accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, 'license')} disabled={uploading.license} />
                    </label>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                📋 Your application will be reviewed by our team within <strong>24 hours</strong>. You'll receive an email once approved.
              </div>

              <Button type="submit" className="w-full rounded-full h-12 text-base" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}