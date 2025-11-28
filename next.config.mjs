/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Experimental features
  experimental: {
    // Exclude heavy dependencies from specific API routes to reduce bundle size
    outputFileTracingExcludes: {
      '/api/admin/generate-sitemap': [
        // Exclude document processing libraries not used by sitemap generation
        'node_modules/textract/**/*',
        'node_modules/mammoth/**/*',
        'node_modules/docx/**/*',
        'node_modules/pdf-parse/**/*',
        'node_modules/pdfjs-dist/**/*',
        'node_modules/html2pdf.js/**/*',
        'node_modules/html2canvas/**/*',
        'node_modules/jspdf/**/*',
        'node_modules/html-docx-js/**/*',
        // Exclude email libraries not used by sitemap
        'node_modules/@getbrevo/**/*',
        'node_modules/@emailjs/**/*',
        'node_modules/nodemailer/**/*',
        // Exclude other heavy dependencies
        'node_modules/firebase/**/*',
        'node_modules/firebase-admin/**/*',
        'node_modules/openai/**/*',
        'node_modules/redis/**/*',
        'node_modules/express/**/*',
        'node_modules/formidable/**/*',
        // Exclude MongoDB native bindings and optional dependencies
        'node_modules/mongodb/lib/deps.js',
        'node_modules/@mongodb-js/zstd/**/*',
        'node_modules/kerberos/**/*',
        'node_modules/snappy/**/*',
        'node_modules/@aws-sdk/**/*',
        'node_modules/gcp-metadata/**/*',
        'node_modules/socks/**/*',
      ],
    },
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
