import Link from "next/link";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import VoiceToPage from "@/components/VoiceToPage";
import Accordion from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import { LOOMINA_CONFIG } from "@/config/loomina";
import { OFFER, INCLUDED, GUARANTEE } from "@/config/offer";

const QUESTIONS = [
  {
    q: "Faut-il savoir se servir d’un ordinateur ?",
    a: "Non. Tout se passe au téléphone, fixe ou portable. Si vous voulez ajouter des photos, un e-mail suffit, ou un proche peut le faire pour vous.",
  },
  {
    q: "Et si je ne sais pas quoi raconter ?",
    a: "C’est Loomina qui pose les questions, une à la fois, et qui laisse le temps de réfléchir. Les souvenirs reviennent en parlant. Vous pouvez passer un sujet ou y revenir plus tard.",
  },
  {
    q: "Est-ce que c’est une machine qui écrit mon livre ?",
    a: "Loomina, une intelligence artificielle, mène les entretiens et écrit le premier jet de chaque chapitre, sans rien inventer. Vous relisez, vous corrigez, puis notre équipe relit chaque page avant l’impression.",
  },
  {
    q: "Je veux l’offrir. Comment ça se passe ?",
    a: "À la commande, indiquez le prénom et le numéro de la personne qui racontera. C’est elle qui appellera Loomina, depuis ce numéro, quand elle le souhaite.",
  },
  {
    q: "Et si ça ne me plaît pas ?",
    a: GUARANTEE,
  },
];

const link = "text-[var(--ink)] underline decoration-[var(--loomina-gold)]/50 underline-offset-4 hover:decoration-[var(--loomina-gold)]";

export default function Home() {
  return (
    <div className="relative flex w-full flex-col items-center text-[var(--text-primary)]">
      <Hero />

      <HowItWorks />

      <VoiceToPage />

      {/* --- OFFRE --- */}
      <section id="offre" className="w-full scroll-mt-24 py-24 md:py-32">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div className="reveal">
            <h2 className="font-serif text-[clamp(2.1rem,4vw,3.25rem)] leading-[1.08] tracking-[-0.02em] text-[var(--ink)]">
              Un prix, tout compris
            </h2>
            <p className="mt-5 max-w-md font-sans text-[17px] leading-relaxed text-[var(--text-secondary)]">
              Les entretiens, l’écriture, la relecture, la mise en page, l’impression et la livraison. Pas d’abonnement,
              rien à payer en plus.
            </p>
            <div className="mt-10 flex items-baseline gap-2">
              <span className="font-serif text-[88px] leading-[0.85] tracking-[-0.03em] text-[var(--ink)] md:text-[104px]">
                {OFFER.price}
              </span>
              <span className="font-serif text-4xl text-[var(--ink)]">{OFFER.currencySymbol}</span>
            </div>
            <p className="mt-3 font-sans text-[15px] text-[var(--text-muted)]">Paiement unique et sécurisé par Stripe.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/order" variant="primary" size="lg" className="w-full sm:w-auto">
                Commander
              </Button>
              <Button href="/offre" variant="secondary" size="lg" className="w-full sm:w-auto">
                Tout le détail
              </Button>
            </div>
          </div>

          <div className="reveal">
            <ul className="border-t border-[var(--ink)]/80">
              {INCLUDED.map((item) => (
                <li key={item.title} className="flex items-start gap-4 border-b border-[var(--hairline-strong)] py-5">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-[var(--gold-ink)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.57a1 1 0 0 1-1.42 0l-3.5-3.53a1 1 0 1 1 1.42-1.408l2.79 2.814 6.79-6.853a1 1 0 0 1 1.414-.006Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-sans text-[17px] leading-snug">
                    <span className="block font-semibold text-[var(--ink)]">{item.title}</span>
                    <span className="mt-1 block text-[var(--text-secondary)]">{item.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-2xl bg-[var(--loomina-night)] px-5 py-4 font-sans text-[15px] leading-relaxed text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--ink)]">Satisfait ou remboursé. </span>
              {GUARANTEE}
            </p>
          </div>
        </div>
      </section>

      {/* --- POURQUOI LOOMINA : le mot du fondateur, à la place d'avis clients que nous n'avons pas encore --- */}
      <section className="w-full bg-[var(--loomina-night)] py-24 md:py-32">
        <figure className="reveal mx-auto max-w-3xl px-5 sm:px-6">
          <blockquote className="font-serif text-[clamp(1.5rem,3vw,2.15rem)] leading-[1.4] tracking-[-0.01em] text-[var(--ink)]">
            « Ma grand-mère avait une vie passionnante, que je ne connaissais qu’en partie. Nous voulions qu’elle l’écrive,
            mais écrire lui demandait trop. Alors nous l’avons laissée parler. Son livre est aujourd’hui dans notre salon,
            et c’est pour que d’autres familles aient le leur que Loomina existe. »
          </blockquote>
          <figcaption className="mt-8 font-sans text-[15px] text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--ink)]">Solal Chetrit</span>, fondateur de Loomina ·{" "}
            <Link href="/about" className={link}>
              Notre histoire
            </Link>
          </figcaption>
        </figure>
      </section>

      {/* --- QUESTIONS --- */}
      <section id="questions" className="w-full scroll-mt-24 py-24 md:py-32">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <div className="reveal">
            <h2 className="font-serif text-[clamp(2.1rem,4vw,3.25rem)] leading-[1.08] tracking-[-0.02em] text-[var(--ink)]">
              Vos questions
            </h2>
            <p className="mt-5 font-sans text-[17px] leading-relaxed text-[var(--text-secondary)]">
              Les autres réponses sont dans la{" "}
              <Link href="/faq" className={link}>
                FAQ
              </Link>
              , ou écrivez-nous à{" "}
              <a href="mailto:contact@loomina.eu" className={link}>
                contact@loomina.eu
              </a>
              .
            </p>
          </div>
          <Accordion items={QUESTIONS} className="reveal" />
        </div>
      </section>

      {/* --- APPEL FINAL --- */}
      <section className="w-full px-5 pb-24 sm:px-6 md:pb-32">
        <div className="reveal mx-auto max-w-7xl rounded-[28px] bg-[var(--ink)] px-7 py-16 text-center sm:px-12 md:py-20">
          <h2 className="mx-auto max-w-3xl font-serif text-[clamp(2rem,4.2vw,3.25rem)] leading-[1.1] tracking-[-0.02em] text-[var(--loomina-void)]">
            Le plus simple, c’est d’essayer.
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-sans text-[17px] leading-relaxed text-[#d6cfc2]">
            Appelez Loomina trois minutes et racontez-lui un souvenir. Vous saurez tout de suite si c’est pour vous.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              href={`tel:${LOOMINA_CONFIG.PHONE_NUMBER}`}
              variant="primary"
              size="lg"
              className="w-full !bg-[var(--loomina-void)] !text-[var(--ink)] hover:!bg-white sm:w-auto"
            >
              Appeler le {LOOMINA_CONFIG.PHONE_NUMBER_DISPLAY}
            </Button>
            <Button
              href="/order"
              variant="ghost"
              size="lg"
              className="w-full !text-[#efe9df] hover:!bg-white/10 hover:!text-white sm:w-auto"
            >
              Commander · {OFFER.price} €
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
