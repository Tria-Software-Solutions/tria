'use client';

import { useState, useEffect } from 'react';
import { ElegantButton } from '@/components/ui/ElegantButton';
import { useLanguage } from '@/contexts/LanguageContext';

export function Hero() {
  const { t } = useLanguage();
  const [displayedHeadline, setDisplayedHeadline] = useState('');
  const [displayedSubtitle, setDisplayedSubtitle] = useState('');
  const [isHeadlineComplete, setIsHeadlineComplete] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    // Reset animation state when language changes
    setDisplayedHeadline('');
    setDisplayedSubtitle('');
    setIsHeadlineComplete(false);
    setIsTypingComplete(false);

    let headlineIndex = 0;
    let subtitleIndex = 0;
    let headlineTimeoutId: ReturnType<typeof setTimeout>;
    let subtitleTimeoutId: ReturnType<typeof setTimeout>;

    const typeHeadline = () => {
      if (headlineIndex < t.hero.headline.length) {
        setDisplayedHeadline(t.hero.headline.slice(0, headlineIndex + 1));
        headlineIndex++;
        headlineTimeoutId = setTimeout(typeHeadline, 50);
      } else {
        setIsHeadlineComplete(true);
        subtitleTimeoutId = setTimeout(typeSubtitle, 300);
      }
    };

    const typeSubtitle = () => {
      if (subtitleIndex < t.hero.subtitle.length) {
        setDisplayedSubtitle(t.hero.subtitle.slice(0, subtitleIndex + 1));
        subtitleIndex++;
        subtitleTimeoutId = setTimeout(typeSubtitle, 30);
      } else {
        setIsTypingComplete(true);
      }
    };

    headlineTimeoutId = setTimeout(typeHeadline, 100);

    return () => {
      clearTimeout(headlineTimeoutId);
      clearTimeout(subtitleTimeoutId);
    };
  }, [t.hero.headline, t.hero.subtitle]);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16">
      {/* Main content - Ultra Responsive Design */}
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl xl:max-w-4xl 2xl:max-w-6xl text-center sm:text-left md:text-left lg:text-left xl:text-left 2xl:text-left">

        {/* Main headline with typing animation - Responsive Typography */}
        <h1 className="text-black dark:text-white tracking-tight sm:tracking-[-0.02em] md:tracking-[-0.03em] lg:tracking-[-0.04em] leading-tight sm:leading-[1.1] md:leading-[1.05] text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl mb-3 sm:mb-4 md:mb-5 lg:mb-6 xl:mb-8 font-bold">
          {displayedHeadline}
          {!isHeadlineComplete && (
            <span className="inline-block w-0.5 h-4 sm:h-5 md:h-6 lg:h-7 xl:h-8 bg-black dark:bg-white ml-1 animate-pulse" />
          )}
        </h1>

        {/* Subtitle with typing animation - Responsive Typography */}
        <p className="text-neutral-600 dark:text-neutral-300 mb-6 sm:mb-8 md:mb-10 lg:mb-12 xl:mb-14 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl leading-relaxed sm:leading-[1.6] md:leading-[1.7] lg:leading-[1.8] font-light text-justify">
          {displayedSubtitle}
          {!isTypingComplete && (
            <span className="inline-block w-0.5 h-3 sm:h-4 md:h-4 lg:h-5 xl:h-6 bg-neutral-400 dark:bg-neutral-500 ml-1 animate-pulse" />
          )}
        </p>

        {/* CTA Buttons - Fully Responsive Layout */}
        <div className={`flex flex-col sm:flex-row md:flex-row lg:flex-row xl:flex-row 2xl:flex-row gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8 items-center sm:items-start md:items-start lg:items-start xl:items-start 2xl:items-start transition-opacity duration-500 ${
          isTypingComplete ? 'opacity-100' : 'opacity-0'
        }`}>
          <ElegantButton 
            variant="primary" 
            size="sm" 
            href="#contact"
            className="w-full sm:w-auto md:w-auto lg:w-auto xl:w-auto 2xl:w-auto px-4 sm:px-6 md:px-8 lg:px-8 xl:px-10 2xl:px-12 py-2 sm:py-3 md:py-3 lg:py-4 xl:py-4 2xl:py-5 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl"
          >
            {t.hero.ctaPrimary}
          </ElegantButton>

          <ElegantButton 
            variant="outline" 
            size="sm" 
            href="#services"
            className="w-full sm:w-auto md:w-auto lg:w-auto xl:w-auto 2xl:w-auto px-4 sm:px-6 md:px-8 lg:px-8 xl:px-10 2xl:px-12 py-2 sm:py-3 md:py-3 lg:py-4 xl:py-4 2xl:py-5 text-xs sm:text-sm md:text-base lg:text-base xl:text-lg 2xl:text-xl"
          >
            {t.hero.ctaSecondary}
          </ElegantButton>
        </div>

        {/* Responsive spacing adjustments for different screen sizes */}
        <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-16 xl:mt-20 2xl:mt-24">
          {/* Additional responsive content can go here */}
        </div>

      </div>
    </section>
  );
}
