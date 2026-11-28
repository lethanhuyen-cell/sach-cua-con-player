import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, Lora } from 'next/font/google';
import './globals.css';
import { getPublishedLibrary } from '@/lib/repository';
import { LibraryPlayerProvider } from '@/context/LibraryPlayerContext';
import { AppShell } from '@/components/layout/AppShell';

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
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  appleWebApp: {
    capable: true,
    title: 'Đồi Mơ',
    statusBarStyle: 'default'
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    title: 'Thư viện Đồi Mơ — Sách đọc và nghe trước giờ ngủ',
    description: 'Tủ sách đọc và sách nói gia đình trước giờ ngủ. Copyright © Nancy & Liti.',
    images: ['/images/doi-mo-cover.jpg']
  },
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
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F5EE' },
    { media: '(prefers-color-scheme: dark)', color: '#111613' }
  ]
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const initialBooks = await getPublishedLibrary();

  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${lora.variable} ${beVietnamPro.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var n=new Date(),mins=n.getHours()*60+n.getMinutes(),a=mins>=1170||mins<330,p=mins<330?new Date(n.getTime()-43200000):n,w=p.getFullYear()+'-'+(p.getMonth()+1)+'-'+p.getDate()+(a?'-night':'-day'),raw=localStorage.getItem('litibook_theme_window_v3'),useNight=a;if(raw){var s=JSON.parse(raw);if(s&&s.windowKey===w&&typeof s.isNight==='boolean'){useNight=s.isNight;}}if(useNight){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light';}var tc=useNight?'#111613':'#F8F5EE',metas=document.querySelectorAll('meta[name="theme-color"]');if(metas.length>0){for(var i=0;i<metas.length;i++){metas[i].setAttribute('content',tc);}}else{var m=document.createElement('meta');m.setAttribute('name','theme-color');m.setAttribute('content',tc);document.head.appendChild(m);}}catch(e){}})();`
          }}
        />
      </head>
      <body>
        <LibraryPlayerProvider initialBooks={initialBooks}>
          <AppShell>{children}</AppShell>
        </LibraryPlayerProvider>
      </body>
    </html>
  );
}
