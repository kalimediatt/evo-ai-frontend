/** @type {import('next').NextConfig} */

import pkg from 'next-runtime-env';
const { withRuntimeEnv } = pkg;

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

// Adiciona suporte a variáveis em tempo de execução
export default withRuntimeEnv(nextConfig);
