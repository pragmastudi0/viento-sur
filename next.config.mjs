/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  agentRules: false,
  allowedDevOrigins: ['127.0.0.1'],
  images: {
    formats: ['image/webp'],
    dangerouslyAllowLocalIP: process.env.NEXT_PUBLIC_SUPABASE_URL === 'http://127.0.0.1:56321',
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL ? [{
      protocol: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).protocol.replace(':', ''),
      hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
      port: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).port,
      pathname: '/storage/v1/object/public/viento_sur_catalogo/products/**',
    }] : [],
  },
};

export default nextConfig;
