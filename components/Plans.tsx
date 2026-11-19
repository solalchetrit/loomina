import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { Section, SectionHead } from "@/components/ui/Section";
import { OFFER } from "@/config/offer";

/**
 * TABLEAU COMPARATIF DE PLUSIEURS SERVICES (formules et prix).
 * Mis de côté le 17/11/2026 à la demande de Solal : il n'est affiché sur aucune page pour l'instant.
 * Pour le remettre : `import Plans from "@/components/Plans"` puis `<Plans />` dans app/offre/page.tsx,
 * sous le haut de page.
 *
 * Pour ajouter ou modifier une formule : PLANS (une colonne par formule) et ROWS
 * (une ligne par critère, une valeur par formule, dans le même ordre).
 * `draft: true` marque une formule pas encore décidée : elle s'affiche en pointillés, sans bouton.
 */
type Plan = { name: string; price: string; note: string; featured?: boolean; draft?: boolean };
type Cell = true | false | string;

const PLANS: Plan[] = [
  { name: OFFER.name, price: `${OFFER.price} ${OFFER.currencySymbol}`, note: "Paiement unique, sans abonnement", featured: true },
  { name: "Formule 2", price: "Prix à définir", note: "Options à définir", draft: true },
  { name: "Formule 3", price: "Prix à définir", note: "Options à définir", draft: true },
];

const TBD = "À définir";

const ROWS: { label: string; values: Cell[] }[] = [
  { label: "Entretiens par téléphone", values: ["Autant qu’il vous faut", TBD, TBD] },
  { label: "Récit de chaque appel, à relire et corriger", values: [true, TBD, TBD] },
  { label: "Relecture par notre équipe", values: [true, TBD, TBD] },
  { label: "Vos photos dans le livre", values: [true, TBD, TBD] },
  { label: "Livre imprimé", values: [OFFER.format, TBD, TBD] },
  { label: "Exemplaires imprimés", values: ["1 exemplaire", TBD, TBD] },
  { label: "Version numérique", values: [OFFER.digital, TBD, TBD] },
  { label: "Livraison", values: [OFFER.delivery, TBD, TBD] },
];

function Value({ cell, muted }: { cell: Cell; muted?: boolean }) {
  if (cell === true) {
    return (
      <span className="inline-flex items-center gap-2 font-semibold">
        <Icon name="check" size={18} className="text-[var(--amber-ink)]" />
        Compris
      </span>
    );
  }
  if (cell === false) return <span className="text-[var(--ink-3)]">Non compris</span>;
  return <span className={muted ? "text-[var(--ink-3)]" : "font-semibold"}>{cell}</span>;
}

export default function Plans() {
  return (
    <Section id="formules">
      <SectionHead title="Comparez les formules" text="Ce que chaque formule comprend, ligne par ligne." />

      {/* Téléphone : une carte par formule. */}
      <ul className="head-gap space-y-4 lg:hidden">
        {PLANS.map((p, i) => (
          <li
            key={p.name}
            className={`rounded-[var(--radius-card)] p-6 ${p.draft ? "border border-dashed border-[var(--line)]" : "border border-[var(--ink)] bg-[var(--amber-wash)]"}`}
          >
            <p className="text-[18px] font-extrabold">{p.name}</p>
            <p className={`mt-1 font-extrabold tracking-[-0.03em] ${p.draft ? "text-[20px] text-[var(--ink-3)]" : "text-[40px] leading-none"}`}>{p.price}</p>
            <p className="t-small mt-2">{p.note}</p>
            <dl className="mt-5 space-y-3 text-[16px]">
              {ROWS.map((r) => (
                <div key={r.label}>
                  <dt className="text-[14px] text-[var(--ink-3)]">{r.label}</dt>
                  <dd>
                    <Value cell={r.values[i]} muted={p.draft} />
                  </dd>
                </div>
              ))}
            </dl>
            {!p.draft && (
              <Button href="/order" size="lg" className="mt-6 w-full">
                Commander
              </Button>
            )}
          </li>
        ))}
      </ul>

      {/* Ordinateur : le tableau. */}
      <div className="head-gap hidden overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] lg:block" data-reveal>
        <table className="w-full table-fixed border-collapse text-left text-[16px]">
          <caption className="sr-only">Comparaison des formules Loomina</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[25%] bg-[var(--canvas)] px-6 py-6 align-bottom text-[15px] font-bold text-[var(--ink-3)]">
                Ce qui est compris
              </th>
              {PLANS.map((p) => (
                <th key={p.name} scope="col" className={`px-6 py-6 align-top ${p.featured ? "bg-[var(--ink)] text-white" : "bg-[var(--canvas)]"}`}>
                  <span className="flex items-center gap-2 text-[17px] font-extrabold">
                    {p.name}
                    {p.draft && <span className="pill pill-neutral">À définir</span>}
                  </span>
                  <span
                    className={`mt-2 block font-extrabold tracking-[-0.04em] ${
                      p.draft ? "text-[20px] text-[var(--ink-3)]" : "text-[44px] leading-none text-[var(--amber)]"
                    }`}
                  >
                    {p.price}
                  </span>
                  <span className={`mt-2 block text-[14px] font-medium ${p.featured ? "text-[#cfcfc8]" : "text-[var(--ink-3)]"}`}>{p.note}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.label} className="border-t border-[var(--line-soft)]">
                <th scope="row" className="px-6 py-4 font-bold">
                  {r.label}
                </th>
                {PLANS.map((p, i) => (
                  <td key={p.name} className={`px-6 py-4 ${p.featured ? "bg-[var(--amber-wash)]" : ""}`}>
                    <Value cell={r.values[i]} muted={p.draft} />
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-[var(--line-soft)]">
              <td className="px-6 py-5" />
              {PLANS.map((p) => (
                <td key={p.name} className={`px-6 py-5 ${p.featured ? "bg-[var(--amber-wash)]" : ""}`}>
                  {!p.draft && (
                    <Button href="/order" size="lg">
                      Commander
                    </Button>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="t-small mt-5">
        Toutes les formules : satisfait ou remboursé sous {OFFER.guaranteeDays} jours après le premier entretien.
      </p>
    </Section>
  );
}
