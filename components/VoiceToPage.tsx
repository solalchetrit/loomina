/**
 * « De la voix à la page » : ce que la personne dit, puis ce que Loomina écrit.
 * Exemple écrit pour illustrer la méthode, présenté comme tel.
 */

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
    <div className="bg-white px-7 py-10 shadow-[0_0_0_1px_var(--rule),0_30px_60px_-44px_rgba(27,25,21,0.45)] sm:px-12 sm:py-14">
      <p className="text-center font-sans text-[12px] font-semibold uppercase tracking-[0.28em] text-[var(--gold-ink)]">{chapter}</p>
      <p className="mt-3 text-center font-serif text-[26px] italic leading-tight text-[var(--ink)]">{title}</p>
      <span className="gold-dash mx-auto mt-6" />
      <div className="book-text mt-8" lang="fr">
        {children}
      </div>
      {page && <p className="mt-8 text-center font-serif text-[14px] text-[var(--ink-3)]">— {page} —</p>}
    </div>
  );
}

export default function VoiceToPage() {
  return (
    <section id="exemple" className="w-full scroll-mt-24 bg-[var(--paper-deep)] py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="t-eyebrow">De la voix à la page</p>
          <h2 className="t-title mt-4">Vous parlez comme vous parlez. Le livre garde votre voix.</h2>
          <span aria-hidden="true" className="gold-dash mt-6" />
          <p className="t-lead mt-6 max-w-xl">
            À gauche, un moment d’appel. À droite, ce qu’il devient dans le livre : mis en forme, sans rien ajouter que vous
            n’ayez dit.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <figure className="flex flex-col">
            <figcaption className="t-eyebrow !text-[var(--ink-3)]">Au téléphone</figcaption>
            <div className="rule-top mt-4 flex-1 space-y-5 pt-6">
              {SPOKEN.map((line, i) => (
                <p key={i} className="t-body grid grid-cols-[5.5rem_1fr] gap-3">
                  <span className={`font-semibold ${line.who === "Loomina" ? "text-[var(--ink-3)]" : "text-[var(--ink)]"}`}>{line.who}</span>
                  <span className={line.who === "Loomina" ? "text-[var(--ink-3)]" : ""}>{line.text}</span>
                </p>
              ))}
            </div>
          </figure>

          <figure className="flex flex-col">
            <figcaption className="t-eyebrow !text-[var(--ink-3)]">Dans le livre</figcaption>
            <div className="mt-4 flex-1">
              <BookPage chapter="Chapitre II" title="La cour au tilleul" page="27">
                <p>
                  <span className="dropcap">E</span>n entrant dans la cour, on ne voyait que lui : un tilleul immense. Ma grand-mère faisait sécher
                  ses fleurs à son pied, étalées sur des draps, et leur odeur montait jusque dans la cuisine.
                </p>
                <p>
                  Le samedi, c’était le jour du pain. Le tilleul et le pain chaud se mêlaient alors dans toute la maison. J’avais
                  le droit de façonner une petite boule, la mienne, qu’elle marquait d’une croix du bout de son couteau pour
                  qu’on la reconnaisse.
                </p>
              </BookPage>
            </div>
          </figure>
        </div>

        <p className="t-small mt-8">Exemple écrit pour illustrer la méthode : Jeanne n’est pas une cliente réelle.</p>
      </div>
    </section>
  );
}
