/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strip console statements in production builds
  compiler: {
    removeConsole: {
      // keep errors and warnings
      exclude: ['error', 'warn']
    }
  },
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },
  // Enable compression
  compress: true,
  // Power optimizations
  poweredByHeader: false,
  // Optimize package imports to reduce bundle size
  experimental: {
    optimizePackageImports: ['react-bootstrap', 'swiper', 'aos'],
  },
  // Configure webpack to reduce polyfills for modern browsers
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Reduce polyfills by targeting modern browsers
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
