/** @type {import('next').NextConfig} */
const nextConfig = {
  // FIX FOR LOCKFILE WARNING - Explicitly set workspace root
  outputFileTracingRoot: '/home/frederick/dev/cafe-app',

  // Keep existing configs
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['localhost'],
  },

  // Production optimizations
  reactStrictMode: true,
  poweredByHeader: false,

  // SirkupAI Branding
  env: {
    APP_NAME: 'SirkupAI Cafe POS',
    APP_VERSION: '1.0.0',
  },

  // Suppress experimental warnings
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
