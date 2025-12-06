import FidjooFAQ from "@/components/FidjooFAQ";
import CharacterSheetsSection from "@/components/CharacterSheetsSection";
import FeatureHighlights from "@/components/FeatureHighlights";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ImpactMetrics from "@/components/ImpactMetrics";
import Testimonials from "@/components/Testimonials";
import TrustBand from "@/components/TrustBand";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#f2efeb] text-[var(--loomina-text)]">
      <Hero />
      <TrustBand />
      <ImpactMetrics />
      <FeatureHighlights />
      <HowItWorks />
      <CharacterSheetsSection />
      <Testimonials />

      <section className="w-full bg-[var(--loomina-cream)] py-20 px-6" id="faq">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-8">
          <div className="text-center space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--loomina-text-light)] font-semibold">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
              Tout ce qu'il faut savoir avant de commencer
            </h2>
            <p className="text-[var(--loomina-text-light)] max-w-2xl mx-auto leading-relaxed">
              Détails pratiques, accompagnement humain, délais : nous répondons aux questions les plus fréquentes.
            </p>
          </div>
          <FidjooFAQ />
        </div>
      </section>

      <section className="w-full bg-[var(--loomina-burgundy)] text-white py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-8 items-center">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] font-semibold text-[var(--loomina-gold-light)]">Passer à l'action</p>
            <h3 className="text-3xl md:text-4xl font-semibold leading-tight">Prêt à enregistrer les souvenirs de votre famille ?</h3>
            <p className="text-white/80 leading-relaxed">
              Nous préparons une première session gratuite pour comprendre votre histoire et vous proposer une structure de livre adaptée.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href="#comment"
              className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-white text-[var(--loomina-burgundy)] font-semibold shadow-lg shadow-[rgba(0,0,0,0.2)] hover:bg-[var(--loomina-gold-light)] transition-colors"
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
