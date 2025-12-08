import MagicButton from "./ui/MagicButton";

export default function Hero() {
  return (
    <section
      className="section-shell relative w-full overflow-hidden bg-[var(--loomina-cloud)] px-6"
      id="top"
    >
      <div className="mx-auto max-w-6xl">
        <div className="relative grid gap-10 overflow-hidden rounded-[30px] border border-[var(--loomina-outline)] bg-gradient-to-br from-white via-[var(--loomina-cloud)] to-[var(--loomina-sand)] p-8 shadow-[0_30px_80px_-60px_rgba(15,17,21,0.65)] md:grid-cols-[1.05fr,0.95fr] md:p-12">
          {/* Commentaire : structure bi-colonne pour clarifier texte + visuel */}
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full bg-[var(--loomina-surface)] px-4 py-2 text-sm font-semibold text-[var(--loomina-ink)] border border-[var(--loomina-outline)] shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--loomina-amber-strong)]" />
              ✨ Vos souvenirs méritent d'être éternels
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--loomina-muted)]">
                BIOGRAPHIE VOCALE & ÉDITION D'ART
              </p>
              <h1 className="text-4xl font-semibold leading-[1.05] text-[var(--loomina-ink)] md:text-5xl">
                Votre vie devient un livre. Sans jamais l'écrire.
              </h1>
            </div>

            <p className="max-w-2xl text-lg leading-relaxed text-[var(--loomina-ink-soft)]">
              Ne laissez pas vos souvenirs s'effacer. Parlez-nous simplement au téléphone : nous transformons vos paroles en un magnifique ouvrage relié, corrigé par des experts et prêt à être transmis.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <MagicButton
                href="#offres"
                className="w-full justify-center bg-[var(--loomina-forest)] text-white shadow-[0_24px_70px_-50px_rgba(31,51,40,0.8)]"
              >
                Commencer mon récit
              </MagicButton>
              <MagicButton
                href="tel:+33756830514"
                variant="secondary"
                className="w-full justify-center border-[var(--loomina-outline)] bg-[var(--loomina-surface)] text-[var(--loomina-ink)]"
              >
                📞 Appeler Loomina
              </MagicButton>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-sm font-semibold text-[var(--loomina-muted)]">
              <span>3 semaines pour recevoir votre livre</span>
              <span className="hidden h-4 w-px bg-[var(--loomina-outline)] sm:block" />
              <span>Aucune écriture nécessaire</span>
              <span className="hidden h-4 w-px bg-[var(--loomina-outline)] sm:block" />
              <span>Relecture 100% humaine</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[var(--loomina-amber-veil)] blur-3xl" />
            <div className="absolute -right-14 bottom-0 h-56 w-56 rounded-full bg-[var(--loomina-forest-veil)] blur-3xl" />

            <div className="relative overflow-hidden rounded-[24px] border border-[var(--loomina-outline)] bg-[var(--loomina-surface)]/90 p-6 shadow-[0_30px_70px_-60px_rgba(15,17,21,0.55)] backdrop-blur">
              {/* Commentaire : encart visuel qui ancre le hero dans un bloc tangible */}
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-[var(--loomina-muted)]">
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--loomina-cloud)] px-3 py-1 border border-[var(--loomina-outline)]">
                  Edition d'art
                </span>
                <span className="text-[var(--loomina-amber-strong)]">Loomina</span>
              </div>

              <div className="mt-6 space-y-4">
                <p className="text-xl font-semibold text-[var(--loomina-ink)]">Un livre relié, façonné pour durer</p>
                <p className="text-base leading-relaxed text-[var(--loomina-ink-soft)]">
                  Interviews guidés, réécriture humaine, maquette élégante et livraison de 5 exemplaires premium avec leur version numérique sécurisée.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-[var(--loomina-outline)] bg-[var(--loomina-cloud)]/70 p-4 text-sm">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--loomina-muted)]">Délais moyens</p>
                  <p className="text-lg font-semibold text-[var(--loomina-ink)]">3 semaines</p>
                  <p className="text-[13px] text-[var(--loomina-ink-soft)]">Appel, écriture guidée, maquette, impression.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--loomina-muted)]">Accompagnement</p>
                  <p className="text-lg font-semibold text-[var(--loomina-ink)]">100% humain</p>
                  <p className="text-[13px] text-[var(--loomina-ink-soft)]">Pas de plateforme complexe, un seul interlocuteur.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
