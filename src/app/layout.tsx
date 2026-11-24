import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, Lora } from 'next/font/google';
import './globals.css';
import { getPublishedLibrary } from '@/lib/repository';
import { LibraryPlayerProvider } from '@/context/LibraryPlayerContext';
import { AppShell } from '@/components/AppShell';

const lora = Lora({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap'
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Thư viện Đồi Mơ — Sách đọc và nghe trước giờ ngủ',
  description: 'Thư viện Đồi Mơ — Sách đọc và nghe trước giờ ngủ. Copyright © Nancy & Liti.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true
    }
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#F8F5EE'
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const initialBooks = await getPublishedLibrary();

  return (
    <html lang="vi" className={`${lora.variable} ${beVietnamPro.variable}`}>
      <body>
        <LibraryPlayerProvider initialBooks={initialBooks}>
          <AppShell>{children}</AppShell>
        </LibraryPlayerProvider>
      </body>
    </html>
  );
}
