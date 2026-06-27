import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, Truck, UserCheck } from 'lucide-react';

const steps = [
  { icon: MapPin, title: 'Create a pickup', desc: 'Add pickup details, delivery address, parcel reference, and preferred delivery window.' },
  { icon: UserCheck, title: 'Driver assignment', desc: 'Approved drivers see available jobs and accept work through the platform.' },
  { icon: Truck, title: 'Collection confirmed', desc: 'The driver updates the delivery status as the parcel moves through the route.' },
  { icon: CheckCircle2, title: 'Delivery completed', desc: 'Customers receive completion status and can rate the driver after delivery.' }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Four controlled service stages</h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            A clear workflow for customers, drivers, and administrators.
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
                <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
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
