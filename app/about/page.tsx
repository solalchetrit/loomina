import { Section, SectionHeading, PageHeader } from "@/components/ui/Section";
import CtaBand from "@/components/CtaBand";

const VALUES = [
  { title: "Authenticité", desc: "Nous capturons votre voix, sans filtre ni artifice. Votre histoire, telle que vous la racontez." },
  { title: "Bienveillance", desc: "Chaque conversation est un moment d’écoute attentive, respectueuse de votre rythme." },
  { title: "Transmission", desc: "Chaque vie mérite d’être racontée et transmise aux générations suivantes." },
  { title: "Exigence", desc: "De la technologie à l’impression, aucun compromis sur la qualité." },
];

const MILESTONES = [
  { when: "Le déclic", what: "Ma grand-mère tombe malade. Nous voulons son histoire, elle ne peut pas l’écrire." },
  { when: "Le prototype", what: "Une IA qui appelle, écoute et rédige. Son livre est imprimé." },
  { when: "Loomina", what: "Le service s’ouvre à toutes les familles, avec relecture humaine de chaque chapitre." },
];

export default function AboutPage() {
  return (
    <main className="w-full">
      <PageHeader eyebrow="À propos" title="Tout a commencé" accent="avec ma grand-mère." text="Loomina est née d’un besoin personnel, devenu une mission : permettre à chacun de transmettre son histoire, sans que l’écriture soit un obstacle." />

      {/* Récit fondateur */}
      <Section size="sm">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="reveal">
            {/* Emplacement portrait : remplacer par une vraie photo (public/solal.jpg) */}
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[28px] bg-[var(--loomina-night)] shadow-[inset_0_0_0_1px_var(--hairline)]">
              <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(212,176,106,0.25),transparent_70%)]" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-serif text-[22px] leading-tight text-[var(--ink)]">Solal Chetrit</p>
                <p className="mt-1 font-sans text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--gold-ink)]">Fondateur</p>
              </div>
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

      {/* Mission */}
      <Section tone="alt">
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow reveal">Notre mission</p>
          <blockquote className="reveal mt-6 font-serif text-[clamp(1.75rem,4vw,3rem)] leading-[1.2] tracking-[-0.025em] text-[var(--ink)]">
            Permettre à chaque personne de <em className="text-[var(--gold-ink)]">transmettre son histoire</em>, sans que l’écriture ne soit un obstacle.
          </blockquote>
          <div className="reveal prose-loomina mx-auto mt-10 max-w-2xl text-left sm:text-center">
            <p>
              Que vous soyez grand-parent, parent, ou simplement quelqu’un qui a une histoire à partager, Loomina est là pour vous. Notre technologie n’est qu’un outil au service d’une mission plus grande : <strong>préserver la mémoire humaine</strong> et créer des ponts entre les générations.
            </p>
          </div>
        </div>
      </Section>

      {/* Valeurs */}
      <Section>
        <SectionHeading align="left" eyebrow="Ce qui nous guide" title="Quatre" accent="principes." />
        <dl className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-[var(--hairline)] shadow-[0_0_0_1px_var(--hairline)] sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <div key={v.title} className="reveal bg-[var(--paper)] p-7 md:p-8">
              <span className="font-serif text-[15px] italic text-[var(--gold-ink)]">0{i + 1}</span>
              <dt className="mt-6 font-serif text-[26px] leading-tight tracking-[-0.02em] text-[var(--ink)]">{v.title}</dt>
              <dd className="mt-3 font-sans text-[15px] leading-relaxed text-[var(--text-secondary)]">{v.desc}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* Vision + équipe */}
      <Section tone="alt">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="reveal">
            <p className="eyebrow">L’avenir</p>
            <h2 className="heading-section mt-4">
              Une bibliothèque d’histoires <em className="text-[var(--gold-ink)]">dans chaque famille.</em>
            </h2>
            <div className="prose-loomina mt-6">
              <p>
                Dans un monde où les souvenirs se perdent dans le flux numérique, nous voulons créer quelque chose de <strong>tangible et durable</strong>. Un futur où les petits-enfants découvrent la vie de leurs grands-parents non pas à travers des anecdotes éparses, mais dans un récit complet.
              </p>
              <p>
                Loomina n’est que le début : intégration de photos, d’enregistrements audio, livres collaboratifs familiaux… Notre ambition est de devenir la référence de la transmission des histoires de vie.
              </p>
            </div>
          </div>
          <div className="reveal card rounded-3xl p-7 md:p-8">
            <p className="eyebrow">L’équipe</p>
            <p className="mt-4 font-serif text-[26px] leading-tight tracking-[-0.02em] text-[var(--ink)]">Une petite équipe, dédiée à votre histoire.</p>
            <ul className="mt-6 divide-y divide-[var(--hairline)] font-sans">
              <li className="flex items-center gap-4 py-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ink)] font-serif text-lg text-[var(--loomina-gold-light)]">S</span>
                <span>
                  <span className="block text-[16px] font-semibold text-[var(--ink)]">Solal Chetrit</span>
                  <span className="block text-[14px] text-[var(--text-muted)]">Fondateur · produit, IA et relation clients</span>
                </span>
              </li>
              <li className="py-4 text-[15px] leading-relaxed text-[var(--text-secondary)]">
                Nous collaborons avec des rédacteurs professionnels, des designers et des imprimeurs de confiance pour garantir la qualité de chaque livre.
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <div className="pt-8">
        <CtaBand title="Prêt à écrire" accent="votre histoire ?" text="Rejoignez les familles qui ont choisi Loomina pour préserver leurs souvenirs." primary={{ href: "/offre", label: "Découvrir l’offre" }} secondary={{ href: "/contact", label: "Nous contacter" }} />
      </div>
    </main>
  );
}
