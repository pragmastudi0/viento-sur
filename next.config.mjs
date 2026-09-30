/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // All product images are served locally from /public, so no remote patterns
    // are needed. Modern formats improve mobile performance.
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
