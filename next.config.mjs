/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strip console statements in production builds
  compiler: {
    removeConsole: {
      // keep errors and warnings
      exclude: ['error', 'warn']
    }
  }
};

export default nextConfig;
