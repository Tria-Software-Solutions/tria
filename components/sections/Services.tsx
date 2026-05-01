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
import messages from '@/messages/es.json';

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
  const t = messages.services;

  return (
    <section id="services" className="py-[clamp(6rem,15vh,10rem)] bg-white dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <SectionTransition className="mb-16 text-center lg:text-left" delay={0.1}>
          <h2 className="text-black dark:text-white tracking-[-0.02em] leading-[1.1] text-[clamp(2.2rem,4vw,3.2rem)] mb-4">
            {t.title}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl text-sm leading-[1.6]">
            {t.subtitle}
          </p>
        </SectionTransition>

        {/* Services Grid - Clean Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200 dark:bg-neutral-800">
          {t.list.map((service, index) => {
            const Icon = serviceIcons[index];
            return (
              <SectionTransition
                key={service.title}
                delay={0.15 + index * 0.08}
                className="h-full"
              >
                <motion.div
                  whileHover={{ backgroundColor: "rgba(250, 250, 250, 1)" }}
                  className="group relative h-full bg-white dark:bg-neutral-950 p-8 lg:p-10 transition-colors flex flex-col"
                >
                  {/* Icon */}
                  <div className="mb-6">
                    <Icon 
                      strokeWidth={1.5}
                      className="w-8 h-8 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors duration-300" 
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-black dark:text-white mb-2 flex items-start gap-2 whitespace-pre-line">
                      {service.title}
                      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0 mt-1" />
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-500 leading-relaxed whitespace-pre-line">
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

      </div>
    </section>
  );
}
