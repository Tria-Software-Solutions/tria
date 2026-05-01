'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ElegantButton } from '@/components/ui/ElegantButton';
import { RevealOnScroll } from '@/components/ui/RevealOnScroll';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { DataFlowLines } from '@/components/icons/AbstractShapes';
import { ArrowRight } from 'lucide-react';

export function Contact() {
  const t = useTranslations('contact');
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    projectType: '',
    budget: '',
    message: '',
  });
  const [focused, setFocused] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formState);
  };

  const inputClasses = (fieldName: string) => `
    w-full bg-transparent border-b py-3 text-sm text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600
    outline-none transition-all duration-300
    ${focused === fieldName || formState[fieldName as keyof typeof formState]
      ? 'border-[#0047AB]'
      : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600'}
  `;

  return (
    <section id="contact" className="min-h-screen flex flex-col justify-center bg-white dark:bg-neutral-950">
      <SectionDivider />

      <div className="relative flex-1 flex flex-col justify-center py-[clamp(6rem,15vh,10rem)] max-w-7xl mx-auto px-6 lg:px-12 w-full">
        {/* Background accent */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[30vw] text-neutral-50 dark:text-neutral-900 opacity-50">
          <DataFlowLines className="w-full h-auto" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left: Info */}
          <RevealOnScroll>
            <div className="lg:sticky lg:top-32">
              <p className="text-xs tracking-[0.25em] uppercase text-neutral-400 dark:text-neutral-500 mb-5">
                {t('eyebrow')}
              </p>
              <h2
                className="text-black dark:text-white tracking-[-0.02em] mb-6 leading-[1.1] text-[clamp(2.5rem,4vw,3.5rem)]"
              >
                {t('title')}
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 leading-[1.7] mb-12 max-w-sm text-[0.9375rem]">
                {t('subtitle')}
              </p>

              {/* Direct contact */}
              <div className="space-y-5">
                <div>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.15em] mb-1.5">{t('email')}</p>
                  <a href="mailto:hello@tria.io" className="text-sm text-black dark:text-white hover:text-[#0047AB] transition-colors">
                    {t('emailValue')}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.15em] mb-1.5">{t('location')}</p>
                  <p className="text-sm text-black dark:text-white">{t('locationValue')}</p>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Right: Form */}
          <RevealOnScroll delay={0.2}>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Two column fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder={t('form.name')}
                    value={formState.name}
                    onChange={handleChange}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                    className={inputClasses('name')}
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder={t('form.email')}
                    value={formState.email}
                    onChange={handleChange}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    className={inputClasses('email')}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <input
                    type="text"
                    name="company"
                    placeholder={t('form.company')}
                    value={formState.company}
                    onChange={handleChange}
                    onFocus={() => setFocused('company')}
                    onBlur={() => setFocused(null)}
                    className={inputClasses('company')}
                  />
                </div>
                <div>
                  <select
                    name="projectType"
                    aria-label="Select project type"
                    title={t('form.projectType')}
                    value={formState.projectType}
                    onChange={handleChange}
                    onFocus={() => setFocused('projectType')}
                    onBlur={() => setFocused(null)}
                    className={`${inputClasses('projectType')} cursor-pointer appearance-none`}
                    required
                  >
                    <option value="" disabled>{t('form.projectType')}</option>
                    <option value="infrastructure">{t('form.projectTypes.infrastructure')}</option>
                    <option value="migration">{t('form.projectTypes.migration')}</option>
                    <option value="optimization">{t('form.projectTypes.optimization')}</option>
                    <option value="security">{t('form.projectTypes.security')}</option>
                    <option value="other">{t('form.projectTypes.other')}</option>
                  </select>
                </div>
              </div>

              {/* Budget selection */}
              <div>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-4">{t('form.budget')}</p>
                <div className="flex flex-wrap gap-3">
                  {(t.raw('form.budgetOptions') as string[]).map((range: string, rangeIndex: number) => (
                    <motion.button
                      key={rangeIndex}
                      type="button"
                      onClick={() => setFormState({ ...formState, budget: range })}
                      className={`px-4 py-2 text-xs border transition-all duration-200 ${
                        formState.budget === range
                          ? 'border-[#0047AB] bg-[rgba(0,71,171,0.05)] dark:bg-[rgba(0,71,171,0.15)] text-[#0047AB]'
                          : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {range}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <textarea
                  name="message"
                  placeholder={t('form.message')}
                  value={formState.message}
                  onChange={handleChange}
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused(null)}
                  className={`${inputClasses('message')} resize-none min-h-[120px]`}
                  rows={4}
                />
              </div>

              {/* Submit */}
              <div className="pt-4">
                <ElegantButton variant="primary" size="lg" className="w-full sm:w-auto">
                  <span>{t('form.submit')}</span>
                  <ArrowRight size={16} strokeWidth={1.5} />
                </ElegantButton>
              </div>

              <p className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed">
                {t('form.privacy')}
              </p>
            </form>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
