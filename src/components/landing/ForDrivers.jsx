import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, BadgeCheck, Calendar, Car, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function ForDrivers() {
  const goToDriverSignup = () => {
    base44.auth.isAuthenticated().then(auth => {
      if (auth) window.location.href = '/driver-signup';
      else base44.auth.redirectToLogin('/driver-signup');
    });
  };

  return (
    <section id="for-drivers" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Driver network</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              A verified delivery network for flexible earners
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
              Drivers apply once, get reviewed by admin, and receive parcel jobs that fit their availability and service area.
            </p>

            <div className="space-y-5 mb-8">
              {[
                { icon: DollarSign, title: 'Transparent earnings', desc: "Completed deliveries feed the driver's earnings dashboard." },
                { icon: Calendar, title: 'Availability control', desc: 'Drivers go online only when they are ready to accept work.' },
                { icon: BadgeCheck, title: 'Reviewed profiles', desc: 'Admin approval protects the standard of the delivery network.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button size="lg" className="rounded-md px-8 gap-2" onClick={goToDriverSignup}>
              Sign up as a driver <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="hidden lg:flex justify-center">
            <div className="w-80 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                <div>
                  <p className="text-xs uppercase text-muted-foreground font-semibold">Driver status</p>
                  <p className="font-bold">Approved</p>
                </div>
                <Car className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-3">
                {[
                  ['Today', 'ZAR 640'],
                  ['Completed trips', '8'],
                  ['Average rating', '4.9/5'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
