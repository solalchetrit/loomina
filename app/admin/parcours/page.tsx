import { requireAdmin } from "@/lib/admin/auth";
import { ORDER_TREE, AUTHOR_TREE } from "@/lib/admin/journeys";
import Tree, { Legend } from "@/components/admin/Tree";
import { PageHeader, Panel } from "@/components/admin/ui";
import AIcon from "@/components/admin/icons";

export const metadata = { title: "Parcours" };

export default async function AdminJourneys() {
  await requireAdmin();
  return (
    <div>
      <PageHeader eyebrow="Parcours" title="Ce que vit le client, et ce que ça déclenche">
        Chaque case dit qui agit, ce qu’il fait, et ce que ça produit. Les cases avec un nombre se déplient.
      </PageHeader>

      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        <a href="#commande" className="group flex items-center gap-4 rounded-[20px] bg-[var(--ink)] p-5 text-white">
          <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[var(--amber)] text-[var(--ink)]"><AIcon name="card" size={22} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-bold uppercase tracking-[0.14em] text-white/50">Arbre 1</span>
            <span className="block text-[19px] font-extrabold tracking-[-0.01em]">La commande</span>
            <span className="block text-[14px] text-white/60">Du site au premier appel</span>
          </span>
          <AIcon name="arrow" className="text-white/40 transition-transform group-hover:translate-x-1" />
        </a>
        <a href="#ecriture" className="group flex items-center gap-4 rounded-[20px] bg-[var(--ink)] p-5 text-white">
          <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[var(--amber)] text-[var(--ink)]"><AIcon name="book" size={22} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-bold uppercase tracking-[0.14em] text-white/50">Arbre 2</span>
            <span className="block text-[19px] font-extrabold tracking-[-0.01em]">Le livre s’écrit</span>
            <span className="block text-[14px] text-white/60">Appel après appel, jusqu’au livre</span>
          </span>
          <AIcon name="arrow" className="text-white/40 transition-transform group-hover:translate-x-1" />
        </a>
      </div>

      <div className="mb-8"><Legend /></div>

      <div className="grid grid-cols-1 gap-8">
        <Panel id="commande" icon="card" title="Arbre 1 · La commande, du site au premier appel">
          <Tree id="commande-arbre" nodes={ORDER_TREE} />
        </Panel>
        <Panel id="ecriture" icon="book" title="Arbre 2 · Le livre s’écrit, appel après appel">
          <Tree id="ecriture-arbre" nodes={AUTHOR_TREE} />
        </Panel>
      </div>
    </div>
  );
}
