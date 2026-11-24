import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { listBooks, type BookLine } from "@/lib/admin/data";
import { STAGE_ADMIN } from "@/lib/loomina/fulfillment";
import { Badge, Panel, Empty, PageHeader } from "@/components/admin/ui";
import BookSteps, { PromiseNote } from "@/components/admin/BookSteps";

export const metadata = { title: "Livres" };

function Line({ b }: { b: BookLine }) {
  const st = STAGE_ADMIN[b.fulfillment.stage];
  return (
    <li className="grid gap-4 py-5 first:pt-1 last:pb-1 lg:grid-cols-[minmax(220px,0.8fr)_1.6fr] lg:items-start">
      <div className="flex items-center gap-3">
        <div className="min-w-0">
          <Link href={`/admin/clients/${b.profileId}/livre`} className="text-[15px] font-semibold hover:underline">{b.client}</Link>
          <span className="mt-1 flex flex-wrap gap-1.5">
            <Badge tone={st.tone}>{st.label}</Badge>
            {b.isGift && <Badge>Offert</Badge>}
            {!b.hasAddress && b.fulfillment.stage !== "delivered" && <Badge tone="bad">Adresse manquante</Badge>}
          </span>
        </div>
      </div>
      <div className="grid gap-2">
        <BookSteps profileId={b.profileId} f={b.fulfillment} hasAddress={b.hasAddress} retour="livres" compact />
        {b.fulfillment.stage === "completed" && <PromiseNote completedAt={b.completedAt} />}
      </div>
    </li>
  );
}

/** Les livres terminés, de la relecture à l'arrivée chez le client. */
export default async function AdminBooks({ searchParams }: { searchParams: Promise<{ fait?: string; erreur?: string }> }) {
  await requireAdmin();
  const { fait, erreur } = await searchParams;
  const books = (await listBooks()).filter((b) => !b.refunded);
  const todo = books.filter((b) => ["completed", "reviewed", "printing"].includes(b.fulfillment.stage));
  const shipped = books.filter((b) => b.fulfillment.stage === "shipped");
  const done = books.filter((b) => b.fulfillment.stage === "delivered");

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader eyebrow="Livres" title="De la relecture à la boîte aux lettres">
        Chaque livre terminé, et ce qu’il attend de vous. À chaque étape, le client (et la personne qui l’a offert) reçoit un SMS et un e-mail.
      </PageHeader>
      {(fait || erreur) && (
        <p role="status" className={`rounded-[10px] px-4 py-3 text-[14px] font-semibold ${fait ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--danger-soft)] text-[var(--danger)]"}`}>{fait ?? erreur}</p>
      )}

      <Panel icon="pen" title={`À faire (${todo.length})`}>
        {todo.length === 0 ? <Empty>Aucun livre n’attend de relecture, d’impression ou d’envoi.</Empty> : <ul className="divide-y divide-[var(--line-soft)]">{todo.map((b) => <Line key={b.projectId} b={b} />)}</ul>}
      </Panel>

      <Panel icon="route" title={`En route (${shipped.length})`}>
        {shipped.length === 0 ? <Empty>Aucun colis en route.</Empty> : <ul className="divide-y divide-[var(--line-soft)]">{shipped.map((b) => <Line key={b.projectId} b={b} />)}</ul>}
      </Panel>

      {done.length > 0 && (
        <Panel icon="check" title={`Reçus (${done.length})`}>
          <ul className="divide-y divide-[var(--line-soft)]">{done.map((b) => <Line key={b.projectId} b={b} />)}</ul>
        </Panel>
      )}
    </div>
  );
}
