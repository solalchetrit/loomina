import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Newsreader } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_CONFIG } from "./config";

// Serif éditoriale (titres, extraits de livre) : Newsreader, dessinée pour la lecture longue.
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbf9f5",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: "Loomina | Écrivez votre autobiographie par téléphone",
    template: "%s | Loomina"
  },
  description: "Racontez votre vie au téléphone, Loomina en fait un livre relié. Un chapitre après chaque appel, chaque page relue par notre équipe. Démo gratuite au 01 59 16 93 57.",
  alternates: {
    canonical: "/",
  },
  keywords: ["biographie", "écrire ses mémoires", "livre autobiographique", "cadeau grands-parents", "récit de vie", "IA biographe"],
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  openGraph: {
    title: "Loomina : racontez votre vie au téléphone, recevez un livre",
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
    title: "Loomina : votre vie, racontée au téléphone",
    description: "Racontez votre vie au téléphone, nous en faisons un livre relié.",
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
        className={`${plusJakartaSans.variable} ${newsreader.variable} antialiased min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans relative`}
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
