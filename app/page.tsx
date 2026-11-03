import Link from "next/link";
import Hero from "@/components/Hero";
import Facts from "@/components/home/Facts";
import Audiences from "@/components/home/Audiences";
import WhatYouGet from "@/components/home/WhatYouGet";
import Themes from "@/components/home/Themes";
import Compare from "@/components/home/Compare";
import HowItWorks from "@/components/HowItWorks";
import VoiceToPage from "@/components/VoiceToPage";
import OfferCard from "@/components/OfferCard";
import Closing from "@/components/Closing";
import Accordion from "@/components/ui/Accordion";
import { Section, SectionHead } from "@/components/ui/Section";
import { GUARANTEE } from "@/config/offer";

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
  { q: "Et si ça ne me plaît pas ?", a: GUARANTEE },
];

export default function Home() {
  return (
    <>
      <Hero />
      <Facts />
      <HowItWorks />
      <VoiceToPage />
      <Audiences />
      <WhatYouGet />
      <Themes />
      <Compare />

      <Section id="offre">
        <SectionHead title="Un prix, tout compris" text="Les entretiens, l’écriture, la relecture, la mise en page, l’impression et la livraison. Rien à payer en plus." />
        <div className="mt-10">
          <OfferCard />
        </div>
      </Section>

      {/* Le mot du fondateur, à la place d'avis clients que nous n'avons pas encore. */}
      <Section size="sm">
        <figure className="card mx-auto max-w-4xl p-8 md:p-12">
          <blockquote className="text-[clamp(1.3rem,2.4vw,1.75rem)] font-semibold leading-[1.45] tracking-[-0.015em] text-[var(--ink)]">
            « Ma grand-mère avait une vie passionnante, que je ne connaissais qu’en partie. Écrire lui demandait trop, alors nous l’avons
            laissée parler. Son livre est aujourd’hui dans notre salon, et c’est pour que d’autres familles aient le leur que Loomina
            existe. »
          </blockquote>
          <figcaption className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[16px]">
            <span>
              <b>Solal Chetrit</b>, fondateur
            </span>
            <Link href="/about" className="link">
              Notre histoire
            </Link>
          </figcaption>
        </figure>
      </Section>

      <Section id="questions">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <SectionHead
            title="Vos questions"
            text={
              <>
                Les autres réponses sont dans les{" "}
                <Link href="/faq" className="link">
                  questions fréquentes
                </Link>
                , ou{" "}
                <Link href="/contact" className="link">
                  écrivez-nous
                </Link>
                .
              </>
            }
          />
          <Accordion items={QUESTIONS} />
        </div>
      </Section>

      <Closing />
    </>
  );
}
