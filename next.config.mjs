/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_AZURE_WEBAPP_ID_CLIENT: process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_CLIENT,
  },
  distDir: 'build',
  output: 'standalone',
};

export default nextConfig;
