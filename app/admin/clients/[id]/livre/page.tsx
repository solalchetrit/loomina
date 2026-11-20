import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getClient } from "@/lib/admin/data";
import { fmtDate, fmtNumber, PROJECT_STATUS } from "@/lib/admin/format";
import { readReview } from "@/lib/loomina/book-review";
import { Badge, Panel, Empty } from "@/components/admin/ui";
import AIcon from "@/components/admin/icons";

export const metadata = { title: "Relire le livre" };

const REVIEW_HEADS = ["EN BREF", "INCOHÉRENCES", "RÉPÉTITIONS", "PASSAGES À ÉCLAIRCIR", "CE QUI SONNE FAUX", "POINTS DÉLICATS À VÉRIFIER AVEC L'AUTEUR", "POINTS DÉLICATS À VÉRIFIER AVEC L’AUTEUR", "NOMS PROPRES"];

/** La page de relecture : le livre composé en entier, et l'avis de l'IA. */
export default async function AdminBook({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ fait?: string; erreur?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { fait, erreur } = await searchParams;
  const c = await getClient(id);
  if (!c) notFound();

  const name = `${c.profile.first_name ?? ""} ${c.profile.last_name ?? ""}`.trim() || c.profile.full_name || "Sans nom";
  const book = c.editions.ready;
  const meta = (c.project?.project_metadata ?? {}) as Record<string, unknown>;
  const review = readReview(meta);
  const reviewedAt = typeof meta.reviewed_at === "string" ? meta.reviewed_at : null;
  const st = c.project ? PROJECT_STATUS[c.project.status] ?? { label: c.project.status, tone: "muted" as const } : null;
  const words = book ? book.chapters.reduce((s, ch) => s + (ch.word_count || 0), 0) : 0;
  const stale = review && book && review.edition_id !== book.id;

  return (
    <div className="grid grid-cols-1 gap-5">
      <div>
        <Link href={`/admin/clients/${id}`} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--ink-3)] hover:text-[var(--ink)]">
          <AIcon name="chevron" size={14} className="rotate-180" /> {name}
        </Link>
        <p className="t-eyebrow mt-4">Relire le livre</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="t-title">Le livre de {c.profile.first_name ?? name}</h1>
          {st && <Badge tone={st.tone}>{st.label}</Badge>}
          {reviewedAt && <Badge tone="ok">Relu le {fmtDate(reviewedAt, false)}</Badge>}
        </div>
        <p className="t-body mt-2 max-w-3xl">
          {book ? `${book.chapters.length} chapitres, ${fmtNumber(words)} mots, composé le ${fmtDate(book.updated_at)} à partir de ${book.source_count} récit(s) d’appel.` : "Le livre n’est pas encore composé (il faut au moins deux récits)."}
        </p>
        {(fait || erreur) && (
          <p role="status" className={`mt-5 rounded-[16px] px-4 py-3 text-[15px] font-semibold ${fait ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[#fbeae6] text-[#a8402f]"}`}>{fait ?? erreur}</p>
        )}
      </div>

      <Panel icon="spark" title="L’avis de l’IA">
        <p className="text-[15px] text-[var(--ink-2)]">
          Une IA lit le livre en entier et signale les incohérences, les répétitions, les passages obscurs et les points délicats. Elle ne change rien au livre : c’est un avis, pour vous seul.
        </p>
        {review?.status === "running" && <p className="mt-3 rounded-[14px] bg-[var(--amber-soft)] px-4 py-3 text-[15px] font-semibold text-[var(--amber-deep)]">Avis en cours depuis le {fmtDate(review.started_at)}. Rechargez la page dans une minute.</p>}
        {review?.status === "failed" && <p className="mt-3 rounded-[14px] bg-[#fbeae6] px-4 py-3 text-[15px] text-[#a8402f]">L’avis a échoué : {review.error}</p>}
        {review?.status === "done" && review.text && (
          <div className="mt-4 rounded-[18px] bg-[var(--canvas)] p-5">
            <p className="text-[13px] font-semibold text-[var(--ink-3)]">
              Avis du {fmtDate(review.at)}{stale ? " — sur une version plus ancienne du livre : redemandez un avis." : ""}
            </p>
            <div className="mt-3 grid gap-1.5 text-[15.5px] leading-relaxed">
              {review.text.split("\n").map((line, i) => {
                const t = line.trim();
                if (!t) return null;
                if (REVIEW_HEADS.includes(t.replace(/[:：]$/, "").toUpperCase())) return <p key={i} className="mt-4 text-[13px] font-bold uppercase tracking-[0.06em] text-[var(--amber-ink)] first:mt-0">{t}</p>;
                return <p key={i} className={t.startsWith("-") ? "pl-4 -indent-4 text-[var(--ink-2)]" : "text-[var(--ink)]"}>{t}</p>;
              })}
            </div>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <form action={`/api/admin/clients/${id}/review`} method="post">
            <button disabled={!book || review?.status === "running"} className="press inline-flex h-11 items-center rounded-[14px] bg-[var(--ink)] px-4 text-[15px] font-bold text-white disabled:opacity-40">
              {review?.status === "done" ? "Redemander un avis" : "Demander l’avis de l’IA"}
            </button>
          </form>
          <form action={`/api/admin/clients/${id}/relu`} method="post">
            {reviewedAt && <input type="hidden" name="annuler" value="1" />}
            <button disabled={!book} className="press inline-flex h-11 items-center rounded-[14px] bg-white px-4 text-[15px] font-bold text-[var(--ink)] shadow-[0_0_0_1px_var(--line)] disabled:opacity-40">
              {reviewedAt ? "Remettre à relire" : "J’ai relu ce livre"}
            </button>
          </form>
        </div>
      </Panel>

      <Panel icon="book" title="Le livre à imprimer">
        <p className="text-[15px] text-[var(--ink-2)]">
          Les fichiers à envoyer à l’imprimeur : l’intérieur (A5, 3 mm de fonds perdus, polices embarquées, nombre de pages multiple de 4) et la couverture à plat (4e de couverture, dos, 1re), toile lin. Fabriqués à la demande depuis la dernière version du livre, photos comprises.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { part: "interieur", label: "Intérieur (PDF imprimeur)", dark: true },
            { part: "couverture", label: "Couverture à plat", dark: false },
            { part: "lecture", label: "Version à lire (celle de l’auteur)", dark: false },
          ].map((b) =>
            book ? (
              <a key={b.part} href={`/api/admin/clients/${id}/livre-pdf?part=${b.part}`} className={`press inline-flex h-11 items-center rounded-[14px] px-4 text-[15px] font-bold ${b.dark ? "bg-[var(--ink)] text-white" : "bg-white text-[var(--ink)] shadow-[0_0_0_1px_var(--line)]"}`}>
                {b.label}
              </a>
            ) : (
              <span key={b.part} aria-disabled="true" className="inline-flex h-11 items-center rounded-[14px] bg-white px-4 text-[15px] font-bold text-[var(--ink)] opacity-40 shadow-[0_0_0_1px_var(--line)]">{b.label}</span>
            )
          )}
        </div>
      </Panel>

      {!book ? (
        <Panel icon="book" title="Le livre"><Empty>Rien à lire pour l’instant.</Empty></Panel>
      ) : (
        <article className="card mx-auto w-full max-w-[760px] px-6 py-10 sm:px-12 sm:py-14">
          {book.chapters.map((ch, n) => {
            const newPart = !!ch.part && ch.part !== (n > 0 ? book.chapters[n - 1].part : "");
            return (
              <section key={ch.number} id={`chapitre-${ch.number}`} className="mb-12 last:mb-0">
                {newPart && <p className="mb-6 border-b border-[var(--line)] pb-2 text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--amber-ink)]">{ch.part}</p>}
                <p className="text-[13px] font-semibold text-[var(--ink-3)]">Chapitre {ch.number} · {fmtNumber(ch.word_count)} mots · récits {ch.sources.join(", ")}</p>
                <h2 className="mt-1 text-[26px] font-extrabold leading-tight tracking-[-0.02em]">{ch.title}</h2>
                <div className="mt-4 grid gap-4 text-[17px] leading-[1.75] text-[var(--ink)]" style={{ textAlign: "justify" }}>
                  {ch.content.split(/\n{2,}/).map((p, i) => <p key={i}>{p.replace(/^#+\s*/, "")}</p>)}
                </div>
              </section>
            );
          })}
        </article>
      )}
    </div>
  );
}
