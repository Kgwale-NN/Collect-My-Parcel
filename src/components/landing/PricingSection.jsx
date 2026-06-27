import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const features = [
  { icon: Zap, title: 'Fast driver matching', desc: 'Approved drivers are alerted as soon as a pickup is submitted.' },
  { icon: Shield, title: 'Verified workforce', desc: 'Every driver is reviewed before receiving customer delivery work.' },
  { icon: Clock, title: 'Flexible delivery windows', desc: 'Customers can request same-day, next-day, or scheduled delivery times.' },
];

const pricingSteps = [
  { label: 'Base fee', value: 'R90', note: 'Any distance up to 3 km' },
  { label: 'Per km after', value: '+ R22 /km', note: 'Charged per additional km' },
  { label: 'No hidden fees', value: 'Clear', note: 'Price shown before confirmation' },
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
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Service model</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Professional parcel operations, on demand</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-8 mb-20">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl border border-border p-6 shadow-sm"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Simple, transparent fees</h2>
            <p className="text-muted-foreground mb-8">No surge pricing or unclear service fees. Customers see the estimate before confirming the pickup.</p>

            <div className="space-y-3">
              {pricingSteps.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-card rounded-lg border border-border px-5 py-4">
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
            className="bg-card rounded-2xl border border-border p-8 shadow-sm"
          >
            <h3 className="text-xl font-bold mb-2">Request workflow</h3>
            <p className="text-muted-foreground text-sm mb-6">A structured booking flow gives customers pricing, payment selection, and delivery visibility before submission.</p>
            <ul className="space-y-3 mb-8">
              {['Select pickup and delivery locations', 'Review the calculated estimate', 'Confirm payment and dispatch the job', 'Track delivery progress in real time'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <Button size="lg" className="w-full rounded-md h-12 text-base font-semibold" onClick={handleRequest}>
              Request a Pickup
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
