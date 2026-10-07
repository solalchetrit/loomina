import Link from "next/link";
import { Section, PageHeader } from "@/components/ui/Section";
import Accordion from "@/components/ui/Accordion";
import Closing from "@/components/Closing";
import { LOOMINA_CONFIG } from "@/config/loomina";
import { OFFER, GUARANTEE } from "@/config/offer";

/**
 * Chaque réponse ne promet que ce que le service fait aujourd'hui
 * et que les CGV couvrent. Pas de délai de réponse, pas de spécification
 * d'impression, pas de paiement en plusieurs fois.
 */
const FAQ_CATEGORIES = [
  {
    id: "service",
    category: "Le service",
    questions: [
      {
        q: "Comment fonctionne Loomina ?",
        a: `Vous appelez le ${LOOMINA_CONFIG.PHONE_NUMBER_DISPLAY} quand vous voulez. Loomina, une intelligence artificielle, mène l’entretien et écrit un chapitre après chaque appel, dans vos mots. Vous relisez, vous corrigez, notre équipe relit tout, et le livre relié arrive chez vous.`,
      },
      {
        q: "Combien de temps dure le processus ?",
        a: `En général ${OFFER.delay} entre le premier appel et le livre validé, mais c’est votre rythme qui compte : certains avancent en un mois, d’autres prennent plusieurs mois. Il n’y a aucune pression, aucune date limite.`,
      },
      {
        q: "Combien d’appels faut-il ?",
        a: `Autant que vous voulez. Loomina propose ${OFFER.chapters} thèmes, de l’enfance à aujourd’hui, mais rien n’oblige à les suivre tous : vous pouvez consacrer trois appels à votre enfance et un seul à votre carrière.`,
      },
      {
        q: "Combien de temps dure un appel ?",
        a: "Le temps que vous voulez : dix minutes ou une heure. Vous pouvez dire « on s’arrête là » à tout moment. Au prochain appel, Loomina reprend là où vous en étiez.",
      },
      {
        q: "Faut-il prendre rendez-vous ?",
        a: "Non. Vous appelez quand vous voulez, de jour comme de nuit, depuis le numéro donné à la commande : c’est ainsi que Loomina vous reconnaît.",
      },
    ],
  },
  {
    id: "livre",
    category: "Le livre",
    questions: [
      {
        q: "À quoi ressemble le livre ?",
        a: `Un livre relié, ${OFFER.format}, avec vos photos placées dans le texte. Vous recevez aussi une version numérique (${OFFER.digital}) à partager avec la famille.`,
      },
      {
        q: "Combien de pages fait-il ?",
        a: "Cela dépend de ce que vous racontez. Il n’y a ni minimum ni maximum : le livre fait la longueur de votre récit.",
      },
      {
        q: "Puis-je ajouter des photos ?",
        a: "Oui. Envoyez-les par e-mail à contact@loomina.eu, en indiquant à quel souvenir elles se rapportent. Un proche peut le faire pour vous. Nous les plaçons au bon endroit lors de la mise en page.",
      },
      {
        q: "Puis-je relire et modifier le texte ?",
        a: "Oui, c’est même la règle. Chaque chapitre apparaît dans votre espace auteur après l’appel. Vous dites à Loomina, au prochain appel, ce qu’il faut changer, et vous avez le dernier mot avant l’impression.",
      },
    ],
  },
  {
    id: "tarifs",
    category: "Prix et paiement",
    questions: [
      {
        q: "Quel est le prix exact ?",
        a: `${OFFER.price} € tout compris : les appels, l’écriture, la relecture, la mise en page, l’impression et la livraison en France métropolitaine. Il n’y a rien à payer en plus.`,
      },
      {
        q: "Comment se passe le paiement ?",
        a: "En une fois, par carte bancaire, sur une page de paiement sécurisée (Stripe). Loomina ne conserve aucune donnée bancaire.",
      },
      {
        q: "Y a-t-il une garantie ?",
        a: `Oui. ${GUARANTEE} Vous disposez aussi du droit de rétractation légal de ${OFFER.withdrawalDays} jours à compter de la commande.`,
      },
    ],
  },
  {
    id: "confidentialite",
    category: "Confidentialité",
    questions: [
      {
        q: "Qui entend mes appels et lit mes textes ?",
        a: "Loomina, pour écrire, et la personne de l’équipe qui relit avant l’impression. Personne d’autre. Vos paroles et vos textes servent uniquement à écrire votre livre ; ils ne sont ni revendus, ni utilisés pour autre chose.",
      },
      {
        q: "Où sont stockées mes données ?",
        a: (
          <>
            Vos textes sont stockés dans l’Union européenne (Paris). Le détail des traitements, dont l’écriture par une
            intelligence artificielle, est dans notre{" "}
            <Link href="/privacy" className="link">
              politique de confidentialité
            </Link>
            .
          </>
        ),
      },
      {
        q: "Puis-je faire supprimer mes données ?",
        a: "Oui, à tout moment, en écrivant à contact@loomina.eu. Nous supprimons vos entretiens et vos textes ; vous gardez votre livre.",
      },
    ],
  },
  {
    id: "cadeau",
    category: "Offrir Loomina",
    questions: [
      {
        q: "Comment offrir Loomina à un proche ?",
        a: "À la commande, choisissez « C’est pour offrir » et indiquez le prénom et le numéro de téléphone de la personne qui racontera. C’est elle qui appellera Loomina, depuis ce numéro, quand elle le souhaite. Vous pouvez aussi lui annoncer le cadeau vous-même, avant son premier appel.",
      },
      {
        q: "La personne doit-elle savoir se servir d’un ordinateur ?",
        a: "Non. Tout se passe au téléphone, fixe ou portable. L’espace auteur, où les chapitres apparaissent, est là pour relire, mais ce n’est pas une obligation : un proche peut relire pour elle, et les corrections se disent de vive voix à Loomina.",
      },
      {
        q: "Livrez-vous ailleurs qu’en France ?",
        a: "La livraison en France métropolitaine est incluse. Pour une autre destination, écrivez-nous avant de commander : nous vous dirons si c’est possible et à quel coût.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <main className="w-full">
      <PageHeader
        eyebrow="Questions fréquentes"
        title="Tout ce que l’on nous demande."
        text={
          <>
            Vous ne trouvez pas votre réponse ?{" "}
            <Link href="/contact" className="link">
              Écrivez-nous
            </Link>
            , une personne vous répond.
          </>
        }
      />

      <Section size="sm">
        <div className="grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-20">
          <nav aria-label="Thèmes" className="lg:sticky lg:top-28 lg:self-start">
            <p className="t-eyebrow">Thèmes</p>
            <ol className="rule-top mt-4 flex flex-wrap gap-x-5 gap-y-0 lg:flex-col">
              {FAQ_CATEGORIES.map((c) => (
                <li key={c.id} className="border-b border-[var(--rule)] lg:w-full">
                  <a href={`#${c.id}`} className="block py-3 font-sans text-[16px] font-medium text-[var(--ink)] underline-offset-4 hover:underline">
                    {c.category}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="space-y-16">
            {FAQ_CATEGORIES.map((c) => (
              <section key={c.id} id={c.id} className="scroll-mt-28">
                <h2 className="t-title">{c.category}</h2>
                <Accordion items={c.questions} className="mt-6" />
              </section>
            ))}
          </div>
        </div>
      </Section>

      <Closing title="Le mieux, c’est encore d’essayer." />
    </main>
  );
}
