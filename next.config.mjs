/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize output for serverless
  output: 'standalone',
  
  // Strip console statements in production builds
  compiler: {
    removeConsole: {
      // keep errors and warnings
      exclude: ['error', 'warn']
    }
  },
  
  // Optimize images - mobile-first sizes
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    // Optimize for mobile
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Enable compression
  compress: true,
  
  // Power optimizations
  poweredByHeader: false,

  // Exclude large files from serverless output traces (Next.js 15+ top-level key)
  outputFileTracingExcludes: {
    '*': [
      'public/assets/images/**',
      'public/justjobinfo2.mp4',
      'public/justjobsinfo.mp4',
      'public/assets/fonts/**',
      'public/uploads/**',
      'public/assets/css/**',
      'public/assets/js/**',
      'public/assets/resumes/**',
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild/linux-x64',
    ],
  },

  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=0, must-revalidate, no-cache',
          },
        ],
      },
      {
        source: '/sitemap.xml/',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=0, must-revalidate, no-cache',
          },
        ],
      },
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
      {
        source: '/:all*.(mp4|webm|ogg|mov)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Content-Type',
            value: 'video/mp4',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
