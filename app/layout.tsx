import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Configuration Serif (Titres "Livre")
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

// Configuration Sans-Serif (Texte courant) - Ajout du poids "300" pour la finesse
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://loomina.eu'),
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
    url: 'https://loomina.eu',
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
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
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
    <html lang="fr" className="scroll-smooth">
      <body className={`${plusJakartaSans.variable} ${playfair.variable} antialiased min-h-screen bg-white text-black font-sans selection:bg-[var(--loomina-amber)] selection:text-white relative`}>
        <Header />
        {children}
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Loomina - Livre Autobiographique",
              "image": "https://loomina.eu/hero-book-v2.png",
              "description": "Service de création de livre autobiographique par entretiens téléphoniques avec IA.",
              "brand": {
                "@type": "Brand",
                "name": "Loomina"
              },
              "offers": {
                "@type": "Offer",
                "url": "https://loomina.eu",
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
