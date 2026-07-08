import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  turbopack: {
    resolveAlias: {
      '~@': './',
    },
  },
  webpack: (config) => {
    config.resolve.alias['@'] = './';
    return config;
  },
};

export default nextConfig;
