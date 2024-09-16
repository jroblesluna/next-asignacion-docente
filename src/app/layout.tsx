import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
// import localFont from 'next/font/local';
import './globals.css';

// const geistSans = localFont({
//   src: './fonts/GeistVF.woff',
//   variable: '--font-geist-sans',
//   weight: '100 900',
// });
// const geistMono = localFont({
//   src: './fonts/GeistMonoVF.woff',
//   variable: '--font-geist-mono',
//   weight: '100 900',
// });

const roboto = Roboto({
  weight: ['400', '700'], // Pesos que necesitas
  subsets: ['latin'], // Subconjuntos de caracteres
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Asignación Docente',
  description: 'Descripción de tu sitio web',
  icons: {
    icon: '/icpna-SmallIcon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>{children}</body>
    </html>
  );
}
