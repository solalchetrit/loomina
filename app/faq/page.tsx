import Link from "next/link";
import { Section, PageHeader } from "@/components/ui/Section";
import Accordion from "@/components/ui/Accordion";
import Closing from "@/components/Closing";
import { SITE } from "@/config/site";
import { OFFER, GUARANTEE, SHOW_PRICE, LAUNCH } from "@/config/offer";

/**
 * Chaque réponse ne promet que ce que le service fait aujourd'hui
 * et que les CGV couvrent. Pas de délai de réponse, pas de spécification
 * d'impression. Le paiement en 3 ou 4 fois (Klarna) est proposé à la commande.
 */
const FAQ_CATEGORIES = [
  {
    id: "service",
    category: "Le service",
    questions: [
      {
        q: "Comment fonctionne Loomina ?",
        a: `Vous appelez le ${SITE.phoneDisplay} quand vous voulez. Loomina mène l’entretien et écrit le récit de chaque appel, dans vos mots, puis en compose le livre. Vous relisez, vous corrigez, notre équipe relit tout, et le livre arrive chez vous.`,
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
        a: "Vous choisissez la durée qui vous convient, d’un quart d’heure à trois quarts d’heure, et vous pouvez la changer quand vous voulez. Loomina laisse toujours finir le souvenir en cours, et vous pouvez dire « on s’arrête là » à tout moment. Au prochain appel, Loomina reprend là où vous en étiez.",
      },
      {
        q: "Faut-il prendre rendez-vous ?",
        a: "Ce n’est pas obligatoire. Vous appelez quand vous voulez, de jour comme de nuit, depuis le numéro donné à la commande : c’est ainsi que Loomina vous reconnaît. Si vous préférez, choisissez un jour et une heure dans votre espace auteur, et c’est Loomina qui vous appelle.",
      },
    ],
  },
  {
    id: "livre",
    category: "Le livre",
    questions: [
      {
        q: "À quoi ressemble le livre ?",
        a: `Un livre imprimé, ${OFFER.format}, avec vos photos placées dans le texte. Vous recevez aussi une version numérique (${OFFER.digital}) à partager avec la famille.`,
      },
      {
        q: "Combien de pages fait-il ?",
        a: "Cela dépend de ce que vous racontez. Il n’y a ni minimum ni maximum : le livre fait la longueur de votre récit.",
      },
      {
        q: "Puis-je ajouter des photos ?",
        a: "Oui. Ajoutez-les dans votre espace auteur, ou envoyez-les par e-mail à contact@loomina.eu, en indiquant à quel souvenir elles se rapportent. Un proche peut le faire pour vous. Nous les plaçons au bon endroit lors de la mise en page.",
      },
      {
        q: "Puis-je relire et modifier le texte ?",
        a: "Oui, c’est même la règle. Le récit de chaque appel apparaît dans votre espace auteur quelques minutes après. Vous corrigez un passage vous-même, ou vous dites à Loomina, au prochain appel, ce qu’il faut changer. Vous avez le dernier mot avant l’impression.",
      },
      {
        q: "Qui est Mémo, le petit éléphant de l’espace auteur ?",
        a: "Mémo est le petit éléphant de votre espace auteur. Il retient chaque souvenir que vous racontez, et il grandit quand votre livre avance : tout petit au début, il se lève, prend la plume, met ses lunettes, puis tient votre livre. Il n’y a ni points ni niveaux : Mémo montre où en est votre livre.",
      },
    ],
  },
  {
    id: "tarifs",
    category: "Prix et paiement",
    questions: [
      {
        q: "Quel est le prix exact ?",
        a: `${SHOW_PRICE ? `${OFFER.price} €` : `Le prix sera annoncé à l’ouverture des commandes, le ${LAUNCH.label}. Il est`} tout compris : les appels, l’écriture, la relecture, la mise en page, l’impression et la livraison en France métropolitaine. Il n’y a rien à payer en plus.`,
      },
      {
        q: "Comment se passe le paiement ?",
        a: "Par carte bancaire, en une fois, ou en 3 ou 4 fois avec Klarna. Le paiement est sécurisé par Stripe, et Loomina ne conserve aucune donnée bancaire.",
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
        q: "Puis-je suivre le livre que j’ai offert ?",
        a: "Oui. À la commande, vous donnez aussi votre prénom et votre numéro de portable : ils ouvrent votre espace famille. Vous y voyez l’avancement du livre et le titre des récits, et vous pouvez souffler à Loomina un souvenir ou une question à aborder. Le texte des récits, c’est la personne qui raconte qui choisit de vous le montrer, depuis son espace auteur.",
      },
      {
        q: "La personne doit-elle savoir se servir d’un ordinateur ?",
        a: "Non. Tout se passe au téléphone, fixe ou portable. L’espace auteur, où les récits et le livre apparaissent, est là pour relire, mais ce n’est pas une obligation : un proche peut relire pour elle, et les corrections se disent de vive voix à Loomina.",
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
    <>
      <PageHeader
        title="Tout ce que l’on nous demande"
        text={
          <>
            Vous ne trouvez pas votre réponse ?{" "}
            <Link href="/contact" className="link">
              Écrivez-nous
            </Link>
            , une personne vous répond.
          </>
        }
        photo={{ name: "grand-pere-petite-fille", alt: "Un grand-père tient sa petite-fille dans ses bras, ils se sourient.", focus: "50% 20%", ratio: "aspect-[5/4]" }}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-16">
          <nav aria-label="Thèmes" className="faq-nav lg:sticky lg:top-32 lg:self-start">
            <ul className="flex flex-wrap gap-2 lg:flex-col">
              {FAQ_CATEGORIES.map((c) => (
                <li key={c.id}>
                  <a href={`#${c.id}`} className="block rounded-[14px] border border-[var(--line)] bg-white px-4 py-2.5 text-[16px] font-semibold hover:border-[var(--ink)]">
                    {c.category}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-14">
            {FAQ_CATEGORIES.map((c) => (
              <section key={c.id} id={c.id} className="scroll-mt-32">
                <h2 className="t-title">{c.category}</h2>
                <Accordion items={c.questions} className="mt-6" />
              </section>
            ))}
          </div>
        </div>
      </Section>

      <Closing title="Le mieux, c’est encore d’essayer" />
      {/* Questions et réponses lisibles par Google (réponses en texte seul). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_CATEGORIES.flatMap((c) => c.questions)
              .filter((x): x is { q: string; a: string } => typeof x.a === "string")
              .map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
          }),
        }}
      />
    </>
  );
}
