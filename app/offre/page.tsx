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
import { OFFER, INCLUDED, GUARANTEE } from "@/config/offer";

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
      {/* Haut de page : une grande carte sombre, le prix à gauche, les livres à droite. */}
      <section className="w-full pb-10 pt-28 md:pb-14 md:pt-32">
        <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-6">
          <div className="rise grid grid-cols-1 overflow-hidden rounded-[32px] bg-[var(--ink)] text-white lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="flex min-w-0 flex-col justify-center p-7 sm:p-10 lg:p-12">
              <h1 className="text-balance text-[clamp(2.3rem,4vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-white">
                Un prix, tout compris
              </h1>
              <p className="mt-5 max-w-md text-[18px] leading-relaxed text-[#cfcfc8]">
                Les entretiens, l’écriture, la relecture, la mise en page, l’impression et la livraison. Pas d’abonnement, rien à payer en plus.
              </p>
              <p className="mt-8 text-[76px] font-extrabold leading-[0.85] tracking-[-0.05em] text-[var(--amber)] md:text-[92px]">
                {OFFER.price}
                <span className="ml-1 align-top text-[0.42em] tracking-normal">{OFFER.currencySymbol}</span>
              </p>
              <p className="mt-4 text-[16px] text-[#cfcfc8]">Paiement unique. {OFFER.delivery}.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button href="/order" variant="accent" size="lg">
                  Commander
                </Button>
                <Button href={`tel:${SITE.phone}`} variant="ghost" className="!text-white !decoration-white/40 hover:!decoration-white">
                  Essayer d’abord gratuitement
                </Button>
              </div>
              <p className="mt-8 flex items-center gap-3 text-[16px] text-white">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--amber)] text-[var(--ink)]">
                  <Icon name="check" size={16} />
                </span>
                <span>
                  Satisfait ou remboursé sous {OFFER.guaranteeDays} jours.{" "}
                  <Link href="/cgv#garantie" className="underline decoration-white/40 underline-offset-4 hover:decoration-white">
                    Conditions
                  </Link>
                </span>
              </p>
            </div>
            <div className="min-w-0 self-center p-4 pt-0 sm:p-5 sm:pt-0 lg:p-6 lg:pl-0">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[22px]">
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

        <div className="card mt-4 p-6 md:p-9" data-reveal>
          <p className="text-[16px] font-bold">Ce qui est compris</p>
          <ul className="mt-5 grid gap-x-10 gap-y-5 md:grid-cols-2">
            {INCLUDED.map((it) => (
              <li key={it.title} className="flex gap-3 text-[16px] leading-snug">
                <Icon name="check" size={20} className="mt-0.5 shrink-0 text-[var(--amber-ink)]" />
                <span>
                  <b>{it.title}</b>, {it.detail}
                </span>
              </li>
            ))}
            <li className="flex gap-3 text-[16px] leading-snug">
              <Icon name="gift" size={20} className="mt-0.5 shrink-0 text-[var(--amber-ink)]" />
              <span>
                <b>Pour l’offrir</b>, votre proche reçoit le numéro et appelle quand il le souhaite
              </span>
            </li>
          </ul>
        </div>
        </div>
      </section>

      <WhatYouGet showDetailLink={false} photo="mains" />

      <Section>
        <SectionHead title="Ce que couvre le prix, en détail" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
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

      <Section size="sm">
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
