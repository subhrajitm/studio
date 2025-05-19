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
  title: 'Warrity',
  description: 'Manage your warranties with ease with Warrity.',
  // Add meta tags for mobile-friendliness
  viewport: 'minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover',
  applicationName: 'Warrity',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Warrity',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json', // Placeholder for PWA manifest
  themeColor: '#62D926', // Updated to match primary green
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
