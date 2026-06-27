import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Globe2, Star } from 'lucide-react';

const stats = [
  { value: '4.9/5', label: 'Average driver rating' },
  { value: '< 5 min', label: 'Average acceptance time' },
  { value: '98%', label: 'On-time delivery rate' },
  { value: '24/7', label: 'Live platform visibility' },
];

const trustSignals = [
  { icon: Building2, title: 'Retail and depot ready', text: 'Designed for parcel counters, courier depots, lockers, and marketplace pickup points.' },
  { icon: Globe2, title: 'Multi-market architecture', text: 'Supports multiple currencies and repeatable operating workflows for regional expansion.' },
  { icon: Star, title: 'Quality-controlled network', text: 'Driver verification, delivery history, and customer ratings create a measurable service standard.' },
];

export default function StatsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Platform standards</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Built for operational trust</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            CMP presents the customer experience, driver operations, and admin controls in one disciplined service workflow.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {trustSignals.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-6 shadow-sm"
            >
              <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <item.icon className="h-5 w-5" />
              </div>
              <p className="font-semibold mb-2">{item.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
