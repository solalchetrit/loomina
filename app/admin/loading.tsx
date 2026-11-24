/**
 * Ce qui s'affiche à l'instant du clic sur une rubrique, pendant que la page
 * se prépare : la colonne et la barre restent en place, le contenu arrive.
 */
export default function AdminLoading() {
  const bar = "rounded-[6px] bg-[var(--canvas)]";
  return (
    <div className="grid animate-pulse grid-cols-1 gap-[22px]" aria-busy="true" aria-label="Chargement">
      <div className="grid gap-2.5">
        <div className={`${bar} h-7 w-[min(360px,70%)]`} />
        <div className={`${bar} h-4 w-[min(520px,90%)]`} />
      </div>
      <div className="adm-figs">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="adm-fig">
            <div className={`${bar} h-3.5 w-24`} />
            <div className={`${bar} mt-3 h-6 w-16`} />
          </div>
        ))}
      </div>
      <div className="h-[320px] rounded-[10px] border border-[var(--line)] bg-[var(--surface)]" />
    </div>
  );
}
