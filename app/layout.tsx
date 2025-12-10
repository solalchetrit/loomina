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
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
