import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, UserCheck, Truck, PartyPopper } from 'lucide-react';

const steps = [
  {
    icon: MapPin,
    title: "Post your request",
    desc: "Tell us the store, pickup address, and when you'd like your parcel delivered."
  },
  {
    icon: UserCheck,
    title: "A driver accepts",
    desc: "A verified nearby driver picks up the job and heads to collect your parcel."
  },
  {
    icon: Truck,
    title: "Parcel collected",
    desc: "The driver collects your parcel and keeps it safe until your preferred time."
  },
  {
    icon: PartyPopper,
    title: "Delivered to you",
    desc: "Your parcel arrives at your door when you're ready. No stress, no rushing."
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Four simple steps
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            From request to delivery — we handle everything so you don't have to.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative group"
            >
              <div className="mb-5">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <step.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <span className="absolute top-0 left-12 text-6xl font-extrabold text-muted/50 select-none">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}