import Link from "next/link";
import { Section, SectionHead, PageHeader } from "@/components/ui/Section";
import Accordion from "@/components/ui/Accordion";
import Icon, { type IconName } from "@/components/ui/Icon";
import OfferCard from "@/components/OfferCard";
import WhatYouGet from "@/components/home/WhatYouGet";
import Compare from "@/components/home/Compare";
import Closing from "@/components/Closing";
import { OFFER, GUARANTEE } from "@/config/offer";

const DETAILS: { icon: IconName; title: string; items: string[] }[] = [
  {
    icon: "phone",
    title: "Les appels",
    items: [
      "Autant d’appels qu’il vous faut, sans rendez-vous",
      `${OFFER.chapters} thèmes proposés pour vous guider`,
      "Depuis un fixe ou un portable, au prix d’un appel normal",
    ],
  },
  {
    icon: "pen",
    title: "L’écriture",
    items: [
      "Un chapitre écrit après chaque appel, dans vos mots",
      "Vos corrections, autant que nécessaire",
      "Chaque page relue par une personne de l’équipe avant l’impression",
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
    a: "Oui, autant de fois que vous le souhaitez. Vous relisez chaque chapitre dans votre espace auteur et vous dites à Loomina, au prochain appel, ce qu’il faut changer.",
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
      <PageHeader
        title="Un prix, tout compris"
        text="Les entretiens, l’écriture, la relecture, la mise en page, l’impression et la livraison. Pas d’abonnement, rien à payer en plus."
      >
        <div className="mt-12">
          <OfferCard showDetailLink={false} />
        </div>
      </PageHeader>

      <WhatYouGet showDetailLink={false} />

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
            <p className="t-body mt-2">Pas d’option payante, pas d’abonnement. Vous conservez l’intégralité des droits sur votre histoire.</p>
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
