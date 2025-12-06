import FidjooFAQ from "@/components/FidjooFAQ";
import CharacterSheetsSection from "@/components/CharacterSheetsSection";
import FeatureHighlights from "@/components/FeatureHighlights";
import OfferPreview from "@/components/OfferPreview";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ImpactMetrics from "@/components/ImpactMetrics";
import Testimonials from "@/components/Testimonials";
import TrustBand from "@/components/TrustBand";
import Commitments from "@/components/Commitments";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[var(--background)] text-[var(--loomina-text)]">
      <Hero />
      <TrustBand />
      <ImpactMetrics />
      <FeatureHighlights />
      <Commitments />
      <HowItWorks />
      <CharacterSheetsSection />
      <OfferPreview />
      <Testimonials />

      <section className="w-full bg-[#0c162b] py-20 px-6 relative overflow-hidden" id="faq">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(124,58,237,0.15),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(34,211,238,0.18),transparent_28%)]" />
        <div className="relative max-w-5xl mx-auto flex flex-col items-center gap-8">
          <div className="text-center space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-gold-light)] font-semibold">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight text-white">
              Tout ce qu'il faut savoir avant de commencer
            </h2>
            <p className="text-[var(--loomina-text-light)] max-w-2xl mx-auto leading-relaxed">
              Détails pratiques, accompagnement humain, délais : nous répondons aux questions les plus fréquentes.
            </p>
          </div>
          <FidjooFAQ />
        </div>
      </section>

      <section className="w-full bg-gradient-to-r from-[#0b1022] via-[#0f172a] to-[#0b1224] text-white py-16 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-8 items-center">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] font-semibold text-[var(--loomina-gold)]">Passer à l'action</p>
            <h3 className="text-3xl md:text-4xl font-semibold leading-tight">Prêt à enregistrer les souvenirs de votre famille ?</h3>
            <p className="text-white/80 leading-relaxed">
              Nous préparons une première session gratuite pour comprendre votre histoire et vous proposer une structure de livre adaptée.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href="#comment"
              className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[var(--loomina-gold)] text-[#051226] font-semibold shadow-[0_20px_60px_-35px_rgba(34,211,238,0.8)] hover:bg-[var(--loomina-gold-light)] transition-colors"
            >
              Planifier une session découverte
            </a>
            <span className="text-white/70 text-sm text-center">Réponse en moins de 24h</span>
          </div>
        </div>
      </section>
    </div>
  );
}
