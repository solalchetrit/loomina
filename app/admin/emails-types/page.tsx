import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { CATALOGUE, ETAPES, SANS_EMAIL } from "@/lib/emails/catalogue";
import { SITE_URL } from "@/lib/emails/mise-en-page";
import { Badge, Panel, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "E-mails types" };

/**
 * Tous les e-mails envoyés aux clients, dans l'ordre du parcours (demande de
 * Solal, 25/11/2026). Chaque modèle est rendu avec des variables d'exemple,
 * tel qu'il arrive dans la boîte du client. Les modèles : lib/emails.
 */
export default async function AdminEmailTypes({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  await requireAdmin();
  const { e } = await searchParams;
  const current = CATALOGUE.find((c) => c.id === e) ?? CATALOGUE[0];
  const mail = current.exemple();
  // Les images (Mémo, logo) sont lues sur ce site-ci : l’aperçu marche aussi avant la mise en ligne.
  const html = mail.html.split(`${SITE_URL}/`).join("/");

  return (
    <div className="grid grid-cols-1 gap-5">
      <PageHeader eyebrow="E-mails types" title="Les e-mails envoyés aux clients">
        {CATALOGUE.length} e-mails, dans l’ordre du parcours, de la démo au livre livré. Chaque aperçu utilise des exemples (Jeanne raconte, Marc offre).
      </PageHeader>

      <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
        <Panel title="Le parcours" flush>
          <nav className="grid gap-4 p-3">
            {ETAPES.map((etape) => (
              <div key={etape}>
                <p className="px-2 pb-1 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[var(--ink-3)]">{etape}</p>
                <ul className="grid">
                  {CATALOGUE.filter((c) => c.etape === etape).map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/admin/emails-types?e=${c.id}`}
                        aria-current={c.id === current.id ? "page" : undefined}
                        className={`block rounded-[10px] px-2 py-1.5 text-[14px] ${c.id === current.id ? "bg-[var(--surface-2)] font-semibold" : "hover:bg-[var(--surface-2)]"}`}
                      >
                        {c.nom}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </Panel>

        <div className="grid min-w-0 gap-5">
          <Panel title={current.nom}>
            <dl className="grid gap-3 p-4 text-[14px] sm:grid-cols-2">
              <div><dt className="text-[12px] text-[var(--ink-3)]">Quand</dt><dd>{current.quand}</dd></div>
              <div><dt className="text-[12px] text-[var(--ink-3)]">À qui</dt><dd>{current.aQui}</dd></div>
              <div className="sm:col-span-2"><dt className="text-[12px] text-[var(--ink-3)]">Objet</dt><dd className="font-semibold">{mail.subject}</dd></div>
              <div className="sm:col-span-2"><dt className="text-[12px] text-[var(--ink-3)]">Aperçu dans la boîte de réception</dt><dd>{mail.preheader}</dd></div>
              <div className="sm:col-span-2">
                <dt className="text-[12px] text-[var(--ink-3)]">Variables</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">{current.variables.map((v) => <Badge key={v}>{v}</Badge>)}</dd>
              </div>
              <div className="sm:col-span-2"><dt className="text-[12px] text-[var(--ink-3)]">Envoyé par</dt><dd><code className="text-[13px]">{current.code}</code></dd></div>
            </dl>
          </Panel>
          <Panel title="Aperçu" flush>
            <iframe title={mail.subject} srcDoc={html} className="block h-[1100px] w-full rounded-b-[inherit] border-0 bg-[#f2f5f8]" />
          </Panel>
          <Panel title="Quand rien ne part">
            <ul className="grid gap-2 p-4 text-[14px]">
              {SANS_EMAIL.map((s) => (
                <li key={s.texte}><span className="font-semibold">{s.etape} :</span> {s.texte}</li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
