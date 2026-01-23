import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Cinzel, Courier_Prime } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "./config";

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
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: "Loomina | Écrivez votre autobiographie par téléphone",
    template: "%s | Loomina"
  },
  description: "Transformez vos souvenirs en un livre d'exception. Loomina est l'IA biographe qui recueille votre histoire par téléphone pour en faire une autobiographie éternelle.",
  alternates: {
    canonical: "/",
  },
  keywords: ["biographie", "écrire ses mémoires", "livre autobiographique", "cadeau grands-parents", "récit de vie", "IA biographe"],
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  openGraph: {
    title: "Loomina - Votre histoire mérite un livre éternel",
    description: "Racontez votre vie par téléphone, nous en faisons un livre. Sans écrire une seule ligne.",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
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
    google: "44ASdkaUR_-lBJ6kChxSvQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3F6NDBKRJ8"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-3F6NDBKRJ8');
            `,
          }}
        />
      </head>
      <body
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
              "@graph": [
                {
                  "@type": "Organization",
                  "name": SITE_CONFIG.name,
                  "url": SITE_CONFIG.url,
                  "logo": `${SITE_CONFIG.url}/icon.png`
                },
                {
                  "@type": "WebSite",
                  "name": SITE_CONFIG.name,
                  "url": SITE_CONFIG.url,
                  "inLanguage": "fr-FR"
                },
                {
                  "@type": "Product",
                  "name": SITE_CONFIG.product.name,
                  "image": `${SITE_CONFIG.url}/hero-book-v2.png`,
                  "description": "Service de création de livre autobiographique par entretiens téléphoniques avec IA.",
                  "brand": {
                    "@type": "Brand",
                    "name": SITE_CONFIG.name
                  },
                  "offers": {
                    "@type": "Offer",
                    "url": SITE_CONFIG.url,
                    "priceCurrency": SITE_CONFIG.product.currency,
                    "price": SITE_CONFIG.product.price.toFixed(2),
                    "availability": "https://schema.org/InStock",
                    "priceValidUntil": "2026-12-31"
                  }
                }
              ]
            })
          }}
        />
      </body>
    </html>
  );
}
