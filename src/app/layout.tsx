import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nails Sugar | Nail Salon à Rabat',
  description: 'Nails Sugar à CYM, Rabat — découvrez nos prestations de manucure, nail art et soins des ongles et réservez votre rendez-vous.',
  keywords: 'manucure, nail art, pédicure, ongles, Rabat, CYM, soins, gel, semi-permanent, Morocco',
  authors: [{ name: 'Nails Sugar' }],
  openGraph: {
    title: 'Nails Sugar | Nail Salon à Rabat',
    description: 'Nails Sugar à CYM, Rabat — découvrez nos prestations de manucure, nail art et soins des ongles et réservez votre rendez-vous.',
    type: 'website',
    locale: 'fr_MA',
    images: [{ url: '/images/hero.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nails Sugar | Nail Salon à Rabat',
    description: 'Manucure, nail art et soins des ongles dans un espace élégant à Rabat.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
