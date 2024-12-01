/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_AZURE_WEBAPP_ID_CLIENT: process.env.NEXT_PUBLIC_AZURE_WEBAPP_ID_CLIENT,
  },
  distDir: 'build',
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)', // Aplica a todas las rutas
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              style-src 'self' 'unsafe-inline';
              font-src 'self' data:;
              img-src 'self' data:;
            `.replace(/\n/g, ''), // Elimina saltos de línea para evitar errores
          },
        ],
      },
    ];
  },
};

export default nextConfig;
