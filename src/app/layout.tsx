import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'XML Pricing Sheet SaaS',
  description: 'Parse XML price inquiry files into editable pricing sheets.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
