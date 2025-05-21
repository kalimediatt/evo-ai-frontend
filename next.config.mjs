const { withRuntimeEnv } = require('next-runtime-env');

module.exports = withRuntimeEnv({
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
});
