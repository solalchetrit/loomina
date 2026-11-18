import Link from "next/link";
import Hero from "@/components/Hero";
import Facts from "@/components/home/Facts";
import Audiences from "@/components/home/Audiences";
import WhatYouGet from "@/components/home/WhatYouGet";
import ThemePicker from "@/components/home/ThemePicker";
import Compare from "@/components/home/Compare";
import HowItWorks from "@/components/HowItWorks";
import AuthorShowcase from "@/components/AuthorShowcase";
import VoiceToPage from "@/components/VoiceToPage";
import OfferCard from "@/components/OfferCard";
import Closing from "@/components/Closing";
import Accordion from "@/components/ui/Accordion";
import { Section, SectionHead } from "@/components/ui/Section";
import { GUARANTEE, OFFER } from "@/config/offer";
import Photo from "@/components/ui/Photo";

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
    a: "Loomina mène les entretiens et écrit le récit de chaque appel, sans rien inventer, dans le style que vous avez choisi, puis compose le livre. Vous relisez et corrigez dans votre espace auteur, puis notre équipe relit votre livre avant l’impression.",
  },
  {
    q: "Je veux l’offrir. Comment ça se passe ?",
    a: "À la commande, indiquez le prénom et le numéro de la personne qui racontera. C’est elle qui appellera Loomina, depuis ce numéro, quand elle le souhaite.",
  },
  {
    q: "Combien de temps faut-il pour avoir le livre ?",
    a: `En général ${OFFER.delay} entre le premier appel et le livre validé, à votre rythme. Comptez ensuite ${OFFER.printDelay} pour l’impression et l’acheminement.`,
  },
  { q: "Et si ça ne me plaît pas ?", a: GUARANTEE },
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* Une respiration sous le haut de page : ce que le livre fait vivre en famille. */}
      <div className="section-b mx-auto w-full max-w-[1240px] px-5 sm:px-6" data-reveal>
        <Photo
          name="famille-album"
          alt="Trois générations d’une même famille regardent ensemble un album de photos."
          ratio="aspect-[3/2] sm:aspect-[3/1]"
          focus="50% 22%"
          sizes="(min-width: 1240px) 1200px, 100vw"
        />
      </div>

      <Facts />
      <HowItWorks />
      <AuthorShowcase className="bg-white" />
      <Audiences />
      <VoiceToPage />
      <ThemePicker />
      <WhatYouGet />

      <Section id="offre">
        <SectionHead title="Un prix, tout compris" text="Les entretiens, l’écriture, la relecture, la mise en page, l’impression et la livraison. Rien à payer en plus." />
        <div className="head-gap">
          <OfferCard />
        </div>
      </Section>

      <Compare />

      {/* Le mot du fondateur, à la place d'avis clients que nous n'avons pas encore. */}
      <Section>
        <figure className="card mx-auto grid max-w-5xl items-center gap-8 p-5 md:grid-cols-[1fr_1.5fr] md:gap-12 md:p-6">
          <Photo
            name="album-photo"
            alt="Un album de famille ouvert sur de vieilles photos en noir et blanc."
            ratio="aspect-[4/3] md:aspect-[4/5]"
            sizes="(min-width: 768px) 380px, 100vw"
          />
          <div className="px-3 pb-4 md:px-0 md:py-6 md:pr-8">
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
          </div>
        </figure>
      </Section>

      <Section id="questions">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div>
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
          <Photo
            name="petit-dejeuner"
            alt="Une grand-mère et sa petite-fille discutent en souriant au petit-déjeuner."
            ratio="aspect-[4/3]"
            focus="50% 40%"
            sizes="(min-width: 1024px) 440px, 100vw"
            className="head-gap hidden lg:block"
          />
          </div>
          <Accordion items={QUESTIONS} />
        </div>
      </Section>

      <Closing />
    </>
  );
}
