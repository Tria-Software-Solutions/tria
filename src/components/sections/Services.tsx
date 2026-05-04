'use client';

import { motion } from 'framer-motion';
import { SectionTransition } from '@/components/ui/SectionTransition';
import { 
  Monitor, 
  Smartphone, 
  Cloud, 
  Database,
  Layers,
  Bug,
  Wrench,
  ArrowUpRight
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const serviceIcons = [
  Monitor,
  Smartphone,
  Database,
  Cloud,
  Layers,
  Bug,
  Wrench,
  ArrowUpRight
];

export function Services() {
  const { t } = useLanguage();

  return (
    <section id="services" className="py-[clamp(6rem,15vh,10rem)] bg-white dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <SectionTransition className="mb-16 text-center lg:text-left" delay={0.1}>
          <h2 className="text-black dark:text-white tracking-[-0.02em] leading-[1.1] text-[clamp(2.2rem,4vw,3.2rem)] mb-4">
            {t.services.title}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl text-sm leading-[1.6]">
            {t.services.subtitle}
          </p>
        </SectionTransition>

        {/* Services Grid - Clean Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200 dark:bg-neutral-800 mb-16">
          {t.services.list.map((service, index) => {
            const Icon = serviceIcons[index];
            return (
              <SectionTransition
                key={service.title}
                delay={0.2 + index * 0.1}
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
                  {/* Icon */}
                  <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
                    <Icon className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-black dark:text-white font-medium text-sm mb-3 whitespace-pre-line">
                      {service.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed whitespace-pre-line">
                      {service.description}
                    </p>
                  </div>

                  {/* Hover line */}
                  <div className="absolute bottom-0 left-0 w-0 h-px bg-black dark:bg-white group-hover:w-full transition-all duration-500" />
                </motion.div>
              </SectionTransition>
            );
          })}
        </div>

        {/* CTA */}
        <SectionTransition className="text-center lg:text-left" delay={0.6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-neutral-50 dark:bg-neutral-900/40 rounded-2xl p-8 lg:p-12 border border-neutral-200 dark:border-neutral-800"
          >
            <h3 className="text-xl font-medium text-black dark:text-white mb-4">
              {t.services.ctaTitle}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-2xl">
              {t.services.ctaSubtitle}
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors text-sm font-medium"
            >
              {t.services.ctaButton}
            </a>
          </motion.div>
        </SectionTransition>

      </div>
    </section>
  );
}
