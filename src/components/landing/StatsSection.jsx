import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const stats = [
  { value: '4.9', label: 'Average driver rating', suffix: '★' },
  { value: '< 5 min', label: 'Average acceptance time', suffix: '' },
  { value: '98%', label: 'On-time delivery rate', suffix: '' },
  { value: '24/7', label: 'Platform availability', suffix: '' },
];

const testimonials = [
  {
    name: 'Sarah M.',
    location: 'Cape Town',
    text: "I work late shifts and can never get to Pick n Pay before it closes. CMP drivers collect for me — it's genuinely life-changing.",
    stars: 5,
  },
  {
    name: 'James K.',
    location: 'Johannesburg',
    text: "My Takealot parcel sat at the post office for two weeks. I used CMP once and it was at my door within the hour. Never going back.",
    stars: 5,
  },
  {
    name: 'Amara O.',
    location: 'Durban',
    text: "The driver tracking is great — I could see exactly where my package was. The price was totally reasonable too.",
    stars: 5,
  },
];

export default function StatsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">

        {/* Stats row */}
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
              <p className="text-3xl sm:text-4xl font-extrabold text-foreground">
                {s.value}<span className="text-primary">{s.suffix}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">What customers say</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Trusted by busy people</h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 stroke-amber-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.text}"</p>
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.location}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}