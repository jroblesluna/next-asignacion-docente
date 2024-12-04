/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
  },
  distDir: 'build',
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Powered-By',
            value: '', // Remove the X-Powered-By header
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://*.azureedge.net https://*.azure.com https://login.microsoftonline.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.azureedge.net; font-src 'self' https://fonts.gstatic.com https://*.azureedge.net; img-src 'self' data: https://*.azureedge.net https://*.azure.com; connect-src 'self' https://*.azure.com https://management.azure.com https://login.microsoftonline.com https://*.azureedge.net; frame-src 'self' https://login.microsoftonline.com; object-src 'none'; base-uri 'self'; form-action 'self'; report-uri /csp-violation-report-endpoint;",
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
