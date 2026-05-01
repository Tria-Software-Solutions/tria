'use client';

import { motion } from 'framer-motion';
import { SectionTransition } from '@/components/ui/SectionTransition';
import { ElegantButton } from '@/components/ui/ElegantButton';
import { Check } from 'lucide-react';
import messages from '@/messages/es.json';

export function Billing() {
  const t = messages.billing;

  return (
    <section id="billing" className="py-[clamp(6rem,14vh,9rem)] bg-neutral-50 dark:bg-neutral-900/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <SectionTransition className="mb-16 text-center lg:text-left" delay={0.1}>
          <h2 className="text-black dark:text-white tracking-[-0.02em] leading-[1.1] text-[clamp(2.2rem,4vw,3.2rem)] mb-4">
            {t.title}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl text-sm leading-[1.6]">
            {t.subtitle}
          </p>
        </SectionTransition>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-200 dark:bg-neutral-800">
          {t.plans.map((plan, index) => (
            <SectionTransition
              key={plan.name}
              delay={0.15 + index * 0.1}
              className="h-full"
            >
              <motion.div
                whileHover={{ backgroundColor: plan.highlight ? "rgba(255,255,255,1)" : "rgba(250,250,250,1)" }}
                className={`group relative h-full p-8 lg:p-10 transition-colors ${
                  plan.highlight
                    ? 'bg-white dark:bg-neutral-950'
                    : 'bg-white dark:bg-neutral-950'
                }`}
              >
                {/* Highlight Badge */}
                {plan.highlight && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-[#0047AB] text-white text-xs font-medium">
                    {t.popular}
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-black dark:text-white mb-4">{plan.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-light tracking-tight text-black dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">{t.perMonth}</span>
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                    {plan.priceUsd}
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-8">
                  {plan.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li 
                      key={featureIndex} 
                      className="flex items-start gap-3 text-sm text-neutral-600 dark:text-neutral-300"
                    >
                      <Check className="w-4 h-4 text-[#0047AB] flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <div className="mt-auto">
                  <ElegantButton 
                    variant={plan.highlight ? 'primary' : 'outline'} 
                    size="md" 
                    href="#contact"
                    className="w-full"
                  >
                    {t.cta}
                  </ElegantButton>
                </div>

                {/* Hover accent line */}
                <div className={`absolute bottom-0 left-0 w-0 h-px ${plan.highlight ? 'bg-[#0047AB]' : 'bg-black dark:bg-white'} group-hover:w-full transition-all duration-500`} />
              </motion.div>
            </SectionTransition>
          ))}
        </div>

        {/* Note */}
        <SectionTransition delay={0.5}>
          <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 mt-8">
            {t.note}
          </p>
        </SectionTransition>
      </div>
    </section>
  );
}
