import React from 'react';
import { Button } from '@/components/ui/button';
import { Bike, DollarSign, Calendar, ArrowRight } from 'lucide-react';
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
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">For Drivers</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Earn money collecting parcels
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">
              Already driving for Uber or Bolt? Add CMP to your routes and earn extra. Motorcycle, bicycle, car — all welcome.
            </p>

            <div className="space-y-5 mb-8">
              {[
                { icon: DollarSign, title: "Flexible earnings", desc: "Set your own hours, pick jobs that suit your route" },
                { icon: Calendar, title: "Work on your schedule", desc: "Accept jobs when you're available, no pressure" },
                { icon: Bike, title: "Any vehicle", desc: "Motorcycle, bicycle, or car — all accepted" }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button size="lg" className="rounded-full px-8 gap-2" onClick={goToDriverSignup}>
              Sign up as a driver <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden lg:flex justify-center"
          >
            <div className="w-80 h-80 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Bike className="h-32 w-32 text-primary/30" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}