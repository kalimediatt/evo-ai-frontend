import pkg from 'next-runtime-env';

const { default: withRuntimeEnv } = pkg;

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
  runtimeEnv: ['NEXT_PUBLIC_API_URL'],
};

export default withRuntimeEnv(nextConfig);
