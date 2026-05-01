'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SectionTransition } from '@/components/ui/SectionTransition';
import { ElegantButton } from '@/components/ui/ElegantButton';
import { Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Contact() {
  const { t } = useLanguage();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    projectType: '',
    budget: '',
    message: '',
  });
  const [focused, setFocused] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    console.log('Form submitted:', formState);
  };

  const inputClasses = (fieldName: string) => `
    w-full bg-transparent border-b-2 py-4 text-sm text-black dark:text-white 
    placeholder:text-neutral-400 dark:placeholder:text-neutral-600
    outline-none transition-all duration-300
    ${focused === fieldName || formState[fieldName as keyof typeof formState]
      ? 'border-[#0047AB]'
      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'}
  `;

  const projectTypes = [
    { value: 'web', label: t.contact.form.projectTypes.web },
    { value: 'mobile', label: t.contact.form.projectTypes.mobile },
    { value: 'desktop', label: t.contact.form.projectTypes.desktop },
    { value: 'backend', label: t.contact.form.projectTypes.backend },
    { value: 'fullstack', label: t.contact.form.projectTypes.fullstack },
    { value: 'other', label: t.contact.form.projectTypes.other },
  ];

  if (isSubmitted) {
    return (
      <section id="contact" className="py-[clamp(6rem,15vh,10rem)] bg-white dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <SectionTransition className="text-center max-w-lg mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-16 h-16 border border-[#0047AB] flex items-center justify-center mx-auto mb-8"
            >
              <Check className="w-8 h-8 text-[#0047AB]" strokeWidth={1.5} />
            </motion.div>
            <h2 className="text-2xl font-light text-black dark:text-white mb-4">{t.contact.successTitle || 'Message Sent!'}</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">{t.contact.successMessage || 'Thank you for reaching out. We will get back to you within 24 hours.'}</p>
            <ElegantButton
              onClick={() => {
                setIsSubmitted(false);
                setFormState({ name: '', email: '', company: '', projectType: '', budget: '', message: '' });
              }}
              variant="outline"
              size="sm"
            >
              {t.contact.sendAnother || 'Send another message'}
            </ElegantButton>
          </SectionTransition>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-[clamp(6rem,15vh,10rem)] bg-neutral-50 dark:bg-neutral-900/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <SectionTransition className="mb-16 text-center lg:text-left" delay={0.1}>
          <h2 className="text-black dark:text-white tracking-[-0.02em] leading-[1.1] text-[clamp(2.2rem,4vw,3.2rem)] mb-4">
            {t.contact.title}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl text-sm leading-[1.6]">
            {t.contact.subtitle}
          </p>
        </SectionTransition>

        {/* Form Card */}
        <SectionTransition delay={0.2}>
          <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-950 p-8 lg:p-12">
            <div className="space-y-8">
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder={t.contact.form.name}
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
                    placeholder={t.contact.form.email}
                    value={formState.email}
                    onChange={handleChange}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    className={inputClasses('email')}
                    required
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <input
                  type="text"
                  name="company"
                  placeholder={t.contact.form.company}
                  value={formState.company}
                  onChange={handleChange}
                  onFocus={() => setFocused('company')}
                  onBlur={() => setFocused(null)}
                  className={inputClasses('company')}
                />
              </div>

              {/* Project Type */}
              <div>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">{t.contact.form.projectType}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {projectTypes.map((type) => (
                    <motion.button
                      key={type.value}
                      type="button"
                      onClick={() => setFormState({ ...formState, projectType: type.value })}
                      className={`px-4 py-3 text-xs border-2 text-left transition-all duration-200 ${
                        formState.projectType === type.value
                          ? 'border-[#0047AB] bg-[#0047AB]/5 text-[#0047AB] font-medium'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {type.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">{t.contact.form.budget}</p>
                <div className="flex flex-wrap gap-3">
                  {t.contact.form.budgetOptions.map((range: string) => (
                    <motion.button
                      key={range}
                      type="button"
                      onClick={() => setFormState({ ...formState, budget: range })}
                      className={`px-4 py-2 text-xs border-2 transition-all duration-200 ${
                        formState.budget === range
                          ? 'border-[#0047AB] bg-[#0047AB] text-white font-medium'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
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
                  placeholder={t.contact.form.message}
                  value={formState.message}
                  onChange={handleChange}
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused(null)}
                  className={`${inputClasses('message')} resize-none min-h-[140px]`}
                  rows={5}
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-8 flex items-center justify-between">
              <ElegantButton 
                type="submit" 
                variant="primary" 
                size="md"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : t.contact.form.submit}
              </ElegantButton>

              <p className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed">
                {t.contact.form.privacy}
              </p>
            </div>
          </form>
        </SectionTransition>
      </div>
    </section>
  );
}
