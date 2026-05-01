'use client';

import { useEffect } from 'react';
import { ElegantButton } from '@/components/ui/ElegantButton';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
      <div className="text-center px-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
          Something went wrong
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <ElegantButton onClick={reset} variant="primary">
          Try again
        </ElegantButton>
      </div>
    </div>
  );
}
