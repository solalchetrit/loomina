import Hero from "@/components/Hero";
import ScrollSeparator from "@/components/ui/ScrollSeparator";
import HowItWorks from "@/components/HowItWorks";
import Button from "@/components/ui/Button";
import ResumeOrderToast from "@/components/ResumeOrderToast";

// --- DATA ---
const offer = {
  title: "Le Coffret Biographie Complet",
  price: "219",
  currency: "€",
  description: "Un tarif tout compris pour votre Biographie. De la collecte de vos souvenirs à la mise en mots de votre récit, jusqu'à la livraison de votre livre.",
  highlights: [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      text: "Entretiens illimités",
      subtext: "avec votre biographe IA"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      text: "Rédaction & corrections",
      subtext: "style littéraire premium"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      text: "Vos photos intégrées",
      subtext: "pour illustrer votre récit"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      text: "Livre imprimé",
      subtext: "livré chez vous"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      text: "Version numérique",
      subtext: "(ebook privé) incluse"
    },
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-transparent text-[var(--text-primary)] relative">
      <div className="w-full relative z-10">
        <Hero />
      </div>
      <ResumeOrderToast />
      <div className="py-4">
        <ScrollSeparator />
      </div>

      {/* --- SECTION: LE PARCOURS --- */}
      <HowItWorks />
      <div className="py-4">
        <ScrollSeparator />
      </div>

      {/* --- SECTION: OFFRE PREMIUM --- */}
      <div id="offres" className="w-full scroll-mt-24">
        <section className="relative w-full md:min-h-[600px] flex items-center px-6 pt-12 pb-12 overflow-hidden">
          <div className="relative z-10 mx-auto max-w-5xl w-full">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--loomina-gold)]" />
                <span className="text-[var(--loomina-gold)] text-xs font-semibold tracking-[0.3em] uppercase">
                  L’Offre
                </span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--loomina-gold)]" />
              </div>

              <h2 className="heading-section font-serif text-[var(--text-primary)] mb-4">
                Votre Livre de vie,
                <span className="block text-gradient-gold">clé en main.</span>
              </h2>

              <p className="text-base text-[var(--text-secondary)] max-w-2xl mx-auto font-serif">
                Nous croyons que chaque vie est un livre d’exception qui mérite d’être transmis. Transmettre son histoire n’a jamais été aussi simple et accessible.
              </p>
            </div>

            {/* Main Offer Card */}
            <div className="relative max-w-4xl mx-auto">
              {/* Main Offer Card - Enhanced Premium Design */}
              <div className="relative glass-gold rounded-[2rem] p-8 md:p-10 overflow-hidden border border-[var(--loomina-gold)]/20 shadow-2xl shadow-[var(--loomina-gold)]/5">

                {/* Product Label */}
                <div className="absolute top-0 right-0 px-8 py-3 bg-[var(--loomina-gold)] text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-bl-2xl">
                  Forfait Unique
                </div>

                <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
                  {/* Left Column - Features */}
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-serif text-[var(--text-primary)] mb-4 leading-tight">
                        {offer.title}
                      </h3>
                      <p className="text-[var(--text-secondary)] font-serif text-base leading-relaxed opacity-90">
                        {offer.description}
                      </p>
                    </div>

                    <ul className="space-y-4">
                      {offer.highlights.map((item, index) => (
                        <li key={index} className="flex items-center gap-4 group">
                          <div className="w-10 h-10 rounded-xl bg-white/50 border border-[var(--loomina-gold)]/20 flex items-center justify-center text-[var(--loomina-gold)] shadow-sm group-hover:scale-110 transition-transform">
                            {item.icon}
                          </div>
                          <div>
                            <span className="text-[var(--text-primary)] font-semibold block text-sm">{item.text}</span>
                            <span className="text-[var(--text-muted)] text-xs italic font-serif">{item.subtext}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right Column - Price & CTA */}
                  <div className="flex flex-col items-center text-center lg:border-l lg:border-[var(--loomina-mist)]/50 lg:pl-10">
                    <div className="mb-8 bg-[var(--loomina-mist)]/10 p-6 rounded-3xl w-full border border-[var(--loomina-mist)]/20">
                      <span className="text-[var(--text-muted)] text-[10px] uppercase tracking-[0.3em] font-bold block mb-2">
                        &quot;Un héritage précieux pour les générations futures. Loomina a transformé l’histoire de mon grand-père en un véritable chef-d’œuvre.&quot;
                      </span>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-7xl md:text-8xl font-serif text-gradient-gold drop-shadow-sm">
                          {offer.price}
                        </span>
                        <span className="text-3xl text-[var(--loomina-gold)] font-serif mb-3">
                          {offer.currency}
                        </span>
                      </div>
                      <div className="h-px w-12 bg-[var(--loomina-gold)]/30 mx-auto my-4" />
                      <p className="text-[var(--text-primary)] font-serif text-sm font-medium">
                        Tout inclus • Zéro frais cachés
                      </p>
                    </div>

                    <div className="w-full space-y-5">
                      <Button
                        href="/order"
                        variant="primary"
                        size="lg"
                        fullWidth
                        className="py-5 text-lg shadow-xl shadow-[var(--loomina-gold)]/20"
                      >
                        Commander ma biographie
                      </Button>

                      {/* Trust indicators */}
                      <div className="flex flex-col items-center gap-4 py-2">
                        <div className="flex items-center justify-center gap-6 text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[var(--loomina-gold)]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span>Stripe Secure</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[var(--loomina-gold)]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                            <span>Garantie Totale</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom note */}
            <p className="text-center text-sm text-[var(--text-muted)] mt-8 font-serif">
              Un cadeau idéal pour vos parents et grands-parents.
            </p>
          </div>
        </section>
      </div>

      {/* --- SECTION: SOCIAL PROOF / TESTIMONIAL TEASER --- */}
      <section className="w-full pt-8 pb-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <blockquote className="text-2xl md:text-3xl font-serif text-[var(--text-primary)] italic leading-relaxed mb-6">
            &quot;Le plus beau cadeau que j’ai pu faire à ma mère. Elle a adoré raconter sa vie,
            et maintenant nous avons un trésor familial pour toujours.&quot;
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--loomina-gold)] to-[var(--loomina-gold-dark)]" />
            <div className="text-left">
              <p className="text-[var(--text-primary)] font-medium">Sophie M.</p>
              <p className="text-[var(--text-muted)] text-sm">Pour sa mère, 72 ans</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
