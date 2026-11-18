/**
 * « De la voix à la page » : ce que la personne dit, puis ce que Loomina écrit.
 * Exemple écrit pour illustrer la méthode, présenté comme tel.
 */

import { Section, SectionHead } from "@/components/ui/Section";
import Icon from "@/components/ui/Icon";
import PrintedPage from "@/components/ui/PrintedPage";

/** Hauteurs (en %) des barres de la voix, sous la conversation. */
const WAVE = [30, 55, 80, 45, 100, 65, 35, 75, 95, 50, 28, 70, 90, 40, 60, 85, 38, 66, 48, 92, 58, 34, 78, 52, 88, 42, 62, 30, 72, 46, 84, 36, 68, 96, 44, 74, 32, 56, 82, 40];

const SPOKEN = [
  { who: "Loomina", text: "Vous m’avez dit que vous étiez partie de la ferme à dix-huit ans. Comment s’est passé le départ ?" },
  {
    who: "Jeanne",
    text: "Par le car de six heures. Mon père a porté ma valise jusqu’à la route, il a rien dit, hein. Il m’a juste mis un mouchoir dans la main, avec trois billets dedans. Le mouchoir, je l’ai toujours. Les billets, non !",
  },
  { who: "Loomina", text: "Et en arrivant à Lyon, où avez-vous logé ?" },
  {
    who: "Jeanne",
    text: "Une chambre sous les toits, rue de la Charité. Toute petite, on touchait les deux murs. Mais c’était la mienne.",
  },
];

export function BookPage({ chapter, title, children, page }: { chapter: string; title: string; children: React.ReactNode; page?: string }) {
  return (
    <div className="card h-full px-7 py-10 sm:px-12 sm:py-12">
      <p className="text-center text-[14px] font-bold text-[var(--amber-ink)]">{chapter}</p>
      <p className="mt-2 text-center font-serif text-[26px] italic leading-tight text-[var(--ink)]">{title}</p>
      <div className="book-text mt-8" lang="fr">
        {children}
      </div>
      {page && <p className="mt-8 text-center font-serif text-[14px] text-[var(--ink-3)]">{page}</p>}
    </div>
  );
}

export default function VoiceToPage() {
  return (
    <Section id="exemple" className="bg-white">
      <SectionHead
        title="De l’appel à la page du livre"
        text="À gauche, un extrait de conversation. À droite, la page que Loomina en tire : vos souvenirs et vos expressions, mis en forme, sans rien inventer."
      />

      <div className="head-gap grid items-stretch gap-4 lg:grid-cols-2" data-reveal>
        <figure className="flex flex-col rounded-[28px] bg-[var(--canvas)] p-5 sm:p-8">
          <figcaption className="flex items-center gap-3 text-[15px] font-bold">
            <span className="chip-icon !h-9 !w-9 !rounded-[12px]">
              <Icon name="phone" size={18} />
            </span>
            Au téléphone
            <span className="ml-auto font-semibold tabular-nums text-[var(--ink-3)]">Appel n° 6 · 14:32</span>
          </figcaption>
          <ul className="my-auto flex flex-col gap-4 py-8">
            {SPOKEN.map((line, i) => {
              const isLoomina = line.who === "Loomina";
              return (
                <li key={i} className={`max-w-[86%] ${isLoomina ? "self-start" : "self-end"}`}>
                  <p className={`text-[13px] font-bold ${isLoomina ? "text-[var(--ink-3)]" : "text-right text-[var(--amber-ink)]"}`}>{line.who}</p>
                  <p
                    className={`mt-1 rounded-[20px] px-4 py-3 text-[17px] leading-relaxed ${
                      isLoomina ? "rounded-tl-md bg-white text-[var(--ink-2)]" : "rounded-tr-md bg-[var(--ink)] text-white"
                    }`}
                  >
                    {line.text}
                  </p>
                </li>
              );
            })}
          </ul>
          <div aria-hidden="true" className="flex h-8 items-center justify-between">
            {WAVE.map((h, i) => (
              <span key={i} className="w-[4px] rounded-full bg-[var(--amber)]" style={{ height: `${h}%` }} />
            ))}
          </div>
        </figure>

        <figure>
          <figcaption className="sr-only">Dans le livre</figcaption>
          <PrintedPage chapter="Chapitre 4" title="Le car de six heures" page="58">
            <p>
              Je suis partie de la ferme à dix-huit ans, par le car de six heures. Mon père a porté ma valise jusqu’à la route sans
              dire un mot. Au moment de monter, il m’a glissé dans la main un mouchoir noué, avec trois billets dedans.
            </p>
            <p>Les billets n’ont pas duré longtemps. Le mouchoir, lui, est toujours dans mon tiroir.</p>
            <h4>Rue de la Charité</h4>
            <p>
              À Lyon, j’ai trouvé une chambre sous les toits, rue de la Charité. Elle était si petite qu’en tendant les bras, je
              touchais les deux murs. Mais c’était la mienne.
            </p>
          </PrintedPage>
        </figure>
      </div>
    </Section>
  );
}
