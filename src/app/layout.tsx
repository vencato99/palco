import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Figtree } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { NavigationProgress } from '@/components/layout/NavigationProgress';
import { Suspense } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { TourProvider } from '@/components/tour/TourProvider';
import './globals.css';

// next/font: fontes auto-hospedadas, sem request externo e sem layout shift.
const display = Bricolage_Grotesque({ subsets: ['latin'], weight: ['500', '700', '800'], variable: '--font-display', display: 'swap' });
const body = Figtree({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'Palco — casas de show, teatros e espaços para alugar', template: '%s · Palco' },
  description: 'Encontre casas de show, teatros e auditórios em todo o Brasil com ficha técnica, avaliações de produtores e contato direto. Monte roteiros de turnê em uma busca.',
  openGraph: { type: 'website', siteName: 'Palco', locale: 'pt_BR' },
};

export const viewport: Viewport = { themeColor: '#0D0D13', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-dvh">
        <ToastProvider>
          <TourProvider>
            <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-paper focus:px-4 focus:py-2 focus:text-ink">Pular para o conteúdo</a>
            <Suspense><NavigationProgress /></Suspense>
            <Header />
            <main id="conteudo">{children}</main>
            <Footer />
            <MobileNav />
          </TourProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
