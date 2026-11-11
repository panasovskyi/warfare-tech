import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  sassOptions: {
    loadPaths: [path.join(process.cwd(), 'src/styles')],
  },
};

export default nextConfig;
