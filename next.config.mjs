/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  distDir: 'build',
  output: 'standalone',
  env: {
    NEXT_PUBLIC_AZURE_WEBAPP_ID_CLIENT: process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_CLIENT,
  },
};

export default nextConfig;
