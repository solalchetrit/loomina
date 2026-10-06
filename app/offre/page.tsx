import { Section, SectionHeading, PageHeader } from "@/components/ui/Section";
import Accordion from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import CtaBand from "@/components/CtaBand";
import { SITE_CONFIG } from "@/app/config";
import { OFFER, INCLUDED as INCLUDED_LIST, GUARANTEE } from "@/config/offer";

const INCLUDED = [
  { title: "Les appels", items: ["Autant d’appels qu’il vous faut", "14 thèmes pour vous guider", "Vous appelez quand vous voulez", "Vos données stockées en Europe, jamais revendues"] },
  { title: "L’écriture", items: ["Un chapitre écrit après chaque appel", "Dans vos mots, sans rien inventer", "Vos corrections, autant que nécessaire", "Chaque page relue par notre équipe"] },
  { title: "Le livre", items: ["Couverture rigide, format 15 × 23 cm", "Vos photos placées dans le texte", "Livraison incluse en France métropolitaine", "Version numérique (PDF et EPUB) pour la famille"] },
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

const FAQ = [
  { q: "Combien de temps dure le processus ?", a: "En moyenne 6 à 8 semaines, mais nous nous adaptons totalement à votre rythme. Certains avancent vite, d’autres prennent leur temps." },
  { q: "Que se passe-t-il si je veux modifier quelque chose ?", a: "Vous validez chaque chapitre avant de passer au suivant. Les modifications sont illimitées jusqu’à votre satisfaction complète." },
  { q: "Puis-je offrir Loomina ?", a: "Oui. À la commande, choisissez « C’est pour offrir » et indiquez le prénom et le numéro de la personne qui racontera. C’est elle qui appellera Loomina, depuis ce numéro." },
  { q: "Mes données sont-elles protégées ?", a: "Vos textes sont stockés en Europe, ne sont jamais revendus et servent uniquement à écrire votre livre. Vous pouvez demander leur suppression à tout moment." },
  { q: "Y a-t-il une garantie ?", a: `Oui. ${GUARANTEE}` },
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
      <PageHeader title="Un prix, tout compris" text="Les entretiens, l’écriture, la relecture, la mise en page, l’impression et la livraison. Pas d’abonnement, rien à payer en plus.">
        {/* Carte prix */}
        <div className="rise mx-auto mt-14 grid max-w-5xl overflow-hidden rounded-[28px] bg-[var(--paper)] shadow-[0_0_0_1px_var(--hairline),0_30px_60px_-40px_rgba(26,24,21,0.35)] lg:grid-cols-[1fr_1.1fr]" style={{ "--i": 2 } as React.CSSProperties}>
          <div className="paper-grain relative flex flex-col justify-between gap-10 bg-[var(--ink)] p-7 text-left sm:p-10 md:p-12">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_0%,rgba(212,176,106,0.22),transparent_70%)]" />
            <div className="relative">
              <h2 className="font-serif text-[28px] leading-tight tracking-[-0.01em] text-[var(--loomina-void)] md:text-[32px]">{OFFER.name}</h2>
              <div className="mt-6 flex items-start gap-1.5">
                <span className="font-serif text-[96px] leading-[0.85] tracking-[-0.04em] text-[var(--loomina-void)] md:text-[112px]">{price}</span>
                <span className="mt-1 font-serif text-3xl text-[var(--loomina-gold-light)]">{SITE_CONFIG.product.currencySymbol}</span>
              </div>
              <p className="mt-5 font-sans text-[15px] text-[#d6cfc2]">Paiement unique par carte, sécurisé par Stripe.</p>
            </div>
            <div className="relative">
              <Button href="/order" variant="primary" size="lg" fullWidth className="!bg-[var(--loomina-void)] !text-[var(--ink)] hover:!bg-white">
                Commander
              </Button>
              <p className="mt-4 text-center font-sans text-[13px] leading-relaxed text-[#d6cfc2]">{GUARANTEE}</p>
            </div>
          </div>
          <div className="p-7 text-left sm:p-10 md:p-12">
            <p className="font-sans text-[14px] font-semibold text-[var(--ink)]">Ce qui est inclus</p>
            <ul className="mt-4 divide-y divide-[var(--hairline)]">
              {INCLUDED_LIST.map((it) => (
                <li key={it.title} className="flex items-start gap-3 py-4">
                  <Check />
                  <span className="font-sans text-[16px] leading-snug text-[var(--ink)]">
                    <span className="block font-semibold">{it.title}</span>
                    <span className="mt-0.5 block text-[var(--text-secondary)]">{it.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageHeader>

      {/* Détail */}
      <Section>
        <SectionHeading title="Ce que couvre le prix, en détail" />
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
        <SectionHeading title="Pourquoi pas un biographe, ou écrire soi-même ?" text="Un biographe coûte plusieurs milliers d’euros. Écrire seul demande des mois. Loomina se situe entre les deux." />
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

      {/* FAQ */}
      <Section tone="alt" size="md">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <SectionHeading align="left" title="Avant de commander" text={<>Toutes les réponses détaillées sont dans la <a href="/faq" className="text-[var(--ink)] underline decoration-[var(--loomina-gold)]/50 underline-offset-4">FAQ complète</a>.</>} />
          <Accordion items={FAQ} className="reveal" />
        </div>
      </Section>

      <div className="pt-8">
        <CtaBand title="Pas encore sûr ?" accent="Essayez trois minutes." text="Appelez le 01 59 16 93 57 et racontez un souvenir à Loomina. C’est gratuit et rien n’est enregistré." primary={{ href: "tel:+33159169357", label: "Appeler le 01 59 16 93 57" }} secondary={{ href: "/order", label: "Commander" }} />
      </div>
    </main>
  );
}
