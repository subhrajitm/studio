import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Warranty Wallet',
  description: 'Manage your warranties with ease.',
  // Add meta tags for mobile-friendliness
  viewport: 'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover',
  applicationName: 'Warranty Wallet',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Warranty Wallet',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json', // Placeholder for PWA manifest
  themeColor: '#6699CC', // Primary color
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
