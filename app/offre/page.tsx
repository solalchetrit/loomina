import { Section, SectionHeading, PageHeader } from "@/components/ui/Section";
import Accordion from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import CtaBand from "@/components/CtaBand";
import { SITE_CONFIG } from "@/app/config";

const INCLUDED = [
  { title: "La collecte", items: ["14 appels thématiques guidés", "Durée adaptée à votre rythme", "Enregistrements chiffrés, hébergés en Europe", "Modifications illimitées à chaque étape"] },
  { title: "La rédaction", items: ["Transformation en prose littéraire", "Relecture par des professionnels", "Respect de votre voix", "Validation chapitre par chapitre"] },
  { title: "Le livre", items: ["Couverture rigide, reliure cousue", "150 à 250 pages personnalisées", "Vos photos intégrées", "Version numérique (ebook) incluse"] },
];

const COMPARE = {
  cols: ["Loomina", "Biographe traditionnel", "Écrire soi-même"],
  rows: [
    { label: "Prix", values: ["449 € tout compris", "2 000 à 8 000 €", "Gratuit, mais…"] },
    { label: "Effort", values: ["Parler au téléphone", "Rendez-vous à planifier", "Des mois d’écriture"] },
    { label: "Délai", values: ["6 à 8 semaines", "6 à 12 mois", "Souvent jamais fini"] },
    { label: "Disponibilité", values: ["Quand vous voulez", "Sur rendez-vous", "Dépend de vous"] },
    { label: "Relecture humaine", values: [true, true, false] },
    { label: "Livre relié livré", values: [true, "Selon le devis", false] },
  ],
};

const TESTIMONIALS = [
  { name: "Marie L.", meta: "68 ans, pour elle-même", text: "J’ai toujours voulu écrire mes mémoires mais je ne savais pas par où commencer. Loomina a rendu cela si simple et naturel." },
  { name: "Jean-Pierre D.", meta: "75 ans, cadeau de sa fille", text: "Les conversations étaient passionnantes. C’est devenu un moment que j’attendais chaque semaine." },
  { name: "Sophie M.", meta: "Pour sa mère, 72 ans", text: "Le plus beau cadeau que j’ai pu faire à ma mère. Maintenant nous avons un trésor familial pour toujours." },
];

const FAQ = [
  { q: "Combien de temps dure le processus ?", a: "En moyenne 6 à 8 semaines, mais nous nous adaptons totalement à votre rythme. Certains avancent vite, d’autres prennent leur temps." },
  { q: "Que se passe-t-il si je veux modifier quelque chose ?", a: "Vous validez chaque chapitre avant de passer au suivant. Les modifications sont illimitées jusqu’à votre satisfaction complète." },
  { q: "Puis-je offrir Loomina en cadeau ?", a: "Oui, c’est même l’un des cadeaux les plus appréciés. Nous fournissons un bon cadeau élégant à offrir." },
  { q: "Mes données sont-elles sécurisées ?", a: "Vos enregistrements et textes sont chiffrés, stockés en Europe et jamais partagés. Vous pouvez demander leur suppression à tout moment." },
  { q: "Y a-t-il une garantie ?", a: "Oui. Si après le premier appel vous n’êtes pas satisfait, nous vous remboursons intégralement, sans question." },
];

const Check = ({ dark = false }: { dark?: boolean }) => (
  <svg className={`h-5 w-5 shrink-0 ${dark ? "text-[var(--loomina-gold-light)]" : "text-[var(--gold-ink)]"}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.57a1 1 0 0 1-1.42 0l-3.5-3.53a1 1 0 1 1 1.42-1.408l2.79 2.814 6.79-6.853a1 1 0 0 1 1.414-.006Z" clipRule="evenodd" />
  </svg>
);

const Cross = () => (
  <svg className="h-5 w-5 shrink-0 text-[var(--text-muted)]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
    <path d="m6 6 8 8M14 6l-8 8" />
  </svg>
);

export default function OffrePage() {
  const price = SITE_CONFIG.product.price;
  return (
    <main className="w-full">
      <PageHeader eyebrow="L’offre" title="Votre Livre de vie," accent="clé en main." text="Un seul forfait, tout compris : de la première conversation au livre relié posé sur votre table.">
        {/* Carte prix */}
        <div className="rise mx-auto mt-14 grid max-w-5xl overflow-hidden rounded-[28px] bg-[var(--paper)] shadow-[0_0_0_1px_var(--hairline),0_30px_60px_-40px_rgba(26,24,21,0.35)] lg:grid-cols-[1fr_1.1fr]" style={{ "--i": 2 } as React.CSSProperties}>
          <div className="paper-grain relative flex flex-col justify-between gap-10 bg-[var(--ink)] p-7 text-left sm:p-10 md:p-12">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_0%,rgba(212,176,106,0.22),transparent_70%)]" />
            <div className="relative">
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--loomina-gold-light)]">
                Forfait unique
              </span>
              <h2 className="mt-5 font-serif text-[28px] leading-tight tracking-[-0.02em] text-[var(--loomina-void)] md:text-[32px]">Le Coffret Biographie Complet</h2>
              <div className="mt-6 flex items-start gap-1.5">
                <span className="font-serif text-[96px] leading-[0.85] tracking-[-0.04em] text-[var(--loomina-void)] md:text-[112px]">{price}</span>
                <span className="mt-1 font-serif text-3xl text-[var(--loomina-gold-light)]">{SITE_CONFIG.product.currencySymbol}</span>
              </div>
              <p className="mt-5 font-sans text-[15px] text-[#cfc8bb]">Paiement unique. Aucun frais caché, aucun abonnement.</p>
            </div>
            <div className="relative">
              <Button href="/order" variant="primary" size="lg" fullWidth className="!bg-[var(--loomina-void)] !text-[var(--ink)] hover:!bg-white">
                Commander ma biographie
              </Button>
              <p className="mt-4 text-center font-sans text-[13px] text-[#cfc8bb]">Satisfait ou remboursé après le premier appel · Paiement sécurisé Stripe</p>
            </div>
          </div>
          <div className="p-7 text-left sm:p-10 md:p-12">
            <p className="eyebrow">Ce qui est inclus</p>
            <ul className="mt-5 divide-y divide-[var(--hairline)]">
              {[
                ["Entretiens illimités", "avec votre biographe IA, à votre rythme"],
                ["Rédaction & corrections", "prose littéraire, relue par des humains"],
                ["Vos photos intégrées", "pour illustrer votre récit"],
                ["Livre relié", "couverture rigide, livré chez vous"],
                ["Version numérique", "ebook privé à partager en famille"],
                ["Bon cadeau", "si vous l’offrez à un proche"],
              ].map(([t, s]) => (
                <li key={t} className="flex items-start gap-3 py-3.5">
                  <Check />
                  <span className="font-sans text-[15px] leading-snug text-[var(--ink)]">
                    <span className="font-semibold">{t}</span>
                    <span className="text-[var(--text-muted)]"> — {s}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageHeader>

      {/* Détail */}
      <Section>
        <SectionHeading eyebrow="En détail" title="Tout est" accent="compris." text="Trois étapes, un seul prix. Voici précisément ce que couvre le forfait." />
        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-[var(--hairline)] shadow-[0_0_0_1px_var(--hairline)] md:grid-cols-3">
          {INCLUDED.map((g, i) => (
            <div key={g.title} className="reveal bg-[var(--paper)] p-7 md:p-8">
              <span className="font-serif text-[15px] italic text-[var(--gold-ink)]">0{i + 1}</span>
              <h3 className="mt-3 font-serif text-[26px] leading-tight tracking-[-0.02em] text-[var(--ink)]">{g.title}</h3>
              <ul className="mt-5 space-y-3">
                {g.items.map((it) => (
                  <li key={it} className="flex items-start gap-2.5 font-sans text-[15px] leading-snug text-[var(--text-secondary)]">
                    <Check /> {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Comparatif */}
      <Section tone="alt">
        <SectionHeading eyebrow="Comparer" title="Pourquoi Loomina," accent="plutôt qu’autre chose ?" text="Un biographe coûte plusieurs milliers d’euros. Écrire seul demande des mois. Loomina prend le meilleur des deux." />
        <div className="reveal mx-auto mt-14 max-w-5xl overflow-x-auto rounded-3xl bg-[var(--paper)] shadow-[0_0_0_1px_var(--hairline)]">
          <table className="w-full min-w-[640px] border-collapse font-sans text-[15px]">
            <thead>
              <tr className="border-b border-[var(--hairline)]">
                <th className="p-5 text-left font-medium text-[var(--text-muted)]">&nbsp;</th>
                {COMPARE.cols.map((c, i) => (
                  <th key={c} className={`p-5 text-left font-serif text-[20px] tracking-[-0.01em] ${i === 0 ? "bg-[var(--loomina-night)] text-[var(--ink)]" : "text-[var(--text-secondary)]"}`}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.rows.map((r) => (
                <tr key={r.label} className="border-b border-[var(--hairline)] last:border-0">
                  <th scope="row" className="p-5 text-left font-medium text-[var(--ink)]">{r.label}</th>
                  {r.values.map((v, i) => (
                    <td key={i} className={`p-5 ${i === 0 ? "bg-[var(--loomina-night)] font-semibold text-[var(--ink)]" : "text-[var(--text-secondary)]"}`}>
                      {v === true ? <Check /> : v === false ? <Cross /> : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-center font-sans text-[13px] text-[var(--text-muted)]">Fourchettes indicatives constatées sur le marché français.</p>
      </Section>

      {/* Témoignages */}
      <Section>
        <SectionHeading eyebrow="Ils nous font confiance" title="Ce qu’en disent" accent="les familles." />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="reveal card flex flex-col justify-between rounded-3xl p-7">
              <blockquote className="font-serif text-[20px] leading-[1.4] tracking-[-0.01em] text-[var(--ink)]">« {t.text} »</blockquote>
              <figcaption className="mt-8 flex items-center gap-3 border-t border-[var(--hairline)] pt-5 font-sans">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ink)] font-serif text-base text-[var(--loomina-gold-light)]">{t.name[0]}</span>
                <span>
                  <span className="block text-[15px] font-semibold text-[var(--ink)]">{t.name}</span>
                  <span className="block text-[13px] text-[var(--text-muted)]">{t.meta}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="alt" size="md">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <SectionHeading align="left" eyebrow="Questions" title="Avant de" accent="commander." text={<>Toutes les réponses détaillées sont dans la <a href="/faq" className="text-[var(--ink)] underline decoration-[var(--loomina-gold)]/50 underline-offset-4">FAQ complète</a>.</>} />
          <Accordion items={FAQ} className="reveal" />
        </div>
      </Section>

      <div className="pt-8">
        <CtaBand title="Prêt à" accent="commencer ?" text="Rejoignez les familles qui ont choisi Loomina pour préserver leurs histoires." secondary={{ href: "/contact", label: "Poser une question" }} />
      </div>
    </main>
  );
}
