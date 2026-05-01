'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SectionTransition } from '@/components/ui/SectionTransition';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { Search, Lightbulb, Code2, Rocket } from 'lucide-react';
import messages from '@/messages/es.json';

const stepIcons = [Search, Lightbulb, Code2, Rocket];

export function Process() {
  const t = messages.process;
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    { key: '1', icon: stepIcons[0] },
    { key: '2', icon: stepIcons[1] },
    { key: '3', icon: stepIcons[2] },
    { key: '4', icon: stepIcons[3] },
  ];

  return (
    <section className="min-h-screen flex flex-col justify-center bg-neutral-50 dark:bg-neutral-900">
      <SectionDivider />

      <div className="flex-1 flex flex-col justify-center py-[clamp(6rem,15vh,10rem)] max-w-7xl mx-auto px-6 lg:px-12 w-full">
        {/* Section Header */}
        <SectionTransition className="mb-16 text-center lg:text-left" delay={0.1}>
          <h2 className="text-black dark:text-white tracking-[-0.02em] leading-[1.1] text-[clamp(2.2rem,4vw,3.2rem)] mb-4">
            {t.title}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl text-sm leading-[1.6]">
            {t.subtitle}
          </p>
        </SectionTransition>

        {/* Advanced Timeline */}
        <div className="relative">
          {/* Progress Line Background */}
          <div className="absolute left-[31px] lg:left-1/2 lg:-translate-x-1/2 top-0 bottom-0 w-[2px] bg-neutral-200 dark:bg-neutral-700" />
          
          {/* Progress Line Active */}
          <motion.div 
            className="absolute left-[31px] lg:left-1/2 lg:-translate-x-1/2 top-0 w-[2px] bg-[#0047AB] origin-top"
            initial={{ height: "0%" }}
            whileInView={{ height: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Steps */}
          <div className="space-y-8 lg:space-y-12">
            {steps.map((step, index) => {
              const stepData = t.steps[step.key as keyof typeof t.steps];
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              const isActive = activeStep === index;
              
              return (
                <SectionTransition
                  key={step.key}
                  delay={0.2 + index * 0.15}
                  className="relative"
                >
                  <motion.div
                    className={`flex items-start gap-6 lg:gap-0 ${
                      isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                    }`}
                    onMouseEnter={() => setActiveStep(index)}
                    onMouseLeave={() => setActiveStep(null)}
                  >
                    {/* Timeline Node */}
                    <div className="absolute left-[24px] lg:left-1/2 lg:-translate-x-1/2 z-10">
                      <motion.div
                        className={`w-4 h-4 rounded-full border-2 transition-colors duration-300 ${
                          isActive || index < (activeStep ?? -1)
                            ? 'bg-[#0047AB] border-[#0047AB]'
                            : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-600'
                        }`}
                        whileHover={{ scale: 1.3 }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>

                    {/* Icon Circle */}
                    <div className={`hidden lg:flex absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 items-center justify-center z-20 ${
                      isActive ? 'border-[#0047AB] shadow-lg shadow-blue-500/20' : ''
                    }`}>
                      <Icon 
                        className={`w-6 h-6 transition-colors duration-300 ${
                          isActive ? 'text-[#0047AB]' : 'text-neutral-400'
                        }`} 
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* Content Card */}
                    <div className={`pl-16 lg:pl-0 lg:w-5/12 ${
                      isEven ? 'lg:pr-20 lg:text-right' : 'lg:pl-20'
                    }`}>
                      <motion.div
                        className={`p-6 rounded-xl border transition-all duration-300 ${
                          isActive
                            ? 'border-[#0047AB] bg-white dark:bg-neutral-900 shadow-lg shadow-blue-500/10'
                            : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950'
                        }`}
                        whileHover={{ y: -2 }}
                      >
                        {/* Step Number Badge */}
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                          isActive
                            ? 'bg-[#0047AB]/10 text-[#0047AB]'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                        }`}>
                          <span className="w-4 h-4 rounded-full bg-current opacity-20" />
                          {stepData.label}
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-medium text-black dark:text-white mb-3">
                          {stepData.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
                          {stepData.description}
                        </p>

                        {/* Duration Badge */}
                        <div className={`inline-flex items-center gap-2 text-xs ${
                          isActive ? 'text-[#0047AB]' : 'text-neutral-400'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {stepData.duration}
                        </div>
                      </motion.div>
                    </div>

                    {/* Spacer */}
                    <div className="hidden lg:block lg:w-5/12" />
                  </motion.div>
                </SectionTransition>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
