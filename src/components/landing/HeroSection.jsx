import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, MapPin, Route, ShieldCheck, Truck } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function HeroSection() {
  const handleRequestPickup = () => {
    base44.auth.isAuthenticated().then(auth => {
      if (auth) window.location.href = '/request';
      else base44.auth.redirectToLogin('/request');
    });
  };

  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-14 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-px bg-border" />
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.02fr_0.98fr] gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary mb-6">
            <Truck className="h-4 w-4" />
            On-demand parcel collection and delivery
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight max-w-3xl">
            Collect My Parcel
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            A verified driver network for collecting missed parcels, depot orders, lockers, and retail pickups, with live tracking from assignment to delivery.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md">
            <Button size="lg" className="rounded-md gap-2 h-12" onClick={handleRequestPickup}>
              Request Pickup
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-md h-12" onClick={() => { window.location.href = '/track'; }}>
              Track Parcel
            </Button>
          </div>
          <div className="mt-8 grid sm:grid-cols-3 gap-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold">Verified drivers</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold">Live tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold">Transparent pricing</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-2xl bg-card border border-border p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div>
                <p className="text-xs uppercase text-muted-foreground font-semibold">Active delivery</p>
                <p className="font-bold">Order CMP-2048</p>
              </div>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">In transit</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Route overview</p>
                <span className="text-xs text-muted-foreground">ETA 18 min</span>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pickup</p>
                    <p className="text-sm text-muted-foreground">Courier depot, Sandton</p>
                  </div>
                </div>
                <div className="ml-4 h-8 border-l border-dashed border-border" />
                <div className="flex gap-3 items-start">
                  <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                    <Route className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Delivery</p>
                    <p className="text-sm text-muted-foreground">Customer address, Rosebank</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border p-3">
                  <p className="text-xs text-muted-foreground">Fee</p>
                  <p className="font-bold">ZAR 156</p>
                </div>
                <div className="rounded-xl border border-border p-3">
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="font-bold">6.0 km</p>
                </div>
                <div className="rounded-xl border border-border p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-bold">Live</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
