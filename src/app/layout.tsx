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
        <body className={roboto.className}>{children}</body>
      </html>
    </MsalProvider>
  );
}
