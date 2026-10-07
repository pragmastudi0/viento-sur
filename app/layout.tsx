import type { Metadata } from 'next';
import { Fraunces, Mulish, Caveat } from 'next/font/google';
import './globals.css';
import { SITE } from '@/lib/site';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import SiteChrome from '@/components/SiteChrome';

const display = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display',
});

const sans = Mulish({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const script = Caveat({
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
  variable: '--font-script',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'Viento Sur | Lámparas de diseño',
    template: '%s | Viento Sur',
  },
  description: SITE.description,
  keywords: [
    'lámparas de pie',
    'veladores',
    'lámparas de diseño',
    'iluminación',
    'Viento Sur',
    'Argentina',
  ],
  authors: [{ name: 'Viento Sur' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'Viento Sur',
    title: 'Viento Sur | Lámparas de diseño',
    description: SITE.description,
    url: SITE.url,
    images: [
      {
        url: '/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Viento Sur — Iluminación que transforma espacios',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Viento Sur | Lámparas de diseño',
    description: SITE.description,
    images: ['/og.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${sans.variable} ${script.variable}`}
    >
      <body className="min-h-screen">
        <ToastProvider>
          <CartProvider>
            <a
              href="#contenido"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-cream"
            >
              Saltar al contenido
            </a>
            <SiteChrome>{children}</SiteChrome>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
