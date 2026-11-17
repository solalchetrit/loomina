import { requireAdmin } from "@/lib/admin/auth";
import { MAP_GROUPS, MAP_ROOTS, MAP_LINKS } from "@/lib/admin/map";
import MapTree from "@/components/admin/MapTree";

export const metadata = { title: "La carte" };

export default async function AdminMap() {
  await requireAdmin();
  return (
    <div>
<header className="mb-6">
        <p className="t-eyebrow">La carte</p>
        <h1 className="t-title mt-2">Tout Loomina sur un seul arbre</h1>
        <p className="t-body mt-2 max-w-3xl">Chaque colonne est un domaine, chaque case une étape, de haut en bas. Les cases en pointillés rouges sont ce qui manque encore.</p>
      </header>
      <MapTree groups={MAP_GROUPS} roots={MAP_ROOTS} links={MAP_LINKS} />
    </div>
  );
}
