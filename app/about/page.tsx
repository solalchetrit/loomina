import { Section, SectionHead, PageHeader, Numbered } from "@/components/ui/Section";
import Closing from "@/components/Closing";
import { LOOMINA_CONFIG } from "@/config/loomina";

const COMMITMENTS = [
  {
    title: "Rien n’est inventé",
    text: "Le livre ne contient que ce que vous avez raconté. Quand un détail manque, Loomina vous le demande au lieu de l’imaginer.",
  },
  {
    title: "Chaque page est relue par une personne",
    text: "Avant l’impression, quelqu’un de l’équipe relit l’ensemble. Vous relisez aussi, et vous avez le dernier mot.",
  },
  {
    title: "Votre histoire reste à vous",
    text: "Vos paroles et vos textes servent uniquement à écrire votre livre. Ils ne sont ni revendus, ni utilisés pour autre chose, et vous gardez tous les droits.",
  },
  {
    title: "Vous allez à votre rythme",
    text: "Un appel par semaine ou trois dans la journée : personne ne vous presse, et vous pouvez faire une pause quand vous voulez.",
  },
];

export default function AboutPage() {
  return (
    <main className="w-full">
      <PageHeader
        eyebrow="Notre histoire"
        title="Tout a commencé avec ma grand-mère."
        text="Loomina est née d’une histoire de famille : une vie qui méritait un livre, et une personne pour qui écrire était devenu trop difficile."
      />

      <Section size="sm">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.7fr] lg:gap-20">
          <div className="rule-top pt-6 lg:sticky lg:top-28 lg:self-start">
            <p className="font-serif text-[26px] leading-tight text-[var(--ink)]">Solal Chetrit</p>
            <p className="t-body mt-1">Fondateur de Loomina</p>
            <p className="t-small mt-6 max-w-xs">
              22 ans, diplômé de l’ESCP. C’est lui qui lit et répond à chaque message envoyé à contact@loomina.eu.
            </p>
          </div>

          <div className="prose-loomina max-w-2xl">
            <p className="font-serif text-[clamp(1.4rem,2.4vw,1.9rem)] leading-[1.35] tracking-[-0.015em] text-[var(--ink)]">
              « Sa vie était passionnante, remplie d’histoires que je ne connaissais qu’en partie. »
            </p>
            <p className="mt-8">
              Il y a deux ans, ma grand-mère a eu des soucis de santé. J’ai réalisé que sa vie méritait un livre, et que
              personne n’allait l’écrire. Nous voulions qu’elle le fasse elle-même, mais écrire demande du temps, de l’énergie,
              et une aisance avec les mots qu’elle n’avait plus.
            </p>
            <p>
              Parler, en revanche, elle savait. Alors j’ai construit une première version de Loomina : une voix au téléphone
              qui l’écoutait, lui posait des questions, et transformait ses réponses en chapitres. Nous avons relu ensemble,
              corrigé, ajouté des photos. Son livre est imprimé ; il est dans notre salon.
            </p>
            <p>
              Loomina existe pour que d’autres familles aient le leur. Le service est jeune, et c’est une toute petite équipe :
              les entretiens sont menés par une intelligence artificielle, mais chaque page est relue par une personne, et
              quand vous nous écrivez, c’est moi qui vous réponds.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="alt">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.7fr] lg:gap-20">
          <SectionHead eyebrow="Nos engagements" title="Quatre règles qui ne bougent pas." />
          <Numbered items={COMMITMENTS} />
        </div>
      </Section>

      <Section size="sm">
        <div className="max-w-2xl">
          <SectionHead eyebrow="Qui vous répond" title="Une personne, pas un service client." />
          <div className="prose-loomina mt-6">
            <p>
              Pour toute question, écrivez à <a href="mailto:contact@loomina.eu">contact@loomina.eu</a> ou passez par la{" "}
              <a href="/contact">page contact</a>. Le {LOOMINA_CONFIG.PHONE_NUMBER_DISPLAY}, lui, est le numéro de Loomina :
              c’est elle qui décroche, à toute heure, pour un essai de trois minutes ou pour vos entretiens.
            </p>
          </div>
        </div>
      </Section>

      <Closing title="Votre histoire mérite son livre." />
    </main>
  );
}
