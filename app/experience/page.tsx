import { Section, PageHeader } from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import Icon, { type IconName } from "@/components/ui/Icon";
import ThemePicker from "@/components/home/ThemePicker";
import Photo from "@/components/ui/Photo";
import { CallPreview } from "@/components/HowItWorks";
import Closing from "@/components/Closing";
import ChristmasOffer from "@/components/home/ChristmasOffer";
import AuthorShowcase from "@/components/AuthorShowcase";
import MemoSection from "@/components/home/MemoSection";
import { SITE } from "@/config/site";
import { OFFER } from "@/config/offer";

const BEFORE = [
  {
    title: "Vous commandez, pour vous ou pour un proche",
    text: "Vous indiquez le prénom et le numéro de téléphone de la personne qui racontera. C’est ce numéro que Loomina reconnaîtra. Le paiement est sécurisé, par carte, en une fois ou en 3 ou 4 fois avec Klarna.",
  },
  {
    title: "Vous appelez quand vous êtes prêt",
    text: `Aucun rendez-vous n’est imposé. Vous composez le ${SITE.phoneDisplay} depuis le numéro de la commande, le jour et à l’heure qui vous conviennent. Loomina vous accueille par votre prénom.`,
  },
];

const DURING = [
  {
    title: "Une question à la fois",
    text: "Loomina se présente, puis commence par vos premiers souvenirs : l’endroit où vous avez grandi. Ensuite, Loomina écoute, relance, et vous laisse le temps de chercher vos souvenirs. Vous n’avez rien à préparer.",
  },
  {
    title: "Vous choisissez la durée de vos appels",
    text: "Un quart d’heure ou trois quarts d’heure, c’est vous qui décidez. Vous pouvez dire « on s’arrête là » à tout moment, et reprendre un autre jour : Loomina se souvient de ce que vous lui avez dit et reprend là où vous en étiez.",
  },
  {
    title: "Le récit de votre appel est écrit aussitôt",
    text: "Dans vos mots, sans rien inventer, et dans le style d’écriture que vous avez choisi. Vous le retrouvez dans votre espace auteur : vous le corrigez vous-même, ou vous le dites à Loomina au prochain appel.",
  },
];

const AFTER = [
  {
    title: "Une dernière relecture avant l’impression",
    text: "Vous avez le dernier mot sur chaque récit, puis sur le livre. Une personne de l’équipe relit ensuite l’ensemble, corrige, et place les photos que vous avez ajoutées.",
  },
  {
    title: "Le livre arrive chez vous",
    text: `Imprimé en ${OFFER.format}, avec sa version ${OFFER.digital} pour la famille. Comptez en général ${OFFER.delay} entre le premier appel et le livre validé, puis ${OFFER.printDelay} d’impression et d’acheminement.`,
  },
];

type Step = { title: string; text: string };

const PHASES: {
  id: string;
  icon: IconName;
  label: string;
  title: string;
  text: string;
  duration: string;
  steps: Step[];
}[] = [
  {
    id: "avant",
    icon: "gift",
    label: "Avant",
    title: "Deux choses à faire, pas plus",
    text: "Une commande de deux minutes, puis vous appelez quand vous êtes prêt.",
    duration: "Quelques minutes",
    steps: BEFORE,
  },
  {
    id: "pendant",
    icon: "phone",
    label: "Pendant",
    title: "Une conversation, pas un interrogatoire",
    text: "Loomina est une intelligence conçue pour écouter patiemment. Elle ne vous presse jamais et ne change pas de sujet avant vous.",
    duration: `En général ${OFFER.delay}`,
    steps: DURING,
  },
  {
    id: "apres",
    icon: "book",
    label: "Après",
    title: "Le livre, chez vous",
    text: "Une dernière relecture à deux, puis l’impression. Vous n’avez plus qu’à ouvrir le colis.",
    duration: OFFER.printDelay,
    steps: AFTER,
  },
];

/** Frise verticale : un fil continu, une pastille numérotée par étape. */
function Timeline({ steps, start }: { steps: Step[]; start: number }) {
  return (
    <ol className="relative">
      {steps.map((st, i) => {
        const n = start + i;
        const last = i === steps.length - 1;
        return (
          <li key={st.title} className="relative pb-4 pl-12 last:pb-0 sm:pl-16">
            {!last && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-[17px] top-11 w-[2px] rounded bg-[var(--line)] sm:left-[21px] sm:top-12"
              />
            )}
            <span
              aria-hidden="true"
              className="absolute left-0 top-2 flex h-9 w-9 items-center justify-center rounded-full border-2 sm:h-11 sm:w-11 border-[var(--ink)] bg-white text-[16px] font-extrabold"
            >
              {n}
            </span>
            <div className="card p-5 sm:p-6 md:p-7">
              <h3 className="t-heading">
                <span className="sr-only">Étape {n}. </span>
                {st.title}
              </h3>
              <p className="t-body mt-2">{st.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Numéro de la première étape de chaque temps, pour une numérotation continue de 1 à 7. */
const STARTS = PHASES.map(
  (_, i) => 1 + PHASES.slice(0, i).reduce((n, p) => n + p.steps.length, 0),
);

export default function ExperiencePage() {
  return (
    <>
      <PageHeader
        title={
          <>
            Un téléphone,
            <br />
            des conversations,
            <br />
            un livre
          </>
        }
        photo={{
          name: "mains-telephone",
          alt: "Les mains d’une personne âgée tiennent un téléphone.",
        }}
        badge={
          <div className="w-[230px]">
            <CallPreview />
          </div>
        }
        actions={
          <>
            <ul className="flex flex-col gap-2.5 text-[17px] text-[var(--ink-2)]">
              {[
                "Depuis un fixe ou un portable",
                "À votre rythme, quand vous voulez",
                `En général ${OFFER.delay} jusqu’au livre validé`,
              ].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--amber-soft)] text-[var(--amber-ink)]">
                    <Icon name="check" size={16} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={`tel:${SITE.phone}`} size="lg">
                Essayer la démo
              </Button>
              <Button href="#avant" variant="secondary" size="lg">
                Voir les étapes
              </Button>
            </div>
          </>
        }
      />

      {PHASES.map((p, idx) => {
        const start = STARTS[idx];
        return (
          <Section
            key={p.id}
            id={p.id}
            className=""
          >
            <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
              <div className="lg:sticky lg:top-32 lg:self-start">
                <span className="pill pill-amber">
                  {p.label} · {p.duration}
                </span>
                <h2 className="t-title mt-5">{p.title}</h2>
                <p className="t-lead mt-5 max-w-md">{p.text}</p>
              </div>
              <div>
                <Timeline steps={p.steps} start={start} />
                {p.id === "apres" && (
                  <div className="card mt-4 grid gap-1 p-3 sm:ml-16 sm:grid-cols-[262px_minmax(0,1fr)] sm:items-center">
                    <Photo
                      name="livre-bordeaux-debout"
                      alt="Le livre Loomina, couverture en toile bordeaux, posé debout."
                      ratio="aspect-[4/3] sm:aspect-[4/5]"
                      sizes="(min-width: 640px) 320px, 100vw"
                      className="!rounded-[18px]"
                    />
                    <div className="flex flex-col px-4 pb-4 pt-5 sm:px-6 sm:py-3">
                      <p className="text-[14px] font-bold text-[var(--amber-ink)]">Ce que vous recevez</p>
                      <p className="mt-1.5 text-balance text-[22px] font-extrabold leading-[1.2] tracking-[-0.02em] text-[var(--ink)]">
                        Votre livre, et sa version numérique
                      </p>
                      <ul className="mt-5 flex flex-col gap-2.5">
                        {[
                          OFFER.format.charAt(0).toUpperCase() + OFFER.format.slice(1),
                          "Vos photos placées dans le texte",
                          `Version ${OFFER.digital} pour la famille`,
                          "Livraison incluse en France métropolitaine",
                        ].map((t) => (
                          <li key={t} className="flex items-start gap-2.5 text-[15px] leading-snug text-[var(--ink-2)]">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--amber-soft)] text-[var(--amber-ink)]">
                              <Icon name="check" size={12} />
                            </span>
                            {t}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 flex flex-col gap-3">
                        <Button href="/order" className="w-full justify-center">
                          Commander
                        </Button>
                        <a href={`tel:${SITE.phone}`} className="link self-center text-[15px]">
                          Essayer la démo
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Section>
        );
      })}

      <AuthorShowcase />

      <MemoSection />

      <ThemePicker />

      {/* L’offre de lancement de Noël, aussi hors de l’accueil (Solal, 26/11/2026). Disparaît seule après le 24 décembre. */}
      <ChristmasOffer />

      <Closing title="Essayez d’abord, commandez ensuite" />
    </>
  );
}
