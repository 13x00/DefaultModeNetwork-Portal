import type { Metadata } from 'next';
import './styles/globals.css';

export const metadata: Metadata = {
  title: 'DMN Lab - Default Mode Network Research Lab',
  description: 'Default Mode Network Research Lab - Avslappningsmaskin 3000 - White Terminal Interface',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='4' ry='4' fill='white'/><image href='/assets/Logo_Mark.png' width='20' height='20' x='6' y='6'/></svg>" />
      </head>
      <body>{children}</body>
    </html>
  );
}
