import { Section, SectionHead, PageHeader, Numbered } from "@/components/ui/Section";
import { BookPage } from "@/components/VoiceToPage";
import Closing from "@/components/Closing";
import { LOOMINA_CONFIG } from "@/config/loomina";
import { OFFER, THEMES } from "@/config/offer";

const BEFORE = [
  {
    title: "Vous commandez, pour vous ou pour un proche",
    text: "Vous indiquez le prénom et le numéro de téléphone de la personne qui racontera. C’est ce numéro que Loomina reconnaîtra. Le paiement se fait en une fois, par carte, sur une page sécurisée.",
  },
  {
    title: "Vous appelez quand vous êtes prêt",
    text: `Il n’y a pas de rendez-vous. Vous composez le ${LOOMINA_CONFIG.PHONE_NUMBER_DISPLAY} depuis le numéro de la commande, le jour et à l’heure qui vous conviennent. Loomina vous accueille par votre prénom.`,
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

export default function ExperiencePage() {
  return (
    <main className="w-full">
      <PageHeader
        eyebrow="Comment ça marche"
        title="Un téléphone, des conversations, un livre."
        text="Vous parlez, Loomina écrit, notre équipe relit, et le livre arrive chez vous. Voici le détail, dans l’ordre où vous le vivrez."
      />

      <Section size="sm">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.7fr] lg:gap-20">
          <SectionHead eyebrow="Avant" title="Deux choses à faire, pas plus." />
          <Numbered items={BEFORE} />
        </div>
      </Section>

      <Section tone="alt">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.7fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHead
              eyebrow="Pendant"
              title="Une conversation, pas un interrogatoire."
              text="Loomina est une intelligence artificielle conçue pour écouter patiemment. Elle ne vous presse jamais et ne change pas de sujet avant vous."
            />
          </div>
          <Numbered items={DURING} start={3} />
        </div>
      </Section>

      <Section id="chapitres">
        <SectionHead
          eyebrow={`${OFFER.chapters} thèmes`}
          title="Des points de départ, pas un questionnaire."
          text="Loomina propose ces thèmes au fil des appels, de l’enfance à aujourd’hui. Vous pouvez en sauter, en approfondir, en ajouter : c’est votre récit."
        />
        <ol className="rule-top mt-12 grid sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12">
          {THEMES.map((t, i) => (
            <li key={t.title} className="flex gap-4 border-b border-[var(--rule)] py-4">
              <span className="t-numeral w-7 shrink-0 text-[18px] leading-[1.5]" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="block font-sans text-[17px] font-semibold text-[var(--ink)]">{t.title}</span>
                <span className="t-small mt-0.5 block">{t.desc}</span>
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="alt">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <SectionHead eyebrow="Ce que Loomina écrit" title="Vos mots, mis en page." />
            <p className="t-body mt-6 max-w-md">
              Loomina ne romance pas. Elle garde votre façon de dire les choses, ordonne, et quand un détail manque, elle vous le
              demande au prochain appel plutôt que de l’inventer.
            </p>
            <p className="t-small mt-6">Exemple écrit pour illustrer la méthode : Jeanne n’est pas une cliente réelle.</p>
          </div>
          <BookPage chapter="Chapitre VII" title="La maison de famille" page="112">
            <p>
              <span className="dropcap">L</span>a maison n’était pas grande, mais elle avait deux escaliers, et c’est ce qui faisait toute sa
              grandeur à nos yeux d’enfants. Celui de devant, pour les visites. Celui de derrière, pour nous.
            </p>
            <p>
              Ma mère y montait avec le linge, et nous, nous y descendions en courant quand la cloche de midi sonnait au bout du
              village.
            </p>
          </BookPage>
        </div>
      </Section>

      <Section size="sm">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.7fr] lg:gap-20">
          <SectionHead eyebrow="Après" title="Le livre, chez vous." />
          <Numbered items={AFTER} start={6} />
        </div>
      </Section>

      <Closing title="Essayez d’abord, commandez ensuite." />
    </main>
  );
}
