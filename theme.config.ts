/**
 * Design Tokens - Premium Computational Agency
 * Minimalist aesthetic: Monochrome base + Cobalt accent
 */

export const theme = {
  colors: {
    // Base Monochrome
    black: '#000000',
    white: '#FFFFFF',
    // Neutral scale
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    // Accent: Cobalt Blue (sophisticated, tech-forward)
    accent: {
      DEFAULT: '#0047AB',
      light: '#1E5CC4',
      dark: '#003380',
      muted: 'rgba(0, 71, 171, 0.08)',
    },
  },
  
  typography: {
    fontFamily: {
      sans: 'var(--font-sans), system-ui, -apple-system, sans-serif',
      mono: 'var(--font-mono), ui-monospace, monospace',
    },
    // Tracking adjustments for headers
    tracking: {
      tighter: '-0.04em',
      tight: '-0.02em',
      normal: '0',
      wide: '0.02em',
      wider: '0.04em',
    },
    // Professional type scale (in px for precision)
    sizes: {
      'display-xl': 'clamp(4rem, 6vw, 6rem)',      // 64px - 96px (Hero)
      'display': 'clamp(2.5rem, 4vw, 3.5rem)',     // 40px - 56px (Section H2)
      'title': 'clamp(1.5rem, 2.5vw, 2rem)',       // 24px - 32px (Subsection H3)
      'subtitle': 'clamp(1.125rem, 1.5vw, 1.25rem)', // 18px - 20px
      'body': '1rem',                              // 16px (base)
      'body-sm': '0.9375rem',                      // 15px (slightly smaller body)
      'small': '0.875rem',                         // 14px
      'xs': '0.75rem',                             // 12px
      '2xs': '0.625rem',                           // 10px
    },
  },
  
  spacing: {
    section: 'clamp(6rem, 15vh, 10rem)',
    subsection: 'clamp(3rem, 8vh, 5rem)',
    element: 'clamp(1.5rem, 4vh, 2.5rem)',
  },
  
  animation: {
    // Smooth, subtle transitions
    duration: {
      fast: 0.2,
      normal: 0.4,
      slow: 0.6,
      slower: 0.8,
    },
    easing: {
      smooth: [0.25, 0.1, 0.25, 1],
      elegant: [0.22, 1, 0.36, 1],
      crisp: [0.165, 0.84, 0.44, 1],
    },
    // Stagger delays
    stagger: 0.08,
  },
  
  borders: {
    ultraThin: '1px solid rgba(0, 0, 0, 0.06)',
    thin: '1px solid rgba(0, 0, 0, 0.1)',
    accent: '1px solid rgba(0, 71, 171, 0.3)',
  },
} as const;

export type Theme = typeof theme;
