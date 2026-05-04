'use client';

import { motion } from 'framer-motion';
import { SectionTransition } from '@/components/ui/SectionTransition';
import { Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Testimonials() {
  const { t } = useLanguage();

  const testimonials = [
    {
      id: 1,
      name: "Carlos Rodriguez",
      position: "CEO, TechStart Costa Rica",
      company: "TechStart CR",
      avatar: "CR",
      rating: 5,
      testimonial: t.testimonials.items[0].testimonial,
      project: "E-commerce Platform"
    },
    {
      id: 2,
      name: "Ana Maria Vargas",
      position: "CTO, Fintech Solutions",
      company: "Fintech SV",
      avatar: "AV",
      rating: 5,
      testimonial: t.testimonials.items[1].testimonial,
      project: "Mobile Banking App"
    },
    {
      id: 3,
      name: "Diego Chen",
      position: "Product Manager, HealthTech",
      company: "MediCore",
      avatar: "DC",
      rating: 5,
      testimonial: t.testimonials.items[2].testimonial,
      project: "Healthcare Management System"
    }
  ];

  const clients = [
    { name: "TechStart CR", category: "E-commerce" },
    { name: "Fintech SV", category: "Finance" },
    { name: "MediCore", category: "Healthcare" },
    { name: "EduSmart", category: "Education" },
    { name: "LogiPro", category: "Logistics" },
    { name: "GreenEnergy", category: "Sustainability" }
  ];

  return (
    <section className="py-[clamp(6rem,15vh,10rem)] bg-white dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <SectionTransition className="mb-16 text-center lg:text-left" delay={0.1}>
          <h2 className="text-black dark:text-white tracking-[-0.02em] leading-[1.1] text-[clamp(2.2rem,4vw,3.2rem)] mb-4">
            {t.testimonials.title}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl text-sm leading-[1.6]">
            {t.testimonials.subtitle}
          </p>
        </SectionTransition>

        {/* Client Logos - Minimal Grid */}
        <SectionTransition className="mb-16" delay={0.2}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-neutral-200 dark:bg-neutral-800">
            {clients.map((client, index) => (
              <motion.div
                key={client.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-neutral-950 p-6 lg:p-8 text-center group hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-lg mx-auto mb-3 flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
                  <span className="text-black dark:text-white font-bold text-xs">
                    {client.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <p className="text-sm font-medium text-black dark:text-white">
                  {client.name}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {client.category}
                </p>
              </motion.div>
            ))}
          </div>
        </SectionTransition>

        {/* Testimonials Grid - Minimal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-200 dark:bg-neutral-800">
          {testimonials.map((testimonial, index) => (
            <SectionTransition
              key={testimonial.id}
              delay={0.3 + index * 0.1}
              className="h-full"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group h-full bg-white dark:bg-neutral-950 p-8 lg:p-10 transition-colors flex flex-col"
                whileHover={{ y: -2 }}
              >
                {/* Quote Icon - Minimal */}
                <div className="mb-6">
                  <Quote className="w-6 h-6 text-neutral-300 dark:text-neutral-600" strokeWidth={1} />
                </div>

                {/* Testimonial */}
                <blockquote className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed mb-6 flex-1">
                  &ldquo;{testimonial.testimonial}&rdquo;
                </blockquote>

                {/* Author Info - Minimal */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                    <span className="text-black dark:text-white font-bold text-xs">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="text-black dark:text-white font-medium text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs">
                      {testimonial.position}
                    </p>
                  </div>
                </div>

                {/* Hover line */}
                <div className="absolute bottom-0 left-0 w-0 h-px bg-black dark:bg-white group-hover:w-full transition-all duration-500" />
              </motion.div>
            </SectionTransition>
          ))}
        </div>

        {/* Bottom CTA - Minimal */}
        <SectionTransition className="mt-16 text-center lg:text-left" delay={0.6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-neutral-50 dark:bg-neutral-900/40 rounded-2xl p-8 lg:p-12 border border-neutral-200 dark:border-neutral-800"
          >
            <h3 className="text-xl font-medium text-black dark:text-white mb-4">
              {t.testimonials.ctaTitle}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-2xl">
              {t.testimonials.ctaSubtitle}
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors text-sm font-medium"
            >
              {t.testimonials.ctaButton}
            </a>
          </motion.div>
        </SectionTransition>

      </div>
    </section>
  );
}
