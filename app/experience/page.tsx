import type { ReactNode } from "react";
import { Section, SectionHead, PageHeader } from "@/components/ui/Section";
import { BookPage } from "@/components/VoiceToPage";
import Closing from "@/components/Closing";
import { SITE } from "@/config/site";
import { OFFER, THEMES } from "@/config/offer";

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
    text: "Dans vos mots, sans rien inventer. Vous le retrouvez dans votre espace auteur. Au prochain appel, vous dites ce qu’il faut changer, préciser ou retirer.",
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

/** Une étape du parcours, numérotée dans la suite complète. */
function Stage({ number, title, text }: { number: number; title: string; text: ReactNode }) {
  return (
    <li className="card flex gap-5 p-6 md:p-7">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[var(--ink)] text-[16px] font-bold text-white" aria-hidden="true">
        {number}
      </span>
      <div>
        <h3 className="t-heading">
          <span className="sr-only">{number}. </span>
          {title}
        </h3>
        <p className="t-body mt-2">{text}</p>
      </div>
    </li>
  );
}

function Phase({ label, title, text, steps, start }: { label: string; title: string; text?: string; steps: { title: string; text: string }[]; start: number }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <SectionHead eyebrow={label} title={title} text={text} />
      </div>
      <ol className="flex flex-col gap-4">
        {steps.map((st, i) => (
          <Stage key={st.title} number={start + i} title={st.title} text={st.text} />
        ))}
      </ol>
    </div>
  );
}

export default function ExperiencePage() {
  return (
    <>
      <PageHeader
        eyebrow="Comment ça marche"
        title="Un téléphone, des conversations, un livre"
        text="Vous parlez, Loomina écrit, notre équipe relit, et le livre arrive chez vous. Voici le détail, dans l’ordre où vous le vivrez."
      />

      <Section size="sm">
        <Phase label="Avant" title="Deux choses à faire, pas plus" steps={BEFORE} start={1} />
      </Section>

      <Section className="bg-white">
        <Phase
          label="Pendant"
          title="Une conversation, pas un interrogatoire"
          text="Loomina est une intelligence artificielle conçue pour écouter patiemment. Elle ne vous presse jamais et ne change pas de sujet avant vous."
          steps={DURING}
          start={3}
        />
      </Section>

      <Section id="chapitres">
        <SectionHead
          eyebrow={`${OFFER.chapters} thèmes`}
          title="Des points de départ, pas un questionnaire"
          text="Loomina propose ces thèmes au fil des appels, de l’enfance à aujourd’hui. Vous pouvez en sauter, en approfondir, en ajouter : c’est votre récit."
        />
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((t) => (
            <li key={t.title} className="card px-5 py-4">
              <span className="block text-[17px] font-bold">{t.title}</span>
              <span className="t-small mt-0.5 block">{t.desc}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section className="bg-white">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHead eyebrow="Ce que Loomina écrit" title="Vos mots, mis en page" />
            <p className="t-body mt-6 max-w-md">
              Loomina ne romance pas. Elle garde votre façon de dire les choses, ordonne, et quand un détail manque, elle vous le demande
              au prochain appel plutôt que de l’inventer.
            </p>
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

      <Section>
        <Phase label="Après" title="Le livre, chez vous" steps={AFTER} start={6} />
      </Section>

      <Closing title="Essayez d’abord, commandez ensuite" />
    </>
  );
}
