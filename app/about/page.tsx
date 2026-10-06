import { Section, SectionHeading, PageHeader } from "@/components/ui/Section";
import CtaBand from "@/components/CtaBand";

const VALUES = [
  { title: "Rien n’est inventé", desc: "Le livre ne contient que ce que vous avez raconté. Quand un détail manque, Loomina vous le demande au lieu de l’imaginer." },
  { title: "Chaque page est relue", desc: "Par une personne de l’équipe, avant l’impression. Vous relisez aussi, et vous avez le dernier mot." },
  { title: "Votre histoire reste à vous", desc: "Vos paroles et vos textes servent uniquement à écrire votre livre. Ils ne sont ni revendus, ni utilisés pour autre chose." },
  { title: "Vous allez à votre rythme", desc: "Un appel par semaine ou trois dans la journée : personne ne vous presse, et vous pouvez faire une pause quand vous voulez." },
];

const MILESTONES = [
  { when: "Le déclic", what: "Ma grand-mère tombe malade. Nous voulons son histoire, elle ne peut pas l’écrire." },
  { when: "Le prototype", what: "Une IA qui appelle, écoute et rédige. Son livre est imprimé." },
  { when: "Loomina", what: "Le service s’ouvre à toutes les familles, avec relecture humaine de chaque chapitre." },
];

export default function AboutPage() {
  return (
    <main className="w-full">
      <PageHeader title="Tout a commencé avec ma grand-mère" text="Loomina est née d’une histoire de famille : une vie qui méritait un livre, et une personne pour qui écrire était devenu trop difficile." />

      {/* Récit fondateur */}
      <Section size="sm">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="reveal">
            <div className="border-t border-[var(--ink)]/80 pt-6">
              <p className="font-serif text-[26px] leading-tight text-[var(--ink)]">Solal Chetrit</p>
              <p className="mt-1 font-sans text-[15px] text-[var(--text-secondary)]">Fondateur de Loomina</p>
            </div>
            <ol className="mt-8 space-y-4 border-l border-[var(--hairline)] pl-6">
              {MILESTONES.map((m) => (
                <li key={m.when} className="relative font-sans text-[15px] leading-relaxed text-[var(--text-secondary)]">
                  <span aria-hidden="true" className="absolute -left-[29px] top-2 h-2 w-2 rounded-full bg-[var(--loomina-gold)]" />
                  <span className="mr-2 font-serif text-[17px] italic text-[var(--gold-ink)]">{m.when}</span>
                  {m.what}
                </li>
              ))}
            </ol>
          </div>

          <div className="reveal prose-loomina max-w-2xl">
            <p className="font-serif text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.3] tracking-[-0.02em] text-[var(--ink)]">
              « Sa vie était passionnante, remplie d’histoires que je ne connaissais qu’en partie. »
            </p>
            <p className="mt-8">
              Je m’appelle <strong>Solal Chetrit</strong>, j’ai 22 ans et je suis diplômé de l’ESCP Business School.
            </p>
            <p>
              Il y a deux ans, ma grand-mère a eu des soucis de santé. Face à cette épreuve, j’ai réalisé quelque chose : sa vie méritait un livre. Nous voulions qu’elle l’écrive, mais c’était trop compliqué pour elle. Écrire demande du temps, de l’énergie, et une certaine aisance avec les mots.
            </p>
            <p>
              C’est là que l’idée de Loomina est née. <strong>Et si on pouvait simplement parler ?</strong> Si la technologie pouvait transformer nos conversations en un vrai livre, sans effort ?
            </p>
            <p>
              Aujourd’hui, son livre trône dans notre salon. C’est devenu notre trésor familial, et la raison pour laquelle Loomina existe.
            </p>
          </div>
        </div>
      </Section>

      {/* Valeurs */}
      <Section>
        <SectionHeading align="left" title="Nos engagements" />
        <dl className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-[var(--hairline)] shadow-[0_0_0_1px_var(--hairline)] sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <div key={v.title} className="reveal bg-[var(--paper)] p-7 md:p-8">
              <span className="font-serif text-[15px] italic text-[var(--gold-ink)]">0{i + 1}</span>
              <dt className="mt-6 font-serif text-[24px] leading-tight tracking-[-0.01em] text-[var(--ink)]">{v.title}</dt>
              <dd className="mt-3 font-sans text-[16px] leading-relaxed text-[var(--text-secondary)]">{v.desc}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* Qui vous répond */}
      <Section tone="alt">
        <div className="reveal mx-auto max-w-3xl">
          <h2 className="heading-section">Qui vous répond</h2>
          <div className="prose-loomina mt-6">
            <p>
              Loomina est une toute petite équipe. Quand vous écrivez à{" "}
              <a href="mailto:contact@loomina.eu">contact@loomina.eu</a>, c’est moi qui vous lis et qui vous réponds. Les
              entretiens, eux, sont menés par Loomina, une intelligence artificielle que nous avons conçue pour écouter
              patiemment, une question à la fois.
            </p>
            <p>
              Si vous hésitez, le mieux est encore de l’essayer : appelez le{" "}
              <a href="tel:+33159169357">01 59 16 93 57</a> et racontez-lui un souvenir. Trois minutes, gratuitement.
            </p>
          </div>
        </div>
      </Section>

      <div className="pt-8">
        <CtaBand title="Votre histoire" accent="mérite son livre." text="Commandez quand vous êtes prêt, et commencez à raconter dès le jour même." primary={{ href: "/order", label: "Commander" }} secondary={{ href: "/offre", label: "Voir le prix et le détail" }} />
      </div>
    </main>
  );
}
