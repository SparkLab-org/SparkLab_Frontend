// next.config.ts
import type { NextConfig } from 'next';

const API_PROXY_TARGET =
  process.env.NEXT_PUBLIC_API_PROXY_TARGET ?? 'http://34.22.110.141';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_PROXY_TARGET}/:path*`,
      },
    ];
  },
};

export default nextConfig;
