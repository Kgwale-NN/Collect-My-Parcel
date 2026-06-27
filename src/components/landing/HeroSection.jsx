import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, ShieldCheck, Truck } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function HeroSection() {
  const handleRequestPickup = () => {
    base44.auth.isAuthenticated().then(auth => {
      if (auth) window.location.href = '/request';
      else base44.auth.redirectToLogin('/request');
    });
  };

  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
            <Truck className="h-4 w-4" />
            Same-day parcel collection
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Collect My Parcel
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Book a verified driver to collect store orders, marketplace parcels, and errands, then track the delivery until it reaches your door.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="rounded-full gap-2" onClick={handleRequestPickup}>
              Request Pickup
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full" onClick={() => { window.location.href = '/track'; }}>
              Track Parcel
            </Button>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Verified drivers</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">Live tracking</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-[2rem] bg-muted border border-border/60 p-5 shadow-xl">
            <div className="bg-card rounded-3xl border border-border/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Today&apos;s pickup</p>
                <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">Driver nearby</span>
              </div>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pickup</p>
                    <p className="text-sm text-muted-foreground">Store counter, Sandton City</p>
                  </div>
                </div>
                <div className="ml-4 h-8 border-l border-dashed border-border" />
                <div className="flex gap-3">
                  <div className="h-9 w-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Delivery</p>
                    <p className="text-sm text-muted-foreground">Home address, Rosebank</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-primary text-primary-foreground p-4">
                <p className="text-sm opacity-80">Estimated fee</p>
                <p className="text-3xl font-bold">ZAR 149</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
