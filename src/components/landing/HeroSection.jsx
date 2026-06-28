import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { isLocalDemo } from '@/lib/local-demo';

export default function HeroSection() {
  const handleProtectedNav = (path) => {
    if (isLocalDemo()) {
      window.location.href = path;
      return;
    }
    base44.auth.isAuthenticated().then(auth => {
      if (auth) window.location.href = path;
      else base44.auth.redirectToLogin(path);
    });
  };

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Package className="h-3.5 w-3.5" />
              Parcel collection made easy
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Can't collect
              <br />
              your parcel?
              <br />
              <span className="text-primary">We'll get it.</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-md leading-relaxed">
              Life gets busy. Post your pickup request and a verified driver will collect your parcel and deliver it when you're ready.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="rounded-full px-8 text-base gap-2 h-12"
                onClick={() => handleProtectedNav('/request')}>
                Request Pickup <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 text-base h-12"
                onClick={() => handleProtectedNav('/driver-signup')}>
                Become a Driver
              </Button>
            </div>

            <div className="mt-10 flex gap-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <span>Same-day collection</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span>Verified drivers</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-12 flex items-center justify-center">
                <div className="w-full max-w-sm space-y-4">
                  {/* Mock parcel cards */}
                  {[
                    { store: "Takealot", status: "In Transit", color: "bg-primary" },
                    { store: "Shein", status: "Ready to Collect", color: "bg-green-500" },
                    { store: "Amazon", status: "Delivered", color: "bg-muted-foreground" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.15 }}
                      className="bg-card rounded-2xl p-4 shadow-lg border border-border/50 flex items-center gap-4"
                    >
                      <div className={`h-10 w-10 rounded-xl ${item.color} bg-opacity-20 flex items-center justify-center`}>
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{item.store}</p>
                        <p className="text-xs text-muted-foreground">{item.status}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
