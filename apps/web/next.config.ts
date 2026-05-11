import type { NextConfig } from 'next'
import path from 'path'

// next-pwa@5.6.0 is incompatible with Next.js 15 — removed wrapper entirely.
// Re-add when a compatible version is available.

const nextConfig: NextConfig = {
  transpilePackages: ['@rank-app/shared'],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  webpack(config) {
    // Always resolve @rank-app/shared from TypeScript source so the Next.js
    // webpack never caches a stale compiled dist/ bundle.
    config.resolve.alias = {
      ...config.resolve.alias,
      '@rank-app/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    }
    return config
  },
}

module.exports = nextConfig
