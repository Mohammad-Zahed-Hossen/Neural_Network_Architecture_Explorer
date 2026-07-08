import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  turbopack: {
    resolveAlias: {
      '@': {
        '(.*)$': './$1',
      },
    },
  },
  webpack: (config) => {
    config.resolve.alias['@'] = './';
    return config;
  },
};

export default nextConfig;
