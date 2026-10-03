import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Button from "@/components/ui/Button";

import { SITE_CONFIG } from "./config";

// --- DATA ---
const offer = {
  title: "Le Coffret Biographie Complet",
  price: SITE_CONFIG.product.price.toString(),
  currency: SITE_CONFIG.product.currencySymbol,
  description:
    "Un tarif tout compris pour votre biographie : de la collecte de vos souvenirs à la mise en mots de votre récit, jusqu’à la livraison de votre livre.",
  highlights: [
    { text: "Entretiens illimités", subtext: "avec votre biographe IA" },
    { text: "Rédaction & corrections", subtext: "style littéraire soigné" },
    { text: "Vos photos intégrées", subtext: "pour illustrer votre récit" },
    { text: "Livre imprimé", subtext: "livré chez vous" },
    { text: "Version numérique", subtext: "ebook privé inclus" },
  ],
};

const Check = () => (
  <svg className="mt-0.5 h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="9.25" className="fill-[var(--loomina-night)] stroke-[var(--hairline-strong)]" strokeWidth="0.75" />
    <path d="m6.5 10.2 2.3 2.3 4.7-4.9" className="stroke-[var(--gold-ink)]" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-transparent text-[var(--text-primary)]">
      <Hero />

      <HowItWorks />

      {/* --- OFFRE --- */}
      <section id="offres" className="w-full scroll-mt-24 bg-[var(--loomina-night)] py-24 md:py-32">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-6">
          <div className="reveal mx-auto max-w-3xl text-center">
            <p className="font-sans text-[12px] font-semibold uppercase tracking-[0.2em] text-[var(--gold-ink)]">L’offre</p>
            <h2 className="mt-4 font-serif text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.05] tracking-[-0.03em] text-[var(--ink)]">
              Votre <span className="whitespace-nowrap">Livre de vie,</span> <em className="text-[var(--gold-ink)]">clé en main.</em>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl font-sans text-[17px] leading-relaxed text-[var(--text-secondary)]">
              Chaque vie est un livre d’exception qui mérite d’être transmis. Le raconter n’a jamais été aussi simple.
            </p>
          </div>

          <div className="reveal mx-auto mt-14 grid max-w-5xl overflow-hidden rounded-[28px] bg-[var(--paper)] shadow-[0_0_0_1px_var(--hairline),0_30px_60px_-40px_rgba(26,24,21,0.35)] md:mt-16 lg:grid-cols-[1.15fr_1fr]">
            {/* Contenu */}
            <div className="p-7 sm:p-10 md:p-12">
              <span className="inline-flex items-center rounded-full bg-[var(--loomina-night)] px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--gold-ink)] shadow-[inset_0_0_0_1px_var(--hairline)]">
                Forfait unique
              </span>
              <h3 className="mt-5 font-serif text-[28px] leading-tight tracking-[-0.02em] text-[var(--ink)] md:text-[32px]">
                {offer.title}
              </h3>
              <p className="mt-3 font-sans text-[15px] leading-relaxed text-[var(--text-secondary)]">{offer.description}</p>

              <ul className="mt-8 divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
                {offer.highlights.map((item) => (
                  <li key={item.text} className="flex items-start gap-3 py-3.5 font-sans">
                    <Check />
                    <span className="font-sans text-[15px] leading-snug text-[var(--ink)]">
                      <span className="font-semibold">{item.text}</span>
                      <span className="text-[var(--text-muted)]"> — {item.subtext}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prix */}
            <div className="flex flex-col justify-between gap-10 border-t border-[var(--hairline)] bg-[linear-gradient(180deg,var(--loomina-void),var(--loomina-night))] p-7 sm:p-10 md:p-12 lg:border-l lg:border-t-0">
              <div>
                <p className="font-sans text-sm font-medium text-[var(--text-secondary)]">Prix unique</p>
                <div className="mt-3 flex items-start gap-1.5">
                  <span className="font-serif text-[88px] leading-[0.85] tracking-[-0.04em] text-[var(--ink)] md:text-[104px]">
                    {offer.price}
                  </span>
                  <span className="mt-1 font-serif text-3xl text-[var(--gold-ink)]">{offer.currency}</span>
                </div>
                <p className="mt-5 font-sans text-[15px] text-[var(--text-secondary)]">
                  Tout inclus. Aucun frais caché, aucun abonnement.
                </p>
                <div className="mt-8 flex items-start gap-3 rounded-2xl bg-[var(--paper)] p-4 shadow-[inset_0_0_0_1px_var(--hairline)]">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold-ink)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                  </svg>
                  <p className="font-sans text-sm leading-relaxed text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--ink)]">Un cadeau idéal</span> pour vos parents et grands-parents.
                  </p>
                </div>
              </div>

              <div>
                <Button href="/order" variant="primary" size="lg" fullWidth>
                  Commander ma biographie
                </Button>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-sans text-[13px] text-[var(--text-muted)]">
                  <span className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-[var(--gold-ink)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                    </svg>
                    Paiement sécurisé par Stripe
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-[var(--gold-ink)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.59 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.332 0C5.26 16.564 2 12.163 2 7c0-.538.035-1.069.104-1.589a.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.75Zm4.196 5.954a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                    Satisfait ou remboursé
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- TÉMOIGNAGE --- */}
      <section className="w-full py-24 md:py-32">
        <figure className="reveal mx-auto max-w-4xl px-5 text-center sm:px-6">
          <svg className="mx-auto h-8 w-8 text-[var(--loomina-gold)]" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
            <path d="M13.5 8C8.3 9.6 5 13.7 5 19.2 5 22.6 7.1 25 10 25c2.6 0 4.5-1.9 4.5-4.4 0-2.4-1.7-4.2-4.1-4.3.4-2.9 2.6-5.3 5.2-6.4L13.5 8Zm13 0C21.3 9.6 18 13.7 18 19.2c0 3.4 2.1 5.8 5 5.8 2.6 0 4.5-1.9 4.5-4.4 0-2.4-1.7-4.2-4.1-4.3.4-2.9 2.6-5.3 5.2-6.4L26.5 8Z" />
          </svg>
          <blockquote className="mt-8 font-serif text-[clamp(1.6rem,3.4vw,2.5rem)] leading-[1.3] tracking-[-0.02em] text-[var(--ink)]">
            Le plus beau cadeau que j’ai pu faire à ma mère. Elle a adoré raconter sa vie, et maintenant nous avons{" "}
            <em className="text-[var(--gold-ink)]">un trésor familial pour toujours.</em>
          </blockquote>
          <figcaption className="mt-10 flex items-center justify-center gap-3 font-sans">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--ink)] font-serif text-lg text-[var(--loomina-gold-light)]">
              S
            </span>
            <span className="text-left">
              <span className="block text-[15px] font-semibold text-[var(--ink)]">Sophie M.</span>
              <span className="block text-sm text-[var(--text-muted)]">Pour sa mère, 72 ans</span>
            </span>
          </figcaption>
        </figure>
      </section>

      {/* --- APPEL FINAL --- */}
      <section className="w-full px-5 pb-24 sm:px-6 md:pb-32">
        <div className="paper-grain reveal relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-[var(--ink)] px-7 py-16 text-center sm:px-12 md:py-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(212,176,106,0.22),transparent_70%)]"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl font-serif text-[clamp(2.1rem,4.5vw,3.75rem)] leading-[1.05] tracking-[-0.03em] text-[var(--loomina-void)]">
              Une vie entière, <em className="text-[var(--loomina-gold-light)]">racontée de vive voix.</em>
            </h2>
            <p className="mx-auto mt-5 max-w-xl font-sans text-[17px] leading-relaxed text-[#cfc8bb]">
              Commencez aujourd’hui : le premier appel suffit pour que l’histoire prenne forme.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                href="/order"
                variant="primary"
                size="lg"
                className="w-full !bg-[var(--loomina-void)] !text-[var(--ink)] hover:!bg-white sm:w-auto"
              >
                Commander mon livre
              </Button>
              <Button
                href="/experience"
                variant="ghost"
                size="lg"
                className="w-full !text-[#e9e3d8] hover:!bg-white/10 hover:!text-white sm:w-auto"
              >
                Découvrir l’expérience
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
