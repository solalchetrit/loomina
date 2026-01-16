import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Cinzel, Courier_Prime } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Configuration Serif (Titres élégants)
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

// Configuration Sans-Serif (Texte moderne)
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const courierPrime = Courier_Prime({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-courier",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.loomina.eu'),
  title: {
    default: "Loomina | Écrivez votre autobiographie par téléphone",
    template: "%s | Loomina"
  },
  description: "Transformez vos souvenirs en un livre d'exception. Loomina est l'IA biographe qui recueille votre histoire par téléphone pour en faire une autobiographie éternelle.",
  keywords: ["biographie", "écrire ses mémoires", "livre autobiographique", "cadeau grands-parents", "récit de vie", "IA biographe"],
  authors: [{ name: "Loomina" }],
  creator: "Loomina",
  publisher: "Loomina",
  openGraph: {
    title: "Loomina - Votre histoire mérite un livre éternel",
    description: "Racontez votre vie par téléphone, nous en faisons un livre. Sans écrire une seule ligne.",
    url: 'https://www.loomina.eu',
    siteName: 'Loomina',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Livre Loomina - Biographie par téléphone',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Loomina - Votre histoire, éternelle",
    description: "La première biographie rédigée 100% par téléphone.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "AELDeTK2I5PvRzbm2tmzJE10S82QCWl6bvq4F8fUX3Q",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${plusJakartaSans.variable} ${playfair.variable} ${cinzel.variable} ${courierPrime.variable} antialiased min-h-screen bg-[var(--loomina-void)] text-[var(--text-primary)] font-sans selection:bg-[var(--loomina-gold)] selection:text-[var(--loomina-void)] relative`}
      >
        <Header />
        <main className="relative z-0">
          {children}
        </main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Loomina - Livre Autobiographique",
              "image": "https://www.loomina.eu/hero-book-v2.png",
              "description": "Service de création de livre autobiographique par entretiens téléphoniques avec IA.",
              "brand": {
                "@type": "Brand",
                "name": "Loomina"
              },
              "offers": {
                "@type": "Offer",
                "url": "https://www.loomina.eu",
                "priceCurrency": "EUR",
                "price": "219.00",
                "availability": "https://schema.org/InStock",
                "priceValidUntil": "2026-12-31"
              }
            })
          }}
        />
      </body>
    </html>
  );
}
