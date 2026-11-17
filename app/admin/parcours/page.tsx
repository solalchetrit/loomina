import { requireAdmin } from "@/lib/admin/auth";
import { ORDER_TREE, AUTHOR_TREE } from "@/lib/admin/journeys";
import OrgTree, { Legend } from "@/components/admin/OrgTree";
import { PageHeader, Panel } from "@/components/admin/ui";

export const metadata = { title: "Parcours" };

export default async function AdminJourneys() {
  await requireAdmin();
  return (
    <div>
      <PageHeader eyebrow="Parcours" title="Ce que vit le client, étape par étape">
        Chaque arbre se lit de haut en bas. Les cases côte à côte sont des chemins possibles. Cliquez sur une case pour voir ce qu’elle produit.
      </PageHeader>

      <div className="mb-8"><Legend /></div>

      <div className="grid grid-cols-1 gap-8">
        <Panel id="commande" icon="card" title="Arbre 1 · La commande">
          <OrgTree stages={ORDER_TREE} />
        </Panel>
        <Panel id="ecriture" icon="book" title="Arbre 2 · Le livre s’écrit">
          <OrgTree stages={AUTHOR_TREE} />
        </Panel>
      </div>
    </div>
  );
}
