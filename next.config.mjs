/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_AZURE_WEBAPP_ID_CLIENT: process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_CLIENT,
  },
  distDir: 'build',
  output: 'standalone',
  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         {
  //           key: 'Content-Security-Policy',
  //           value: `
  //             default-src 'self';
  //             script-src 'self' 'unsafe-inline' 'unsafe-eval';
  //             style-src 'self' 'unsafe-inline';
  //             font-src 'self' data:;
  //             img-src 'self' data:;
  //           `.replace(/\n/g, ''),
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default nextConfig;
