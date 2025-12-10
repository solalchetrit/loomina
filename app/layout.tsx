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
  title: "Loomina - Votre histoire, éternelle",
  description: "Livre autobiographique par téléphone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${plusJakartaSans.variable} ${playfair.variable} antialiased min-h-screen bg-white text-black font-sans selection:bg-[var(--loomina-amber)] selection:text-white relative`}>
        {/* Grain Texture Overlay */}
        <div
          className="fixed inset-0 z-50 pointer-events-none opacity-[0.15]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        ></div>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
