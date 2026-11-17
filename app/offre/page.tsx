import Link from "next/link";
import Image from "next/image";
import { Section, SectionHead } from "@/components/ui/Section";
import { SITE } from "@/config/site";
import Accordion from "@/components/ui/Accordion";
import Icon, { type IconName } from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import WhatYouGet from "@/components/home/WhatYouGet";
import Compare from "@/components/home/Compare";
import Closing from "@/components/Closing";
import { OFFER, GUARANTEE } from "@/config/offer";

const DETAILS: { icon: IconName; title: string; items: string[] }[] = [
  {
    icon: "phone",
    title: "Les appels",
    items: [
      "Autant d’appels qu’il vous faut, avec ou sans rendez-vous",
      `${OFFER.chapters} thèmes proposés pour vous guider`,
      "Depuis un fixe ou un portable, au prix d’un appel normal",
    ],
  },
  {
    icon: "pen",
    title: "L’écriture",
    items: [
      "Le récit de chaque appel, écrit dans vos mots",
      "Vos corrections, autant que nécessaire",
      "Votre livre relu par notre équipe avant l’impression",
    ],
  },
  {
    icon: "book",
    title: "Le livre",
    items: [
      `Relié, ${OFFER.format}`,
      "Vos photos placées dans le texte",
      `Version numérique (${OFFER.digital}) pour la famille`,
      OFFER.delivery,
    ],
  },
];

const FAQ = [
  {
    q: "Combien de temps ça prend ?",
    a: `En général ${OFFER.delay} entre le premier appel et le livre validé, à votre rythme : certains avancent vite, d’autres prennent leur temps. Ensuite, ${OFFER.printDelay} pour l’impression et l’acheminement.`,
  },
  {
    q: "Puis-je modifier le texte ?",
    a: "Oui, autant de fois que vous le souhaitez. Vous relisez le récit de chaque appel dans votre espace auteur et vous dites à Loomina, au prochain appel, ce qu’il faut changer.",
  },
  {
    q: "Puis-je l’offrir ?",
    a: "Oui. À la commande, choisissez « C’est pour offrir » et indiquez le prénom et le numéro de la personne qui racontera. C’est elle qui appellera Loomina, depuis ce numéro, quand elle le souhaite.",
  },
  {
    q: "Y a-t-il une garantie ?",
    a: `Oui. ${GUARANTEE} Vous disposez aussi du droit de rétractation légal de ${OFFER.withdrawalDays} jours.`,
  },
];

export default function OffrePage() {
  return (
    <>
      {/* Haut de page : une grande carte sombre. Le titre et le prix à gauche, les livres à droite. */}
      <section className="flex min-h-[100svh] w-full flex-col pb-4 pt-[84px] md:pb-8 md:pt-28">
        <div className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col px-4 sm:px-6">
          <div className="rise grid flex-1 grid-cols-1 content-center overflow-hidden rounded-[28px] bg-[var(--ink)] text-white md:rounded-[32px] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
            <div className="flex min-w-0 flex-col justify-center p-5 pb-4 sm:p-9 lg:px-12 lg:py-10">
              <p className="text-[14px] font-bold text-[var(--amber)]">Le livre et le prix</p>
              <h1 className="t-display mt-2 text-balance text-white">
                Votre livre, tout compris
              </h1>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-[#cfcfc8] md:mt-5 md:text-[17px]">
                Les entretiens, l’écriture, la relecture, la mise en page, l’impression et la livraison. Pas d’abonnement, rien à payer en plus.
              </p>
              <div className="mt-5 flex items-end gap-4 md:mt-7">
                <p className="text-[48px] font-extrabold leading-[0.85] tracking-[-0.05em] text-[var(--amber)] md:text-[68px]">
                  {OFFER.price}
                  <span className="ml-1 align-top text-[0.42em] tracking-normal">{OFFER.currencySymbol}</span>
                </p>
                <p className="max-w-[13rem] text-[14px] leading-snug text-[#cfcfc8]">Paiement unique. {OFFER.delivery}.</p>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 md:mt-7">
                <Button href="/order" variant="accent">
                  Commander
                </Button>
                <Button href={`tel:${SITE.phone}`} variant="ghost" className="!px-0 !text-white !decoration-white/40 hover:!decoration-white">
                  Essayer d’abord gratuitement
                </Button>
              </div>
              <p className="mt-4 flex items-center gap-3 text-[15px] text-white md:mt-6">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--amber)] text-[var(--ink)]">
                  <Icon name="check" size={14} />
                </span>
                <span>
                  Satisfait ou remboursé sous {OFFER.guaranteeDays} jours.{" "}
                  <Link href="/cgv#garantie" className="underline decoration-white/40 underline-offset-4 hover:decoration-white">
                    Conditions
                  </Link>
                </span>
              </p>
            </div>
            <div className="min-w-0 self-center p-3 pt-0 sm:p-5 sm:pt-0 lg:p-6 lg:pl-0">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] lg:aspect-[4/3]">
                <Image
                  src="/photos/collection-de-livres.jpg"
                  alt="Quatre livres Loomina reliés, aux couvertures en toile beige, bleue, verte et bordeaux."
                  fill
                  priority
                  sizes="(min-width: 1024px) 640px, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <WhatYouGet
        showDetailLink={false}
        photo="mains"
        title="Ce que comprend la formule"
        features={[
          { icon: "phone", title: "Autant d’appels qu’il vous faut", text: "Les entretiens par téléphone, quand vous voulez." },
          { icon: "pen", title: "Le récit de chaque appel", text: "Écrit dans vos mots, à relire et corriger." },
          { icon: "check", title: "Relu par notre équipe", text: "Votre livre est relu, et vos photos placées, avant l’impression." },
          { icon: "book", title: "Le livre relié, livré chez vous", text: `${OFFER.format}, avec sa version ${OFFER.digital}.` },
        ]}
      />

      <Section id="detail">
        <SectionHead title="Ce que couvre le prix, en détail" />
        <div className="head-gap grid gap-4 md:grid-cols-3">
          {DETAILS.map((g) => (
            <div key={g.title} className="card p-7 md:p-8">
              <span className="chip-icon">
                <Icon name={g.icon} />
              </span>
              <h3 className="t-heading mt-6">{g.title}</h3>
              <ul className="mt-4 space-y-3">
                {g.items.map((it) => (
                  <li key={it} className="t-body flex gap-3">
                    <Icon name="check" size={20} className="mt-[3px] shrink-0 text-[var(--amber-ink)]" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Compare />

      <Section>
        <ul className="grid gap-4 md:grid-cols-3">
          <li className="card p-7">
            <span className="chip-icon">
              <Icon name="shield" />
            </span>
            <h3 className="t-heading mt-5">Votre récit vous appartient</h3>
            <p className="t-body mt-2">Vous gardez tous les droits sur votre histoire. Vos récits restent privés, et vous pouvez les faire supprimer à tout moment.</p>
          </li>
          <li className="card p-7">
            <span className="chip-icon">
              <Icon name="book" />
            </span>
            <h3 className="t-heading mt-5">D’autres exemplaires</h3>
            <p className="t-body mt-2">Pour la famille, écrivez-nous après réception : un devis d’impression, sans marge sur le texte.</p>
          </li>
          <li className="card p-7">
            <span className="chip-icon">
              <Icon name="check" />
            </span>
            <h3 className="t-heading mt-5">Des conditions claires</h3>
            <p className="t-body mt-2">
              Tout est écrit dans nos{" "}
              <Link href="/cgv" className="link">
                conditions générales de vente
              </Link>
              .
            </p>
          </li>
        </ul>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <SectionHead
            title="Avant de commander"
            text={
              <>
                Les autres réponses sont dans les{" "}
                <Link href="/faq" className="link">
                  questions fréquentes
                </Link>
                .
              </>
            }
          />
          <Accordion items={FAQ} />
        </div>
      </Section>

      <Closing title="Pas encore sûr ? Essayez trois minutes" />
    </>
  );
}
