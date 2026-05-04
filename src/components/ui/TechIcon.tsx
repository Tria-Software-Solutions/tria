interface TechIconProps {
  name: string;
  className?: string;
}

export function TechIcon({ name, className = "w-8 h-8" }: TechIconProps) {
  const getIcon = () => {
    switch (name) {
      // Core Technologies - Minimal Black & White
      case 'React':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="7" r="2" fill="currentColor"/>
            <circle cx="8" cy="12" r="2" fill="currentColor"/>
            <circle cx="16" cy="12" r="2" fill="currentColor"/>
            <circle cx="12" cy="17" r="2" fill="currentColor"/>
            <path d="M12 7L8 12M12 7L16 12M8 12L12 17M16 12L12 17" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'Node.js':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <text x="12" y="14" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="bold">JS</text>
          </svg>
        );
      case 'TypeScript':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <text x="12" y="14" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="bold">TS</text>
          </svg>
        );
      case 'Python':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <circle cx="15" cy="15" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M9 12L15 12" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'PostgreSQL':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <ellipse cx="12" cy="8" rx="6" ry="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M6 8C6 8 6 12 12 16C18 12 18 8 18 8" stroke="currentColor" strokeWidth="1.5"/>
            <ellipse cx="12" cy="16" rx="6" ry="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        );
      case 'Docker':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <rect x="6" y="8" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <rect x="14" y="8" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <rect x="10" y="12" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <rect x="6" y="12" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <rect x="14" y="12" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        );
      case 'AWS':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M8 10L12 14L16 10" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'Git':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <circle cx="8" cy="8" r="2" fill="currentColor"/>
            <circle cx="16" cy="8" r="2" fill="currentColor"/>
            <circle cx="12" cy="16" r="2" fill="currentColor"/>
            <path d="M8 10L12 14M16 10L12 14" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'Figma':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <circle cx="15" cy="15" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M9 12C9 12 12 12 15 12" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'MongoDB':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <path d="M12 2C10 2 8 3 8 5C8 7 10 8 12 8C14 8 16 7 16 5C16 3 14 2 12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M12 8C12 8 12 16 12 20" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'Redis':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <rect x="8" y="6" width="8" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M8 10L16 10M8 14L16 14" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'Kubernetes':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <circle cx="8" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <circle cx="16" cy="12" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <circle cx="12" cy="16" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
          </svg>
        );
      case 'Next.js':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 8V16L12 22L20 16V8L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <text x="12" y="14" textAnchor="middle" fill="currentColor" fontSize="6" fontWeight="bold">NEXT</text>
          </svg>
        );
      case 'Tailwind CSS':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <path d="M12 4C10 4 9 5 8 6C9 7 10 8 12 8C14 8 15 7 16 6C15 5 14 4 12 4Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M8 10C10 10 11 9 12 8C13 9 14 10 16 10C15 11 14 12 12 12C10 12 9 11 8 10Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M8 14C10 14 11 13 12 12C13 13 14 14 16 14C15 15 14 16 12 16C10 16 9 15 8 14Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M8 18C10 18 11 17 12 16C13 17 14 18 16 18C15 19 14 20 12 20C10 20 9 19 8 18Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        );
      case 'GraphQL':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="7" r="2" fill="currentColor"/>
            <circle cx="8" cy="12" r="2" fill="currentColor"/>
            <circle cx="16" cy="12" r="2" fill="currentColor"/>
            <circle cx="12" cy="17" r="2" fill="currentColor"/>
            <path d="M12 7L8 12M12 7L16 12M8 12L12 17M16 12L12 17" stroke="currentColor" strokeWidth="1"/>
          </svg>
        );
      case 'MySQL':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <ellipse cx="12" cy="8" rx="5" ry="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M7 8C7 8 7 12 12 16C17 12 17 8 17 8" stroke="currentColor" strokeWidth="1.5"/>
            <ellipse cx="12" cy="16" rx="5" ry="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        );
      case 'Firebase':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 12L8 16L20 4L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M8 16L12 22L20 4L8 16Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        );
      case 'Azure':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8 2 4 6 4 10C4 14 8 18 12 18C16 18 20 14 20 10C20 6 16 2 12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M8 10L12 14L16 10" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'GCP':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 8V16L12 22L20 16V8L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M8 10L12 14L16 10" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'Jest':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <rect x="8" y="8" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
          </svg>
        );
      case 'Webpack':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 8V16L12 22L20 16V8L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <text x="12" y="14" textAnchor="middle" fill="currentColor" fontSize="6" fontWeight="bold">WP</text>
          </svg>
        );
      case 'Vite':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 12L12 22L20 12L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M8 10L12 14L16 10" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'Slack':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <rect x="8" y="8" width="3" height="3" rx="1" fill="currentColor"/>
            <rect x="13" y="8" width="3" height="3" rx="1" fill="currentColor"/>
            <rect x="8" y="13" width="3" height="3" rx="1" fill="currentColor"/>
            <rect x="13" y="13" width="3" height="3" rx="1" fill="currentColor"/>
          </svg>
        );
      case 'Jira':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <rect x="8" y="8" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
          </svg>
        );
      case 'Confluence':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <rect x="8" y="8" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M10 10L14 14M14 10L10 14" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'Elasticsearch':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M12 8C12 8 12 16 12 20" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'React Native':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="7" r="2" fill="currentColor"/>
            <circle cx="8" cy="12" r="2" fill="currentColor"/>
            <circle cx="16" cy="12" r="2" fill="currentColor"/>
            <circle cx="12" cy="17" r="2" fill="currentColor"/>
            <path d="M12 7L8 12M12 7L16 12M8 12L12 17M16 12L12 17" stroke="currentColor" strokeWidth="1.5"/>
            <text x="12" y="20" textAnchor="middle" fill="currentColor" fontSize="4">RN</text>
          </svg>
        );
      case 'Flutter':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 12L8 16L20 4L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M8 16L12 20L20 4L8 16Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        );
      case 'Swift':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 12L12 22L20 12L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M8 8L16 16" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'Kotlin':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 12L12 22L20 12L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M8 8L16 16M8 16L16 8" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'iOS':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <rect x="6" y="4" width="12" height="16" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <circle cx="12" cy="18" r="1" fill="currentColor"/>
          </svg>
        );
      case 'Android':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <rect x="8" y="6" width="8" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <circle cx="10" cy="4" r="1" fill="currentColor"/>
            <circle cx="14" cy="4" r="1" fill="currentColor"/>
          </svg>
        );
      case 'CI/CD':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <path d="M6 12L10 8M6 12L10 16M6 12L18 12M18 12L14 8M18 12L14 16" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        );
      case 'Terraform':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 8V16L12 22L20 16V8L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <text x="12" y="14" textAnchor="middle" fill="currentColor" fontSize="6" fontWeight="bold">TF</text>
          </svg>
        );
      case 'GitHub Actions':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M12 8C12 8 12 16 12 20" stroke="currentColor" strokeWidth="1.5"/>
            <text x="12" y="20" textAnchor="middle" fill="currentColor" fontSize="4">GA</text>
          </svg>
        );
      case 'DigitalOcean':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
          </svg>
        );
      case 'Vercel':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 20L12 14L20 20L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        );

      default:
        return (
          <div className={`${className} bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center`}>
            <span className="text-black dark:text-white font-bold text-xs">
              {name.substring(0, 2).toUpperCase()}
            </span>
          </div>
        );
    }
  };

  return getIcon();
}
