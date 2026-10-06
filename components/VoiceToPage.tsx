/**
 * « De la voix à la page » : ce que la personne dit, puis ce que Loomina écrit.
 * Exemple fictif, présenté comme tel : aucune cliente réelle n'est citée.
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

export default function VoiceToPage() {
  return (
    <section id="exemple" className="w-full scroll-mt-24 bg-[var(--loomina-night)] py-24 md:py-32">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6">
        <div className="reveal max-w-2xl">
          <h2 className="font-serif text-[clamp(2.1rem,4vw,3.25rem)] leading-[1.08] tracking-[-0.02em] text-[var(--ink)]">
            Vous parlez comme vous parlez. Le livre garde votre voix.
          </h2>
          <p className="mt-5 font-sans text-[17px] leading-relaxed text-[var(--text-secondary)]">
            À gauche, un moment d’appel. À droite, ce qu’il devient dans le livre : mis en forme, sans rien ajouter que
            vous n’ayez dit.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-10">
          {/* L'appel */}
          <figure className="reveal flex flex-col">
            <figcaption className="font-sans text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Au téléphone
            </figcaption>
            <div className="mt-4 flex-1 space-y-5 border-l-2 border-[var(--hairline-strong)] pl-5 md:pl-7">
              {SPOKEN.map((line, i) => (
                <p key={i} className="font-sans text-[17px] leading-[1.7]">
                  <span
                    className={`mr-2 font-semibold ${line.who === "Loomina" ? "text-[var(--text-muted)]" : "text-[var(--ink)]"}`}
                  >
                    {line.who}
                  </span>
                  <span className={line.who === "Loomina" ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"}>
                    {line.text}
                  </span>
                </p>
              ))}
            </div>
          </figure>

          {/* La page */}
          <figure className="reveal flex flex-col">
            <figcaption className="font-sans text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              Dans le livre
            </figcaption>
            <div className="mt-4 flex-1 rounded-[4px] bg-[var(--paper)] px-7 py-10 shadow-[0_1px_0_var(--hairline),0_30px_60px_-40px_rgba(26,24,21,0.35)] sm:px-12 sm:py-14">
              <p className="text-center font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--gold-ink)]">
                Chapitre II
              </p>
              <p className="mt-3 text-center font-serif text-[26px] italic leading-tight text-[var(--ink)]">La cour au tilleul</p>
              <div className="mx-auto mt-6 h-px w-10 bg-[var(--loomina-gold)]/60" />
              <div className="mt-8 space-y-4 font-serif text-[18px] leading-[1.65] text-[var(--ink-soft)] [hyphens:auto]" lang="fr">
                <p>
                  <span className="float-left mr-2 mt-1 font-serif text-[3.4em] leading-[0.8] text-[var(--gold-ink)]">E</span>
                  n entrant dans la cour, on ne voyait que lui : un tilleul immense. Ma grand-mère faisait sécher ses fleurs
                  à son pied, étalées sur des draps, et leur odeur montait jusque dans la cuisine.
                </p>
                <p className="indent-6">
                  Le samedi, c’était le jour du pain. Le tilleul et le pain chaud se mêlaient alors dans toute la maison.
                  J’avais le droit de façonner une petite boule, la mienne, qu’elle marquait d’une croix du bout de son
                  couteau pour qu’on la reconnaisse.
                </p>
              </div>
              <p className="mt-8 text-center font-serif text-[13px] text-[var(--text-muted)]">— 27 —</p>
            </div>
          </figure>
        </div>

        <p className="mt-6 font-sans text-[13px] text-[var(--text-muted)]">
          Exemple écrit pour illustrer la méthode : Jeanne n’est pas une cliente réelle.
        </p>
      </div>
    </section>
  );
}
