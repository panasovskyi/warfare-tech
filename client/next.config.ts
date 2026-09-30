import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'placehold.co' }],
  },
  sassOptions: {
    // Lets any .scss file write `@use 'variables'` without relative paths.
    // process.cwd() instead of __dirname: on Node 22.18+ Next loads this
    // file as native ESM, where __dirname is not defined.
    loadPaths: [path.join(process.cwd(), 'src/styles')],
  },
};

export default nextConfig;
