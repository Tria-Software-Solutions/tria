'use client';

import { useTranslations } from 'next-intl';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';
import { SectionDivider } from '@/components/ui/SectionDivider';

export function Process() {
  const t = useTranslations('process');
  
  const steps = [
    {
      number: '01',
      title: t('steps.1.title'),
      description: t('steps.1.description'),
      duration: t('steps.1.duration'),
    },
    {
      number: '02',
      title: t('steps.2.title'),
      description: t('steps.2.description'),
      duration: t('steps.2.duration'),
    },
    {
      number: '03',
      title: t('steps.3.title'),
      description: t('steps.3.description'),
      duration: t('steps.3.duration'),
    },
    {
      number: '04',
      title: t('steps.4.title'),
      description: t('steps.4.description'),
      duration: t('steps.4.duration'),
    },
  ];

  return (
    <section className="min-h-screen flex flex-col justify-center bg-neutral-50 dark:bg-neutral-900">
      <SectionDivider />

      <div className="flex-1 flex flex-col justify-center py-[clamp(6rem,15vh,10rem)] max-w-7xl mx-auto px-6 lg:px-12 w-full">
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

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[15px] lg:left-1/2 lg:-translate-x-1/2 top-0 bottom-0 w-[1px] bg-neutral-200 dark:bg-neutral-700" />

          {/* Steps */}
          <div className="space-y-16 lg:space-y-24">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              
              return (
                <RevealOnScroll
                  key={step.number}
                  delay={index * 0.1}
                  className={`relative flex items-start lg:items-center gap-8 lg:gap-0 ${
                    isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Timeline node */}
                  <div className="absolute left-[15px] lg:left-1/2 lg:-translate-x-1/2 w-3 h-3 rounded-full bg-white dark:bg-neutral-900 border border-[var(--accent)] z-10" />

                  {/* Content */}
                  <div className={`pl-12 lg:pl-0 lg:w-1/2 ${
                    isEven ? 'lg:pr-16 lg:text-right' : 'lg:pl-16'
                  }`}>
                    {/* Step number */}
                    <span className="text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] font-medium">
                      {t(`steps.${index + 1}.label`)}
                    </span>

                    {/* Title */}
                    <h3 className="text-lg lg:text-xl font-medium text-black dark:text-white mt-2 mb-3 tracking-[-0.01em]">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-[1.6] max-w-sm mb-2">
                      {step.description}
                    </p>

                    {/* Duration */}
                    <span className="text-xs text-neutral-400 dark:text-neutral-500 tracking-wide">
                      {step.duration}
                    </span>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden lg:block lg:w-1/2" />
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
