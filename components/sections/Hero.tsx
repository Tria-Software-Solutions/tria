'use client';

import { useState, useEffect } from 'react';
import { ElegantButton } from '@/components/ui/ElegantButton';
import messages from '@/messages/es.json';

export function Hero() {
  const t = messages.hero;
  const [displayedHeadline, setDisplayedHeadline] = useState('');
  const [displayedSubtitle, setDisplayedSubtitle] = useState('');
  const [isHeadlineComplete, setIsHeadlineComplete] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    let headlineIndex = 0;
    let subtitleIndex = 0;

    const typeHeadline = () => {
      if (headlineIndex < t.headline.length) {
        setDisplayedHeadline(t.headline.slice(0, headlineIndex + 1));
        headlineIndex++;
        setTimeout(typeHeadline, 50);
      } else {
        setIsHeadlineComplete(true);
        setTimeout(typeSubtitle, 300);
      }
    };

    const typeSubtitle = () => {
      if (subtitleIndex < t.subtitle.length) {
        setDisplayedSubtitle(t.subtitle.slice(0, subtitleIndex + 1));
        subtitleIndex++;
        setTimeout(typeSubtitle, 30);
      } else {
        setIsTypingComplete(true);
      }
    };

    typeHeadline();
  }, [t.headline, t.subtitle]);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 px-4 sm:px-6 lg:px-8">
      {/* Main content - Mobile First */}
      <div className="w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl xl:max-w-6xl text-center sm:text-left">

        {/* Main headline with typing animation */}
        <h1 className="text-black dark:text-white tracking-[-0.03em] leading-[1.05] text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-4 sm:mb-6 font-bold">
          {displayedHeadline}
          {!isHeadlineComplete && (
            <span className="inline-block w-0.5 h-6 sm:h-8 bg-black dark:bg-white ml-1 animate-pulse" />
          )}
        </h1>

        {/* Subtitle with typing animation */}
        <p className="text-neutral-600 dark:text-neutral-300 mb-8 sm:mb-12 text-base sm:text-lg lg:text-xl leading-[1.6] font-light">
          {displayedSubtitle}
          {!isTypingComplete && (
            <span className="inline-block w-0.5 h-4 sm:h-5 bg-neutral-400 dark:bg-neutral-500 ml-1 animate-pulse" />
          )}
        </p>

        {/* CTA Buttons - Mobile First */}
        <div className={`flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start transition-opacity duration-500 ${
          isTypingComplete ? 'opacity-100' : 'opacity-0'
        }`}>
          <ElegantButton 
            variant="primary" 
            size="md" 
            href="#contact"
            className="w-full sm:w-auto"
          >
            {t.ctaPrimary}
          </ElegantButton>

          <ElegantButton 
            variant="outline" 
            size="md" 
            href="#services"
            className="w-full sm:w-auto"
          >
            {t.ctaSecondary}
          </ElegantButton>
        </div>

      </div>
    </section>
  );
}
