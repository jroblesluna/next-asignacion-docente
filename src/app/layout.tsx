'use client';
import { Roboto } from 'next/font/google';
import './globals.css';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from '../app/lib/msalConfig';

const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <MsalProvider instance={msalInstance}>
      <html lang="en">
        <head>
          <link rel="icon" type="image/svg+xml" href="/icpna-SmallIcon.png" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Asignación docente</title>
        </head>
        <body className={roboto.className} suppressHydrationWarning={true}>
          {children}
        </body>
      </html>
    </MsalProvider>
  );
}
