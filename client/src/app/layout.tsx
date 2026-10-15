import type { Metadata } from 'next';
import { Manrope, JetBrains_Mono } from 'next/font/google';
import './globals.scss';
import { Header } from '@/components/layout/Header/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { THEME_INIT_SCRIPT } from '@/lib/theme';

// TODO:
// - metadata: коли буде домен — metadataBase і картинка для соцмереж (opengraph-image);
//   сторінки новини й розділів — свої title (шаблон '%s | Warfare Tech' уже тут) і description

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
});

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains_mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Warfare Tech — Military Technology News',
    template: '%s | Warfare Tech',
  },
  description:
    'News and longreads on military technology: air, land, naval, space, cyber and UAVs, with ongoing coverage of the war in Ukraine.',
  applicationName: 'Warfare Tech',
  openGraph: {
    type: 'website',
    siteName: 'Warfare Tech',
    locale: 'en_US',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // suppressHydrationWarning: скрипт у <head> ставить data-theme на <html> до гідратації,
    // тож атрибут на клієнті є, а в серверній розмітці його нема. Прапорець діє лише на сам
    // <html>, не на вкладені елементи
    <html
      lang='en'
      className={`${manrope.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <a href='#main-content' className='skip-link'>
          Skip to content
        </a>
        <Header />
        <main id='main-content' tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
