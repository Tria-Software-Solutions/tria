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
      /Failed to parse.*next-intl.*import\(t\)/,
      /Parsing.*for build dependencies failed at 'import\(t\)'/,
    ];
    
    return config;
  }
};

export default nextConfig;
