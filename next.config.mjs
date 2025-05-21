import { withRuntimeEnv } from 'next-runtime-env';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default withRuntimeEnv(nextConfig, {
  runtimeEnv: ['NEXT_PUBLIC_API_URL'],
});
