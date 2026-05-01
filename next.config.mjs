import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['next-intl']
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // Ignore webpack cache warnings for next-intl
    config.ignoreWarnings = [
      {
        module: /node_modules\/next-intl\/dist\/esm\/production\/extractor\/format\/index\.js/,
        message: /Parsing.*for build dependencies failed at 'import\(t\)'/,
      },
    ];
    
    return config;
  }
};

export default withNextIntl(nextConfig);
