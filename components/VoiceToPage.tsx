/**
 * « De la voix à la page » : ce que la personne dit, puis ce que Loomina écrit.
 * Exemple écrit pour illustrer la méthode, présenté comme tel.
 */

import { Section, SectionHead } from "@/components/ui/Section";
import Icon from "@/components/ui/Icon";

const SPOKEN = [
  { who: "Loomina", text: "Vous me parliez de la ferme de vos grands-parents. Qu’est-ce qu’on voyait en entrant dans la cour ?" },
  {
    who: "Jeanne",
    text: "Oh, le tilleul. Un grand tilleul, énorme… Ma grand-mère faisait sécher les fleurs dessous, sur des draps. Ça sentait jusque dans la cuisine. Et le samedi, elle faisait le pain, alors là ça sentait le pain et le tilleul, les deux.",
  },
  { who: "Loomina", text: "Vous l’aidiez, pour le pain ?" },
  {
    who: "Jeanne",
    text: "J’avais le droit de façonner la petite boule. La mienne. Elle la marquait d’une croix avec le couteau pour qu’on la reconnaisse.",
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
        eyebrow="De la voix à la page"
        title="Vous parlez comme vous parlez, le livre garde votre voix"
        text="À gauche, un moment d’appel. À droite, ce qu’il devient dans le livre : mis en forme, sans rien ajouter que vous n’ayez dit."
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-2">
        <figure className="flex flex-col rounded-[var(--radius-card)] bg-[var(--canvas)] p-5 sm:p-7">
          <figcaption className="flex items-center gap-3 text-[15px] font-bold">
            <span className="chip-icon !h-9 !w-9 !rounded-[12px]">
              <Icon name="phone" size={18} />
            </span>
            Au téléphone
          </figcaption>
          <ul className="mt-6 flex flex-1 flex-col gap-3">
            {SPOKEN.map((line, i) => {
              const isLoomina = line.who === "Loomina";
              return (
                <li key={i} className={`max-w-[88%] ${isLoomina ? "self-start" : "self-end"}`}>
                  <p className={`text-[13px] font-bold ${isLoomina ? "text-[var(--ink-3)]" : "text-right text-[var(--amber-ink)]"}`}>{line.who}</p>
                  <p
                    className={`mt-1 rounded-[20px] px-4 py-3 text-[16px] leading-relaxed ${
                      isLoomina ? "rounded-tl-md bg-white text-[var(--ink-2)]" : "rounded-tr-md bg-[var(--ink)] text-white"
                    }`}
                  >
                    {line.text}
                  </p>
                </li>
              );
            })}
          </ul>
        </figure>

        <figure className="flex flex-col">
          <figcaption className="sr-only">Dans le livre</figcaption>
          <BookPage chapter="Chapitre 2" title="La cour au tilleul" page="27">
            <p>
              <span className="dropcap">E</span>n entrant dans la cour, on ne voyait que lui : un tilleul immense. Ma grand-mère faisait sécher ses
              fleurs à son pied, étalées sur des draps, et leur odeur montait jusque dans la cuisine.
            </p>
            <p>
              Le samedi, c’était le jour du pain. Le tilleul et le pain chaud se mêlaient alors dans toute la maison. J’avais le droit
              de façonner une petite boule, la mienne, qu’elle marquait d’une croix du bout de son couteau pour qu’on la reconnaisse.
            </p>
          </BookPage>
        </figure>
      </div>

      <p className="t-small mt-6">Exemple écrit pour illustrer la méthode : Jeanne n’est pas une cliente réelle.</p>
    </Section>
  );
}
