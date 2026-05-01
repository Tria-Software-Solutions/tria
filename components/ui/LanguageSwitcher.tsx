'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { ChangeEvent, useTransition } from 'react';
import { locales, localeLabels } from '@/i18n/config';

export function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value;
    startTransition(() => {
      router.replace(`/${nextLocale}${pathname.replace(`/${locale}`, '')}`);
    });
  };

  return (
    <div className="relative">
      <select
        className="appearance-none bg-transparent text-sm tracking-wider uppercase text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded px-3 py-1.5 pr-8 cursor-pointer hover:border-neutral-500 dark:hover:border-neutral-400 hover:text-black dark:hover:text-white transition-colors font-medium"
        defaultValue={locale}
        onChange={handleChange}
        disabled={isPending}
        aria-label="Language selector"
        title="Select language"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeLabels[loc]}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
