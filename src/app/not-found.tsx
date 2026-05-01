import { ElegantButton } from '@/components/ui/ElegantButton';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
      <div className="text-center px-6">
        <h2 className="text-6xl font-bold text-black dark:text-white mb-4">
          404
        </h2>
        <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">
          Page not found
        </p>
        <ElegantButton href="/" variant="primary">
          Go home
        </ElegantButton>
      </div>
    </div>
  );
}
