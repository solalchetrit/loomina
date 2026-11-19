import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Newsreader } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import ScrollTop from "@/components/ScrollTop";
import Reveal from "@/components/Reveal";
import Analytics from "@/components/Analytics";
import Footer from "@/components/Footer";
import MobileCta from "@/components/MobileCta";
import HideOnAdmin from "@/components/HideOnAdmin";
import { SITE } from "@/config/site";
import { OFFER } from "@/config/offer";

// Serif des extraits de livre uniquement : c'est la page que le client recevra.
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-serif",
  display: "swap",
});

// Sans-serif du texte courant.
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Loomina | Écrivez votre autobiographie par téléphone",
    template: "%s | Loomina"
  },
  description: `Racontez votre vie au téléphone, Loomina en fait un livre relié. Le récit de chaque appel écrit pour vous, votre livre relu par notre équipe. Démo gratuite au ${SITE.phoneDisplay}.`,
  alternates: {
    canonical: "/",
  },
  keywords: ["biographie", "écrire ses mémoires", "livre autobiographique", "cadeau grands-parents", "récit de vie", "IA biographe"],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  openGraph: {
    title: "Loomina : racontez votre vie au téléphone, recevez un livre",
    description: "Racontez votre vie par téléphone, nous en faisons un livre. Sans écrire une seule ligne.",
    url: SITE.url,
    siteName: SITE.name,
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Quatre livres Loomina reliés en toile',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Loomina : votre vie, racontée au téléphone",
    description: "Racontez votre vie au téléphone, nous en faisons un livre relié.",
    images: ['/og-image.jpg'],
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
    // Deux comptes Google valident la Search Console (l'ancien et celui de Google Analytics).
    google: ["44ASdkaUR_-lBJ6kChxSvQ", "AELDeTK2I5PvRzbm2tmzJE10S82QCWl6bvq4F8fUX3Q"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} ${newsreader.variable} min-h-screen bg-[var(--canvas)] font-sans text-[var(--ink)] antialiased`}
      >
        <ScrollTop />
        <Reveal />
        <HideOnAdmin checkout><Header /></HideOnAdmin>
        <main>{children}</main>
        <HideOnAdmin checkout><Footer /><MobileCta /></HideOnAdmin>
        <HideOnAdmin><Analytics /></HideOnAdmin>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "name": SITE.name,
                  "url": SITE.url,
                  "logo": `${SITE.url}/icon.png`
                },
                {
                  "@type": "WebSite",
                  "name": SITE.name,
                  "url": SITE.url,
                  "inLanguage": "fr-FR"
                },
                {
                  "@type": "Product",
                  "name": OFFER.name,
                  "image": `${SITE.url}/og-image.jpg`,
                  "description": "Service de création de livre autobiographique par entretiens téléphoniques avec IA.",
                  "brand": {
                    "@type": "Brand",
                    "name": SITE.name
                  },
                  "offers": {
                    "@type": "Offer",
                    "url": SITE.url,
                    "priceCurrency": "EUR",
                    "price": OFFER.price.toFixed(2),
                    "availability": "https://schema.org/InStock"
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
