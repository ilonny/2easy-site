/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // compiler: {
  //   removeConsole: true,
  // },
  env: {
    BASE_URL: process.env.BASE_URL
  }
};

export default nextConfig;
