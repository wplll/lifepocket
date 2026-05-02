/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  experimental: {
    cpus: 1,
    workerThreads: true,
    webpackBuildWorker: false
  },
  distDir: process.env.NEXT_DIST_DIR || ".next-build"
};

export default nextConfig;
