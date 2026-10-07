import Link from "next/link";
import { Section, SectionHead, PageHeader, RuledList } from "@/components/ui/Section";
import Accordion from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import Closing from "@/components/Closing";
import { OFFER, INCLUDED, GUARANTEE } from "@/config/offer";

const DETAILS = [
  {
    title: "Les appels",
    items: [
      "Autant d’appels qu’il vous faut, sans rendez-vous",
      `${OFFER.chapters} thèmes proposés pour vous guider`,
      "Depuis un fixe ou un portable, au prix d’un appel normal",
    ],
  },
  {
    title: "L’écriture",
    items: [
      "Un chapitre écrit après chaque appel, dans vos mots",
      "Vos corrections, autant que nécessaire",
      "Chaque page relue par une personne de l’équipe avant l’impression",
    ],
  },
  {
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
    <main className="w-full">
      <PageHeader
        eyebrow="Le livre et le prix"
        title="Un prix, tout compris."
        text="Les entretiens, l’écriture, la relecture, la mise en page, l’impression et la livraison. Pas d’abonnement, rien à payer en plus."
      >
        <div className="rise mt-12 grid gap-10 border-y border-[var(--ink)] py-10 lg:grid-cols-[1fr_1.2fr] lg:gap-20" style={{ "--i": 2 } as React.CSSProperties}>
          <div>
            <h2 className="t-heading">{OFFER.name}</h2>
            <p className="mt-6 font-serif text-[96px] leading-[0.85] tracking-[-0.035em] text-[var(--ink)] md:text-[120px]">
              {OFFER.price}
              <span className="ml-1 align-top text-[0.42em]">{OFFER.currencySymbol}</span>
            </p>
            <p className="t-small mt-5">Paiement unique par carte, sécurisé par Stripe.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/order" variant="primary" size="lg" className="w-full sm:w-auto">
                Commander
              </Button>
            </div>
            <p className="t-small mt-5 max-w-sm">{GUARANTEE}</p>
          </div>
          <div>
            <p className="t-eyebrow">Ce qui est inclus</p>
            <RuledList className="mt-4" items={INCLUDED} />
          </div>
        </div>
      </PageHeader>

      <Section>
        <SectionHead eyebrow="En détail" title="Ce que couvre le prix." />
        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {DETAILS.map((g, i) => (
            <div key={g.title} className="rule-top pt-5">
              <span className="t-numeral text-[18px]">0{i + 1}</span>
              <h3 className="t-heading mt-2">{g.title}</h3>
              <ul className="mt-5 space-y-3">
                {g.items.map((it) => (
                  <li key={it} className="t-body flex gap-3">
                    <span aria-hidden="true" className="mt-[0.8em] h-px w-4 shrink-0 bg-[var(--gold)]" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="alt">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.7fr] lg:gap-20">
          <SectionHead
            eyebrow="Pourquoi ce prix"
            title="Entre le biographe et le cahier."
            text="Un biographe professionnel se paie plusieurs milliers d’euros et demande des rendez-vous. Écrire seul demande des mois, et beaucoup n’y arrivent pas. Loomina tient entre les deux : vous ne faites que parler, et une personne relit."
          />
          <div className="t-body max-w-xl lg:pt-2">
            <p>
              Le prix couvre tout, de l’appel à la livraison. Il n’y a pas d’option payante, pas d’abonnement, et le livre
              reste votre propriété : vous conservez l’intégralité des droits sur votre récit.
            </p>
            <p className="mt-5">
              Si vous souhaitez d’autres exemplaires pour la famille, écrivez-nous après réception : nous vous faisons un devis
              d’impression, sans marge sur le texte.
            </p>
            <p className="mt-5">
              Les conditions complètes sont dans les{" "}
              <Link href="/cgv" className="link">
                conditions générales de vente
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>

      <Section size="md">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.7fr] lg:gap-20">
          <SectionHead
            eyebrow="Avant de commander"
            title="Quatre questions."
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

      <Closing title="Pas encore sûr ? Essayez trois minutes." />
    </main>
  );
}
