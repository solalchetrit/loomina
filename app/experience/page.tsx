import { Section, SectionHead, PageHeader } from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import { type IconName } from "@/components/ui/Icon";
import { BookPage } from "@/components/VoiceToPage";
import { BookCover } from "@/components/home/WhatYouGet";
import { Contents } from "@/components/home/Themes";
import Closing from "@/components/Closing";
import AuthorShowcase from "@/components/AuthorShowcase";
import { SITE } from "@/config/site";
import { OFFER } from "@/config/offer";

const BEFORE = [
  {
    title: "Vous commandez, pour vous ou pour un proche",
    text: "Vous indiquez le prénom et le numéro de téléphone de la personne qui racontera. C’est ce numéro que Loomina reconnaîtra. Le paiement se fait en une fois, par carte, sur une page sécurisée.",
  },
  {
    title: "Vous appelez quand vous êtes prêt",
    text: `Il n’y a pas de rendez-vous. Vous composez le ${SITE.phoneDisplay} depuis le numéro de la commande, le jour et à l’heure qui vous conviennent. Loomina vous accueille par votre prénom.`,
  },
];

const DURING = [
  {
    title: "Une question à la fois",
    text: "Loomina se présente, puis vous demande par où vous aimeriez commencer. Souvent l’enfance. Elle écoute, relance, et vous laisse le temps de chercher vos souvenirs. Vous n’avez rien à préparer.",
  },
  {
    title: "Un appel dure ce que vous voulez",
    text: "Dix minutes ou une heure. Vous pouvez dire « on s’arrête là » à tout moment, et reprendre un autre jour : Loomina se souvient de ce que vous lui avez dit et reprend là où vous en étiez.",
  },
  {
    title: "Le chapitre est écrit après l’appel",
    text: "Dans vos mots, sans rien inventer, et dans le style d’écriture que vous avez choisi. Vous le retrouvez dans votre espace auteur : vous le corrigez vous-même, ou vous le dites à Loomina au prochain appel.",
  },
];

const AFTER = [
  {
    title: "Vous relisez, nous relisons",
    text: "Vous avez le dernier mot sur chaque chapitre. Puis une personne de l’équipe relit l’ensemble, corrige, et place les photos que vous nous avez envoyées par e-mail.",
  },
  {
    title: "Le livre arrive chez vous",
    text: `Relié, ${OFFER.format}, avec sa version ${OFFER.digital} pour la famille. Comptez en général ${OFFER.delay} entre le premier appel et le livre validé, puis ${OFFER.printDelay} d’impression et d’acheminement.`,
  },
];

type Step = { title: string; text: string };

const PHASES: { id: string; icon: IconName; label: string; title: string; text: string; duration: string; steps: Step[] }[] = [
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
    text: "Loomina est une intelligence artificielle conçue pour écouter patiemment. Elle ne vous presse jamais et ne change pas de sujet avant vous.",
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
            {!last && <span aria-hidden="true" className="absolute bottom-0 left-[17px] top-11 w-[2px] rounded bg-[var(--line)] sm:left-[21px] sm:top-12" />}
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
const STARTS = PHASES.map((_, i) => 1 + PHASES.slice(0, i).reduce((n, p) => n + p.steps.length, 0));

export default function ExperiencePage() {
  return (
    <>
      <PageHeader
        title="Un téléphone, des conversations, un livre"
        text="Vous parlez, Loomina écrit, notre équipe relit, et le livre arrive chez vous. Voici le détail, dans l’ordre où vous le vivrez."
      />

      {PHASES.map((p, idx) => {
        const start = STARTS[idx];
        return (
          <Section key={p.id} id={p.id} className={idx % 2 === 1 ? "bg-white" : ""}>
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
                  <div className="mt-6 grid items-center gap-6 rounded-[var(--radius-card)] bg-[var(--ink)] p-7 text-white sm:grid-cols-[130px_1fr] md:p-9">
                    <BookCover className="max-w-[130px] !py-0" compact />
                    <div>
                      <p className="text-[15px] font-bold text-[var(--amber)]">Ce que vous recevez</p>
                      <p className="mt-2 text-[24px] font-extrabold leading-tight tracking-[-0.02em]">
                        Un livre relié, {OFFER.format}, et sa version {OFFER.digital}
                      </p>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Button href="/order" variant="accent" size="lg">
                          Commander · {OFFER.price} €
                        </Button>
                        <Button href={`tel:${SITE.phone}`} variant="ghost" className="!text-white !decoration-white/40 hover:!decoration-white">
                          Essayer d’abord la démo
                        </Button>
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

      <Section className="bg-white">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHead
              title="Vos mots, mis en page"
              text="Loomina ne romance pas. Elle garde votre façon de dire les choses, ordonne, et quand un détail manque, elle vous le demande au prochain appel plutôt que de l’inventer."
            />
            <p className="t-small mt-6">Exemple écrit pour illustrer la méthode : Jeanne n’est pas une cliente réelle.</p>
          </div>
          <BookPage chapter="Chapitre 7" title="La maison de famille" page="112">
            <p>
              <span className="dropcap">L</span>a maison n’était pas grande, mais elle avait deux escaliers, et c’est ce qui faisait toute sa
              grandeur à nos yeux d’enfants. Celui de devant, pour les visites. Celui de derrière, pour nous.
            </p>
            <p>
              Ma mère y montait avec le linge, et nous, nous y descendions en courant quand la cloche de midi sonnait au bout du village.
            </p>
          </BookPage>
        </div>
      </Section>

      <Section id="chapitres">
        <SectionHead
          title="Des points de départ, pas un questionnaire"
          text="Loomina propose ces thèmes au fil des appels. Vous pouvez en sauter, en approfondir, en ajouter : c’est votre récit."
        />
        <Contents className="mt-10" />
      </Section>

      <Closing title="Essayez d’abord, commandez ensuite" />
    </>
  );
}
