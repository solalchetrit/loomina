import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { Section, SectionHead } from "@/components/ui/Section";
import { OFFER } from "@/config/offer";

type Cell = { ok: boolean; text: string };

/** Comparaison honnête, en ordres de grandeur, sans chiffre inventé pour les autres options. */
const ROWS: { label: string; alone: Cell; biographer: Cell; loomina: Cell }[] = [
  {
    label: "Ce que vous faites",
    alone: { ok: false, text: "Vous écrivez tout" },
    biographer: { ok: true, text: "Vous parlez" },
    loomina: { ok: true, text: "Vous parlez" },
  },
  {
    label: "Quand",
    alone: { ok: true, text: "Quand vous trouvez le temps" },
    biographer: { ok: false, text: "Sur rendez-vous" },
    loomina: { ok: true, text: "Quand vous voulez, au téléphone" },
  },
  {
    label: "Relecture",
    alone: { ok: false, text: "À trouver soi-même" },
    biographer: { ok: true, text: "Oui" },
    loomina: { ok: true, text: "Par notre équipe, avant l’impression" },
  },
  {
    label: "Prix",
    alone: { ok: true, text: "Gratuit, si l’on va au bout" },
    biographer: { ok: false, text: "Plusieurs milliers d’euros" },
    loomina: { ok: true, text: `${OFFER.price} €, livre compris` },
  },
];

function Value({ cell, strong = false }: { cell: Cell; strong?: boolean }) {
  return (
    <span className={`flex items-start gap-2 ${strong ? "font-bold text-[var(--ink)]" : "text-[var(--ink-2)]"}`}>
      <Icon
        name={cell.ok ? "check" : "plus"}
        size={18}
        className={`mt-[3px] shrink-0 ${cell.ok ? "text-[var(--amber-ink)]" : "rotate-45 text-[var(--ink-3)]"}`}
      />
      <span>
        <span className="sr-only">{cell.ok ? "Oui : " : "Non : "}</span>
        {cell.text}
      </span>
    </span>
  );
}

export default function Compare() {
  return (
    <Section id="comparer" className="bg-white">
      <SectionHead
        title="Écrire seul, un biographe, ou Loomina ?"
        text="Trois façons d’obtenir le livre d’une vie. Ligne par ligne, voici ce qui change pour vous."
      />
      <ul className="mt-10 space-y-3 md:hidden">
        {ROWS.map((r) => (
          <li key={r.label} className="rounded-[20px] border border-[var(--line)] p-5">
            <p className="text-[15px] font-bold text-[var(--ink-3)]">{r.label}</p>
            <dl className="mt-3 space-y-2 text-[16px]">
              {(
                [
                  ["Écrire seul", r.alone],
                  ["Un biographe", r.biographer],
                  ["Loomina", r.loomina],
                ] as const
              ).map(([who, cell]) => (
                <div key={who} className={`flex gap-3 ${who === "Loomina" ? "rounded-[12px] bg-[#fdf3e4] p-2 -mx-2" : ""}`}>
                  <dt className="w-28 shrink-0 font-semibold">{who}</dt>
                  <dd>
                    <Value cell={cell} strong={who === "Loomina"} />
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      <div className="mt-10 hidden overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] md:block">
        <table className="w-full border-collapse text-left text-[16px]">
          <caption className="sr-only">Écrire seul, un biographe ou Loomina</caption>
          <thead>
            <tr className="bg-[var(--canvas)]">
              <th scope="col" className="w-[22%] px-5 py-4 font-bold text-[var(--ink-3)]">
                <span className="sr-only">Critère</span>
              </th>
              <th scope="col" className="px-5 py-4 font-bold">Écrire seul</th>
              <th scope="col" className="px-5 py-4 font-bold">Un biographe</th>
              <th scope="col" className="bg-[var(--ink)] px-5 py-4 font-bold text-white">
                <span className="inline-flex items-center gap-2">
                  Loomina
                  <span className="pill bg-[var(--amber)] text-[var(--ink)]">Le plus simple</span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.label} className="border-t border-[var(--line-soft)]">
                <th scope="row" className="px-5 py-4 font-bold">
                  {r.label}
                </th>
                <td className="px-5 py-4">
                  <Value cell={r.alone} />
                </td>
                <td className="px-5 py-4">
                  <Value cell={r.biographer} />
                </td>
                <td className="bg-[#fdf3e4] px-5 py-4">
                  <Value cell={r.loomina} strong />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/order" size="lg">
          Commander mon livre
        </Button>
        <Button href="/offre" variant="secondary" size="lg">
          Ce que couvre le prix
        </Button>
      </div>
    </Section>
  );
}
