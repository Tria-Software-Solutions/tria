'use client';

import { motion } from 'framer-motion';
import { SectionTransition } from '@/components/ui/SectionTransition';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Portfolio() {
  const { t } = useLanguage();

  const caseStudies = [
    {
      id: 1,
      title: t.portfolio.items[0].title,
      category: t.portfolio.items[0].category,
      description: t.portfolio.items[0].description,
      technologies: ["React", "Node.js", "PostgreSQL", "AWS"],
      metrics: {
        users: "50K+",
        performance: "99.9%",
        timeline: "6 months"
      },
      link: "#",
      featured: true
    },
    {
      id: 2,
      title: t.portfolio.items[1].title,
      category: t.portfolio.items[1].category,
      description: t.portfolio.items[1].description,
      technologies: ["React Native", "Firebase", "Stripe"],
      metrics: {
        users: "25K+",
        performance: "99.5%",
        timeline: "4 months"
      },
      link: "#",
      featured: false
    },
    {
      id: 3,
      title: t.portfolio.items[2].title,
      category: t.portfolio.items[2].category,
      description: t.portfolio.items[2].description,
      technologies: ["Python", "Django", "Docker", "Kubernetes"],
      metrics: {
        users: "100K+",
        performance: "99.8%",
        timeline: "8 months"
      },
      link: "#",
      featured: false
    }
  ];

  const categories = ["All", "E-commerce", "Mobile", "Healthcare", "FinTech"];

  return (
    <section className="py-[clamp(6rem,15vh,10rem)] bg-neutral-50 dark:bg-neutral-900/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <SectionTransition className="mb-16 text-center lg:text-left" delay={0.1}>
          <h2 className="text-black dark:text-white tracking-[-0.02em] leading-[1.1] text-[clamp(2.2rem,4vw,3.2rem)] mb-4">
            {t.portfolio.title}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl text-sm leading-[1.6]">
            {t.portfolio.subtitle}
          </p>
        </SectionTransition>

        {/* Category Filter - Minimal */}
        <SectionTransition className="mb-16" delay={0.2}>
          <div className="flex flex-wrap gap-4">
            {categories.map((category, index) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  category === "All"
                    ? "text-black dark:text-white"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </SectionTransition>

        {/* Case Studies Grid - Minimal Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-neutral-200 dark:bg-neutral-800 mb-16">
          {caseStudies.map((study, index) => (
            <SectionTransition
              key={study.id}
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
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        {study.category}
                      </span>
                      {study.featured && (
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          {t.portfolio.featured}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-medium text-black dark:text-white mb-2">
                      {study.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                      {study.description}
                    </p>
                  </div>
                  <a
                    href={study.link}
                    className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors ml-4"
                    title={`View ${study.title} case study`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-neutral-600 dark:text-neutral-400" strokeWidth={1.5} />
                  </a>
                </div>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {study.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs rounded-md"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Metrics - Minimal */}
                <div className="mt-auto pt-6 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-lg font-medium text-black dark:text-white">
                        {study.metrics.users}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {t.portfolio.metrics.users}
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-black dark:text-white">
                        {study.metrics.performance}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {t.portfolio.metrics.performance}
                      </p>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-black dark:text-white">
                        {study.metrics.timeline}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {t.portfolio.metrics.timeline}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hover line */}
                <div className="absolute bottom-0 left-0 w-0 h-px bg-black dark:bg-white group-hover:w-full transition-all duration-500" />
              </motion.div>
            </SectionTransition>
          ))}
        </div>

        {/* Bottom CTA - Minimal */}
        <SectionTransition className="text-center lg:text-left" delay={0.6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-neutral-950 rounded-2xl p-8 lg:p-12 border border-neutral-200 dark:border-neutral-800"
          >
            <h3 className="text-xl font-medium text-black dark:text-white mb-4">
              {t.portfolio.ctaTitle}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-2xl">
              {t.portfolio.ctaSubtitle}
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors text-sm font-medium"
            >
              {t.portfolio.ctaButton}
            </a>
          </motion.div>
        </SectionTransition>

      </div>
    </section>
  );
}
