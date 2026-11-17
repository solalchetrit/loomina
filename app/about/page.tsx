import { Section, SectionHead, PageHeader } from "@/components/ui/Section";
import Icon, { type IconName } from "@/components/ui/Icon";
import Closing from "@/components/Closing";
import { SITE } from "@/config/site";

const COMMITMENTS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "pen",
    title: "Rien n’est inventé",
    text: "Le livre ne contient que ce que vous avez raconté. Quand un détail manque, Loomina vous le demande au lieu de l’imaginer.",
  },
  {
    icon: "check",
    title: "Chaque page est relue par une personne",
    text: "Avant l’impression, quelqu’un de l’équipe relit l’ensemble. Vous relisez aussi, et vous avez le dernier mot.",
  },
  {
    icon: "shield",
    title: "Votre histoire reste à vous",
    text: "Vos paroles et vos textes servent uniquement à écrire votre livre. Ils ne sont ni revendus, ni utilisés pour autre chose, et vous gardez tous les droits.",
  },
  {
    icon: "clock",
    title: "Vous allez à votre rythme",
    text: "Un appel par semaine ou trois dans la journée : personne ne vous presse, et vous pouvez faire une pause quand vous voulez.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="Tout a commencé avec ma grand-mère"
        text="Loomina est née d’une histoire de famille : une vie qui méritait un livre, et une personne pour qui écrire était devenu trop difficile."
      />

      <Section size="sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.8fr]">
          <aside className="card self-start p-7 lg:sticky lg:top-32">
            <span className="chip-icon">
              <Icon name="user" />
            </span>
            <p className="mt-5 text-[22px] font-extrabold tracking-[-0.02em]">Solal Chetrit</p>
            <p className="t-body">Fondateur de Loomina</p>
            <p className="t-small mt-5">22 ans, diplômé de l’ESCP. C’est lui qui lit et répond à chaque message envoyé à contact@loomina.eu.</p>
          </aside>

          <div className="card p-7 md:p-10">
            <p className="text-[clamp(1.35rem,2.3vw,1.75rem)] font-bold leading-[1.4] tracking-[-0.015em]">
              « Sa vie était passionnante, remplie d’histoires que je ne connaissais qu’en partie. »
            </p>
            <div className="prose-loomina mt-8 max-w-2xl">
              <p>
                Il y a deux ans, ma grand-mère a eu des soucis de santé. J’ai réalisé que sa vie méritait un livre, et que personne
                n’allait l’écrire. Nous voulions qu’elle le fasse elle-même, mais écrire demande du temps, de l’énergie, et une aisance
                avec les mots qu’elle n’avait plus.
              </p>
              <p>
                Parler, en revanche, elle savait. Alors j’ai construit une première version de Loomina : une voix au téléphone qui
                l’écoutait, lui posait des questions, et transformait ses réponses en chapitres. Nous avons relu ensemble, corrigé,
                ajouté des photos. Son livre est imprimé ; il est dans notre salon.
              </p>
              <p>
                Loomina existe pour que d’autres familles aient le leur. Le service est jeune, et c’est une toute petite équipe : les
                entretiens sont menés par une intelligence artificielle, mais votre livre est relu par notre équipe, et quand vous nous
                écrivez, c’est moi qui vous réponds.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHead title="Quatre règles qui ne bougent pas" />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {COMMITMENTS.map((c) => (
            <li key={c.title} className="card p-7 md:p-8">
              <span className="chip-icon">
                <Icon name={c.icon} />
              </span>
              <h3 className="t-heading mt-6">{c.title}</h3>
              <p className="t-body mt-2">{c.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section size="sm">
        <div className="card flex flex-col gap-6 p-7 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-2xl">
            <h2 className="t-heading">Une personne vous répond, pas un service client</h2>
            <p className="t-body mt-2">
              Écrivez à{" "}
              <a href="mailto:contact@loomina.eu" className="link">
                contact@loomina.eu
              </a>
              . Le {SITE.phoneDisplay}, lui, est le numéro de Loomina : c’est elle qui décroche, à toute heure, pour un essai de trois
              minutes ou pour vos entretiens.
            </p>
          </div>
          <a href="/contact" className="press inline-flex min-h-12 shrink-0 items-center justify-center rounded-[var(--radius-btn)] border border-[var(--rule-strong)] bg-white px-5 font-bold hover:border-[var(--ink)]">
            Nous écrire
          </a>
        </div>
      </Section>

      <Closing title="Votre histoire mérite son livre" />
    </>
  );
}
