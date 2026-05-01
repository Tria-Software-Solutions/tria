'use client';

import { useTranslations } from 'next-intl';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { serviceKeys } from '@/constants/services';

export function Services() {
  const t = useTranslations('services');
  
  const services = serviceKeys.map((service) => {
    const tags = t.raw(`items.${service.key}.tags`);
    return {
      icon: service.icon,
      title: t(`items.${service.key}.title`),
      description: t(`items.${service.key}.description`),
      capabilities: Array.isArray(tags) ? tags : [],
    };
  });

  return (
    <section id="services" className="min-h-screen flex items-center py-[clamp(6rem,15vh,10rem)] bg-white dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <RevealOnScroll className="mb-24">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-neutral-400 dark:text-neutral-500 mb-5">
                {t('eyebrow')}
              </p>
              <h2
                className="text-black dark:text-white tracking-[-0.02em] max-w-md leading-[1.1] text-[clamp(2.5rem,4vw,3.5rem)]"
              >
                {t('title')}
              </h2>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-sm leading-[1.7] text-[0.9375rem]">
              {t('subtitle')}
            </p>
          </div>
        </RevealOnScroll>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isLastInRow = (index + 1) % 3 === 0;
            const isLastTwoRows = index >= 3;
            
            return (
              <RevealOnScroll
                key={service.title}
                delay={index * 0.08}
                className={cn(
                  'group relative p-8 lg:p-10',
                  !isLastInRow && 'lg:border-r',
                  !isLastTwoRows && 'border-b',
                  'border-neutral-200 dark:border-neutral-800'
                )}
              >
                {/* Icon */}
                <div className="mb-6 text-neutral-400 dark:text-neutral-500 group-hover:text-[var(--accent)] transition-colors duration-300">
                  <Icon strokeWidth={1.5} size={28} />
                </div>

                {/* Title */}
                <h3 className="text-base font-medium text-black dark:text-white mb-3 tracking-[-0.01em] flex items-center gap-2">
                  {service.title}
                  <ArrowUpRight
                    size={14}
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                    strokeWidth={1.5}
                  />
                </h3>

                {/* Description */}
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-[1.6] mb-6">
                  {service.description}
                </p>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-2">
                  {service.capabilities.map((cap: string, capIndex: number) => (
                    <span
                      key={capIndex}
                      className="text-[11px] tracking-[0.1em] uppercase px-2.5 py-1 bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400"
                    >
                      {cap}
                    </span>
                  ))}
                </div>

                {/* Hover accent line */}
                <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-[var(--accent)] group-hover:w-full transition-all duration-500" />
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
