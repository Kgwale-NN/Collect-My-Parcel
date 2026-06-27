import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const features = [
  { icon: Zap, title: 'Instant matching', desc: 'Drivers are alerted the moment you submit. Average accept time under 5 minutes.' },
  { icon: Shield, title: 'Verified drivers', desc: 'Every driver passes an ID and document check before going live on the platform.' },
  { icon: Clock, title: 'Flexible timing', desc: 'Schedule same-day, next-day, or weekend deliveries — on your schedule.' },
];

const pricingSteps = [
  { label: 'Base fee', value: 'R90', note: 'Any distance up to 3 km' },
  { label: 'Per km after', value: '+ R22 /km', note: 'Charged per additional km' },
  { label: 'No hidden fees', value: '✓', note: 'Price shown before you confirm' },
];

export default function PricingSection() {
  const handleRequest = () => {
    base44.auth.isAuthenticated().then(auth => {
      if (auth) window.location.href = '/request';
      else base44.auth.redirectToLogin('/request');
    });
  };

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/40">
      <div className="max-w-7xl mx-auto">

        {/* Features */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Why choose CMP</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Built around your life</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-8 mb-20">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl border border-border/60 p-6 shadow-sm"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Pricing */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Simple, transparent fees</h2>
            <p className="text-muted-foreground mb-8">No surge pricing. No surprises. The price you see is the price you pay — shown before you confirm.</p>

            <div className="space-y-3">
              {pricingSteps.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-card rounded-xl border border-border/50 px-5 py-4">
                  <div>
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.note}</p>
                  </div>
                  <span className="text-primary font-bold text-lg">{item.value}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-4">Prices shown in ZAR. Switch currency when placing your order.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl border border-primary/20 p-8"
          >
            <h3 className="text-xl font-bold mb-2">Ready to send?</h3>
            <p className="text-muted-foreground text-sm mb-6">Get an instant price estimate in seconds — no account needed to browse.</p>
            <ul className="space-y-3 mb-8">
              {['Select pickup & drop-off on the map', 'Get an instant price estimate', 'Confirm & a driver is alerted immediately', 'Track your delivery in real time'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <Button size="lg" className="w-full rounded-full h-12 text-base font-semibold" onClick={handleRequest}>
              Request a Pickup
            </Button>
          </motion.div>
        </div>

      </div>
    </section>
  );
}