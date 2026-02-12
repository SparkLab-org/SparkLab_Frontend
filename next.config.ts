// next.config.ts
import type { NextConfig } from 'next';

const API_PROXY_TARGET = process.env.NEXT_PUBLIC_API_PROXY_TARGET?.replace(
  /\/$/,
  ''
);

const nextConfig: NextConfig = {
  async rewrites() {
    if (!API_PROXY_TARGET) {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: `${API_PROXY_TARGET}/:path*`,
      },
    ];
  },
};

export default nextConfig;
