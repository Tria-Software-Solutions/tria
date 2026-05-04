'use client';

import { motion } from 'framer-motion';
import { SectionTransition } from '@/components/ui/SectionTransition';
import { useLanguage } from '@/contexts/LanguageContext';

export function Technologies() {
  const { t } = useLanguage();

  const techCategories = [
    {
      title: t.technologies.categories.frontend.title,
      description: t.technologies.categories.frontend.description,
      items: [
        { name: "React", level: 95, color: "bg-blue-500" },
        { name: "Next.js", level: 90, color: "bg-gray-900" },
        { name: "TypeScript", level: 85, color: "bg-blue-600" },
        { name: "Tailwind CSS", level: 90, color: "bg-cyan-500" },
        { name: "Vue.js", level: 75, color: "bg-green-500" },
        { name: "Angular", level: 70, color: "bg-red-600" }
      ]
    },
    {
      title: t.technologies.categories.backend.title,
      description: t.technologies.categories.backend.description,
      items: [
        { name: "Node.js", level: 90, color: "bg-green-600" },
        { name: "Python", level: 85, color: "bg-blue-500" },
        { name: "PostgreSQL", level: 80, color: "bg-blue-700" },
        { name: "MongoDB", level: 75, color: "bg-green-500" },
        { name: "Redis", level: 70, color: "bg-red-600" },
        { name: "GraphQL", level: 80, color: "bg-pink-600" }
      ]
    },
    {
      title: t.technologies.categories.mobile.title,
      description: t.technologies.categories.mobile.description,
      items: [
        { name: "React Native", level: 85, color: "bg-blue-500" },
        { name: "Flutter", level: 75, color: "bg-blue-600" },
        { name: "Swift", level: 70, color: "bg-orange-500" },
        { name: "Kotlin", level: 70, color: "bg-purple-600" },
        { name: "iOS", level: 80, color: "bg-gray-800" },
        { name: "Android", level: 80, color: "bg-green-600" }
      ]
    },
    {
      title: t.technologies.categories.devops.title,
      description: t.technologies.categories.devops.description,
      items: [
        { name: "AWS", level: 85, color: "bg-orange-500" },
        { name: "Docker", level: 90, color: "bg-blue-600" },
        { name: "Kubernetes", level: 80, color: "bg-blue-700" },
        { name: "CI/CD", level: 85, color: "bg-purple-600" },
        { name: "Terraform", level: 75, color: "bg-purple-500" },
        { name: "GitHub Actions", level: 80, color: "bg-gray-800" }
      ]
    }
  ];

  return (
    <section className="py-[clamp(6rem,15vh,10rem)] bg-white dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <SectionTransition className="mb-16 text-center lg:text-left" delay={0.1}>
          <h2 className="text-black dark:text-white tracking-[-0.02em] leading-[1.1] text-[clamp(2.2rem,4vw,3.2rem)] mb-4">
            {t.technologies.title}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl text-sm leading-[1.6]">
            {t.technologies.subtitle}
          </p>
        </SectionTransition>

        {/* Technologies Grid - Minimal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-200 dark:bg-neutral-800 mb-16">
          {techCategories.map((category, categoryIndex) => (
            <SectionTransition
              key={category.title}
              delay={0.2 + categoryIndex * 0.1}
              className="h-full"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
                className="group h-full bg-white dark:bg-neutral-950 p-8 lg:p-10 transition-colors flex flex-col"
                whileHover={{ y: -2 }}
              >
                {/* Category Header */}
                <div className="mb-8">
                  <h3 className="text-xl font-medium text-black dark:text-white mb-2">
                    {category.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    {category.description}
                  </p>
                </div>

                {/* Technology Items - Minimal */}
                <div className="space-y-4 flex-1">
                  {category.items.map((tech, techIndex) => (
                    <motion.div
                      key={tech.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: techIndex * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${tech.color}`} />
                        <span className="text-black dark:text-white font-medium text-sm">
                          {tech.name}
                        </span>
                      </div>
                      <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">
                        {tech.level}%
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Hover line */}
                <div className="absolute bottom-0 left-0 w-0 h-px bg-black dark:bg-white group-hover:w-full transition-all duration-500" />
              </motion.div>
            </SectionTransition>
          ))}
        </div>

        {/* Additional Technologies - Minimal Grid */}
        <SectionTransition className="mb-16" delay={0.6}>
          <div className="text-center lg:text-left mb-8">
            <h3 className="text-lg font-medium text-black dark:text-white mb-2">
              {t.technologies.additional.title}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm max-w-2xl">
              {t.technologies.additional.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-px bg-neutral-200 dark:bg-neutral-800">
            {t.technologies.additional.items.map((tech, index) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-neutral-950 p-4 lg:p-6 text-center group hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              >
                <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg mx-auto mb-3 flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
                  <span className="text-black dark:text-white font-bold text-xs">
                    {tech.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <p className="text-black dark:text-white text-xs font-medium">
                  {tech}
                </p>
              </motion.div>
            ))}
          </div>
        </SectionTransition>

        {/* Bottom CTA - Minimal */}
        <SectionTransition className="text-center lg:text-left" delay={0.7}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-neutral-50 dark:bg-neutral-900/40 rounded-2xl p-8 lg:p-12 border border-neutral-200 dark:border-neutral-800"
          >
            <h3 className="text-xl font-medium text-black dark:text-white mb-4">
              {t.technologies.ctaTitle}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-2xl">
              {t.technologies.ctaSubtitle}
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors text-sm font-medium"
            >
              {t.technologies.ctaButton}
            </a>
          </motion.div>
        </SectionTransition>

      </div>
    </section>
  );
}
