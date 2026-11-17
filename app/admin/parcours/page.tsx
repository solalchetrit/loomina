import { requireAdmin } from "@/lib/admin/auth";
import { ORDER_TREE, AUTHOR_TREE } from "@/lib/admin/journeys";
import Tree, { Legend } from "@/components/admin/Tree";
import { Panel } from "@/components/admin/ui";

export const metadata = { title: "Parcours" };

export default async function AdminJourneys() {
  await requireAdmin();
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">Parcours</h1>
        <p className="mt-1 max-w-3xl text-[16px] text-[var(--ink-2)]">
          Chaque case dit qui agit, ce qu’il fait et ce que ça produit (→). Cliquez sur une case pour replier ou déplier ses étapes.
        </p>
        <div className="mt-3"><Legend /></div>
        <nav className="mt-4 flex flex-wrap gap-2 text-[15px] font-semibold">
          <a href="#commande" className="rounded-full bg-white px-3.5 py-1.5 underline">1 · La commande</a>
          <a href="#ecriture" className="rounded-full bg-white px-3.5 py-1.5 underline">2 · Le livre s’écrit</a>
        </nav>
      </div>

      <Panel title={<span id="commande">Arbre 1 · La commande, du site au premier appel</span>}>
        <Tree nodes={ORDER_TREE} />
      </Panel>

      <Panel title={<span id="ecriture">Arbre 2 · Le livre s’écrit, appel après appel</span>}>
        <Tree nodes={AUTHOR_TREE} />
      </Panel>
    </div>
  );
}
