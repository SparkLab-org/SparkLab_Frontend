// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://34.22.110.141/:path*',
      },
    ];
  },
};

export default nextConfig;