import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import UberAddressInput from '@/components/request/UberAddressInput';
import RouteMap from '@/components/request/RouteMap';
import PaymentSection from '@/components/request/PaymentSection';
import PriceEstimate from '@/components/request/PriceEstimate';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

const BASE_FEE = 5;
const RATE_PER_KM = 1.2;

export default function RequestParcel() {
  const navigate = useNavigate();
  const mapsLoaded = useGoogleMaps();

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [estimating, setEstimating] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [pickup, setPickup] = useState(null);    // { address, lat, lng, name }
  const [delivery, setDelivery] = useState(null);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });

  const [form, setForm] = useState({
    store_name: '',
    tracking_number: '',
    customer_phone: '',
    preferred_delivery_time: '',
    notes: '',
    payment_method: 'cash',
    currency: 'ZAR'
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.phone) setForm(prev => ({ ...prev, customer_phone: u.phone }));
      // Drivers shouldn't request parcels
      if (u?.role === 'driver') navigate('/dashboard');
    }).catch(() => base44.auth.redirectToLogin('/request'));
  }, []);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handlePickupSelect = (place) => {
    setPickup(place);
    // Auto-fill store name from place name if not set
    if (!form.store_name && place.name && place.name !== place.address) {
      setForm(prev => ({ ...prev, store_name: place.name }));
    }
    setEstimate(null);
  };

  const handleDeliverySelect = (place) => {
    setDelivery(place);
    setEstimate(null);
  };

  const estimatePrice = async () => {
    if (!pickup || !delivery) {
      toast.error('Select both pickup and delivery locations');
      return;
    }
    setEstimating(true);

    // Use exact coordinates for accurate distance
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Calculate the driving distance in kilometers between these two GPS coordinates:
      Pickup: lat=${pickup.lat}, lng=${pickup.lng} (${pickup.address})
      Delivery: lat=${delivery.lat}, lng=${delivery.lng} (${delivery.address})
      
      Return JSON: { "distance_km": number, "duration_minutes": number }
      Use straight-line distance * 1.3 as driving estimate if unsure.`,
      response_json_schema: {
        type: 'object',
        properties: {
          distance_km: { type: 'number' },
          duration_minutes: { type: 'number' }
        }
      }
    });

    const distKm = Math.max(result.distance_km || 3, 1);
    const currencyMultipliers = { ZAR: 18, USD: 1, GBP: 0.79, EUR: 0.93, NGN: 1600, KES: 130, GHS: 15 };
    const mult = currencyMultipliers[form.currency] || 1;
    const price = Math.round((BASE_FEE + distKm * RATE_PER_KM) * mult);
    setEstimate({ distance_km: distKm, duration_minutes: result.duration_minutes, price, feasible: true });
    setEstimating(false);
  };

  // Auto-estimate when both locations are set
  useEffect(() => {
    if (pickup && delivery) estimatePrice();
  }, [pickup, delivery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pickup || !delivery) { toast.error('Please select pickup and delivery locations on the map'); return; }
    if (!form.store_name) { toast.error('Please enter the store name'); return; }
    if (!estimate) { toast.error('Price is being calculated...'); return; }

    if (form.payment_method === 'card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
        toast.error('Please fill in all card details');
        return;
      }
    }

    setLoading(true);

    await base44.entities.Parcel.create({
      store_name: form.store_name,
      tracking_number: form.tracking_number || undefined,
      pickup_address: pickup.address,
      pickup_lat: pickup.lat,
      pickup_lng: pickup.lng,
      delivery_address: delivery.address,
      delivery_lat: delivery.lat,
      delivery_lng: delivery.lng,
      customer_name: user?.full_name || '',
      customer_email: user?.email || '',
      customer_phone: form.customer_phone || '',
      notes: form.notes || '',
      preferred_delivery_time: form.preferred_delivery_time || '',
      payment_method: form.payment_method,
      currency: form.currency,
      status: 'requested',
      price: estimate.price,
      distance_km: estimate.distance_km,
      payment_status: form.payment_method === 'card' ? 'paid' : 'pending'
    });

    // Confirm email to customer
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: '📦 Pickup Request Confirmed — Collect My Parcel',
      body: `Hi ${user.full_name},\n\nYour pickup request is confirmed!\n\n📍 Pickup: ${pickup.address}\n🏠 Deliver to: ${delivery.address}\n🏪 Store: ${form.store_name}\n💰 Fee: ${form.currency} ${estimate.price}\n💳 Payment: ${form.payment_method === 'cash' ? 'Cash on delivery' : form.payment_method === 'card' ? 'Card (paid)' : 'Wallet/EFT'}\n\nA driver will accept your job soon!\n\nCollect My Parcel 📦`
    });

    // Notify all available approved drivers about the new job
    const availableDrivers = await base44.entities.User.filter({
      role: 'driver',
      driver_status: 'approved',
      is_available: true
    });

    const driverEmails = availableDrivers.map(d => d.email).filter(Boolean);
    await Promise.all(driverEmails.map(email =>
      base44.integrations.Core.SendEmail({
        to: email,
        subject: '🚨 New Delivery Job Available — Collect My Parcel',
        body: `Hi there,\n\nA new delivery job just came in — be the first to accept it!\n\n🏪 Store: ${form.store_name}\n📍 Pickup: ${pickup.address}\n🏠 Deliver to: ${delivery.address}\n📏 Distance: ~${estimate.distance_km.toFixed(1)} km\n💰 Payout: ${form.currency} ${estimate.price}\n💳 Payment: ${form.payment_method === 'cash' ? 'Cash on delivery' : 'Card (pre-paid)'}\n\nLog in to the app now to accept this job before another driver does!\n\nCollect My Parcel 📦`
      })
    ));

    toast.success('Request placed! Driver will be assigned shortly.');
    setLoading(false);
    navigate('/dashboard');
  };

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
            <h1 className="font-bold leading-tight">Request a Pickup</h1>
            <p className="text-xs text-muted-foreground">Select locations on the map</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* UBER-STYLE ADDRESS INPUT */}
          <div>
            {!mapsLoaded ? (
              <div className="bg-white rounded-2xl border border-border shadow-lg px-4 py-5 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading maps...
              </div>
            ) : (
              <UberAddressInput
                mapsLoaded={mapsLoaded}
                onPickupSelect={handlePickupSelect}
                onDeliverySelect={handleDeliverySelect}
              />
            )}
          </div>

          {/* Store name + tracking — inline below route */}
          <div className="bg-white rounded-2xl shadow-md border border-border px-4 py-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="shrink-0 w-3" />
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Store / Sender</p>
                <Input
                  placeholder="e.g. Takealot, Pick n Pay, Amazon"
                  value={form.store_name}
                  onChange={(e) => handleChange('store_name', e.target.value)}
                  required
                  className="border-0 border-b border-border/60 rounded-none px-0 h-8 text-sm font-medium shadow-none focus-visible:ring-0 bg-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="shrink-0 w-3" />
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Order / Tracking No.</p>
                <Input
                  placeholder="Optional"
                  value={form.tracking_number}
                  onChange={(e) => handleChange('tracking_number', e.target.value)}
                  className="border-0 border-b border-border/60 rounded-none px-0 h-8 text-sm shadow-none focus-visible:ring-0 bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* LIVE MAP */}
          {mapsLoaded && (pickup || delivery) && (
            <Card className="border-0 shadow-md overflow-hidden p-0">
              <RouteMap pickup={pickup} delivery={delivery} />
              {pickup && delivery && (
                <div className="px-4 py-3 flex items-center justify-between bg-card">
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" /> {pickup.address}</div>
                    <div className="flex items-center gap-1"><MapPin className="h-3 w-3 text-green-600" /> {delivery.address}</div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* PRICE ESTIMATE */}
          {estimating && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" /> Calculating price...
            </div>
          )}
          {estimate && !estimating && <PriceEstimate estimate={estimate} currency={form.currency} />}

          {/* STEP 3 — Details */}
          <Card className="border-0 shadow-md">
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-6 w-6 rounded-full bg-primary/80 text-primary-foreground text-xs font-bold flex items-center justify-center">3</div>
                <p className="font-semibold">Delivery details</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Your Phone</Label>
                  <Input placeholder="+27 82 000 0000" value={form.customer_phone}
                    onChange={(e) => handleChange('customer_phone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={form.currency} onValueChange={(v) => { handleChange('currency', v); setEstimate(null); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ZAR">🇿🇦 ZAR</SelectItem>
                      <SelectItem value="USD">🇺🇸 USD</SelectItem>
                      <SelectItem value="GBP">🇬🇧 GBP</SelectItem>
                      <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
                      <SelectItem value="NGN">🇳🇬 NGN</SelectItem>
                      <SelectItem value="KES">🇰🇪 KES</SelectItem>
                      <SelectItem value="GHS">🇬🇭 GHS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preferred Delivery Time</Label>
                <Input placeholder="e.g. Today after 5pm, Saturday morning"
                  value={form.preferred_delivery_time}
                  onChange={(e) => handleChange('preferred_delivery_time', e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Notes for driver</Label>
                <Textarea placeholder="Gate code, special instructions, fragile items..."
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>

          {/* STEP 4 — Payment */}
          <Card className="border-0 shadow-md">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded-full bg-primary/80 text-primary-foreground text-xs font-bold flex items-center justify-center">4</div>
                <p className="font-semibold">How will you pay?</p>
              </div>
              <PaymentSection
                value={form.payment_method}
                onChange={(v) => handleChange('payment_method', v)}
                cardDetails={cardDetails}
                onCardChange={(field, val) => setCardDetails(prev => ({ ...prev, [field]: val }))}
              />
            </CardContent>
          </Card>

          {/* CONFIRM BUTTON */}
          <div className="pb-8">
            <Button
              type="submit"
              className="w-full rounded-2xl h-14 text-base font-bold shadow-lg"
              disabled={loading || !pickup || !delivery || !estimate || estimating}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : estimate ? (
                `Confirm & Place Order · ${form.currency} ${estimate.price}`
              ) : (
                'Select locations to continue'
              )}
            </Button>

            {(!pickup || !delivery) && (
              <p className="text-center text-xs text-muted-foreground mt-2">
                Search and select both pickup and delivery locations above
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}