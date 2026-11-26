import Link from "next/link";
import Image from "next/image";
import { blurOf } from "@/lib/photo-blur";
import { Section, SectionHead } from "@/components/ui/Section";
import { SITE } from "@/config/site";
import Accordion from "@/components/ui/Accordion";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import WhatYouGet from "@/components/home/WhatYouGet";
import Compare from "@/components/home/Compare";
import Closing from "@/components/Closing";
import { OFFER, GUARANTEE, SHOW_PRICE, LAUNCH, OFFER_PAGE_LABEL } from "@/config/offer";
import { LaunchPrice } from "@/components/LaunchOffer";

const FAQ = [
  {
    q: "Combien de temps ça prend ?",
    a: `En général ${OFFER.delay} entre le premier appel et le livre validé, à votre rythme : certains avancent vite, d’autres prennent leur temps. Ensuite, ${OFFER.printDelay} pour l’impression et l’acheminement.`,
  },
  {
    q: "Puis-je modifier le texte ?",
    a: "Oui, autant de fois que vous le souhaitez. Vous relisez le récit de chaque appel dans votre espace auteur : vous corrigez un passage vous-même, ou vous dites à Loomina, au prochain appel, ce qu’il faut changer.",
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
      {/* Haut de page : une grande carte sombre. Le titre et le prix (ou la date d'ouverture) à gauche, les livres à droite. */}
      <section className="flex min-h-[100svh] w-full flex-col pb-4 pt-[84px] md:pb-8 md:pt-28">
        <div className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col px-4 sm:px-6">
          <div className="rise grid flex-1 grid-cols-1 content-center overflow-hidden rounded-[var(--radius-card)] bg-[var(--ink)] text-white md:rounded-[var(--radius-card)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
            <div className="flex min-w-0 flex-col justify-center p-5 pb-4 sm:p-9 lg:px-12 lg:py-10">
              <p className="text-[14px] font-bold text-[var(--amber)]">{OFFER_PAGE_LABEL}</p>
              <h1 className="t-display mt-2 text-balance text-white">
                Votre livre, tout compris
              </h1>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-[#cfcfc8] md:mt-5 md:text-[17px]">
                Les entretiens, l’écriture, la relecture, la mise en page, l’impression et la livraison. Pas d’abonnement, rien à payer en plus.
              </p>
              <div className="mt-5 flex flex-wrap items-end gap-x-4 gap-y-3 md:mt-7">
                {SHOW_PRICE ? (
                  <LaunchPrice tone="dark" priceClassName="text-[48px] font-extrabold leading-[0.85] tracking-[-0.05em] text-[var(--amber)] md:text-[68px]" />
                ) : (
                  <p className="whitespace-nowrap text-[34px] font-extrabold leading-[0.95] tracking-[-0.04em] text-[var(--amber)] md:text-[46px]">
                    {LAUNCH.label.replace(/^\S+ /, "")}
                  </p>
                )}
                <p className="max-w-[13rem] text-[14px] leading-snug text-[#cfcfc8]">
                  {SHOW_PRICE ? "Paiement unique." : "Ouverture des commandes."} {OFFER.delivery}.
                </p>
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
                  alt="Quatre livres Loomina, aux couvertures en toile beige, bleue, verte et bordeaux."
                  fill
                  priority
                  sizes="(min-width: 1024px) 640px, 100vw"
                  className="object-cover"
                  {...blurOf("collection-de-livres")}
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
          { icon: "book", title: "Le livre imprimé, livré chez vous", text: `${OFFER.format}, avec sa version ${OFFER.digital}.` },
        ]}
      />

      <Compare />

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

      <Closing title={`Pas encore sûr ? Essayez ${OFFER.demoMinutes} minutes`} />
    </>
  );
}
