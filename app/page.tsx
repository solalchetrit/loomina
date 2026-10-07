import Link from "next/link";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import VoiceToPage from "@/components/VoiceToPage";
import Closing from "@/components/Closing";
import Accordion from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import { RuledList } from "@/components/ui/Section";
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
    q: "Est-ce qu’une machine écrit mon livre ?",
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

export default function Home() {
  return (
    <div className="relative flex w-full flex-col items-center">
      <Hero />
      <HowItWorks />
      <VoiceToPage />

      {/* --- LE PRIX --- */}
      <section id="offre" className="w-full scroll-mt-24 py-20 md:py-28">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div>
            <p className="t-eyebrow">Le prix</p>
            <h2 className="t-title mt-4">Un prix, tout compris.</h2>
            <span aria-hidden="true" className="gold-dash mt-6" />
            <p className="t-lead mt-6 max-w-md">
              Les entretiens, l’écriture, la relecture, la mise en page, l’impression et la livraison. Pas d’abonnement, rien à
              payer en plus.
            </p>
            <p className="mt-10 font-serif text-[88px] leading-[0.85] tracking-[-0.03em] text-[var(--ink)] md:text-[104px]">
              {OFFER.price}
              <span className="ml-1 text-[0.45em] align-top">{OFFER.currencySymbol}</span>
            </p>
            <p className="t-small mt-4">Paiement unique et sécurisé par Stripe.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/order" variant="primary" size="lg" className="w-full sm:w-auto">
                Commander
              </Button>
              <Button href="/offre" variant="secondary" size="lg" className="w-full sm:w-auto">
                Tout le détail
              </Button>
            </div>
          </div>

          <div>
            <RuledList items={INCLUDED} />
            <p className="t-body mt-6">
              <span className="font-semibold text-[var(--ink)]">Satisfait ou remboursé. </span>
              {GUARANTEE}
            </p>
          </div>
        </div>
      </section>

      {/* --- LE MOT DU FONDATEUR, à la place d'avis clients que nous n'avons pas encore --- */}
      <section className="w-full bg-[var(--paper-deep)] py-20 md:py-28">
        <figure className="mx-auto max-w-3xl px-5 sm:px-8">
          <blockquote className="font-serif text-[clamp(1.5rem,3vw,2.15rem)] leading-[1.4] tracking-[-0.01em] text-[var(--ink)]">
            « Ma grand-mère avait une vie passionnante, que je ne connaissais qu’en partie. Nous voulions qu’elle l’écrive, mais
            écrire lui demandait trop. Alors nous l’avons laissée parler. Son livre est aujourd’hui dans notre salon, et c’est
            pour que d’autres familles aient le leur que Loomina existe. »
          </blockquote>
          <figcaption className="t-body mt-8">
            <span className="font-semibold text-[var(--ink)]">Solal Chetrit</span>, fondateur de Loomina ·{" "}
            <Link href="/about" className="link">
              Notre histoire
            </Link>
          </figcaption>
        </figure>
      </section>

      {/* --- QUESTIONS --- */}
      <section id="questions" className="w-full scroll-mt-24 py-20 md:py-28">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.7fr] lg:gap-20">
          <div>
            <p className="t-eyebrow">Avant de commencer</p>
            <h2 className="t-title mt-4">Vos questions.</h2>
            <span aria-hidden="true" className="gold-dash mt-6" />
            <p className="t-lead mt-6 max-w-sm">
              Les autres réponses sont dans les{" "}
              <Link href="/faq" className="link">
                questions fréquentes
              </Link>
              , ou{" "}
              <Link href="/contact" className="link">
                écrivez-nous
              </Link>
              .
            </p>
          </div>
          <Accordion items={QUESTIONS} />
        </div>
      </section>

      <Closing />
    </div>
  );
}
