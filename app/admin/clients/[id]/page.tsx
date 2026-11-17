import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getClient } from "@/lib/admin/data";
import { fmtDate, fmtDuration, fmtNumber, INTERVIEW_STATUS, EVENT_STATUS, PROJECT_STATUS, EDITION_STATUS } from "@/lib/admin/format";
import { PHASE_LABELS, toPhase } from "@/lib/loomina/phases";
import { normalizeContext, renderContext } from "@/lib/loomina/context";
import { describeSchedule } from "@/lib/loomina/schedule";
import { readTopics } from "@/lib/loomina/phase-plan";
import { buildAssistant } from "@/lib/loomina/assistant";
import { getSystemPrompt } from "@/lib/loomina/db";
import { Badge, Panel, Field, Fold, Empty } from "@/components/admin/ui";

export const metadata = { title: "Fiche client" };

export default async function AdminClient({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const c = await getClient(id);
  if (!c) notFound();

  const { profile, project, order, settings } = c;
  const name = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || profile.full_name || "Sans nom";
  const ctx = normalizeContext(project?.context);
  const phase = project ? toPhase(project.phase) : null;
  const topics = readTopics(project?.project_metadata);
  const st = project ? PROJECT_STATUS[project.status] ?? { label: project.status, tone: "muted" as const } : null;
  const totalSeconds = c.interviews.reduce((s, i) => s + (Number(i.duration_seconds) || 0), 0);
  const words = c.chapters.reduce((s, ch) => s + (Number(ch.word_count) || 0), 0);

  // Ce que Loomina recevra au prochain appel de ce client, construit comme le fait le serveur vocal.
  let nextCall: { firstMessage: string; system: string } | null = null;
  if (project && phase) {
    const prompt = await getSystemPrompt(phase).catch(() => null);
    const payload = buildAssistant({ profile, project, prompt, phase, serverUrl: "https://www.loomina.eu/api/vapi/webhook" });
    nextCall = { firstMessage: payload.assistant.firstMessage, system: payload.assistant.model.messages[0].content };
  }

  const edition = c.editions.running ?? c.editions.ready ?? c.editions.failed;

  return (
    <div className="grid gap-6">
      <div>
        <Link href="/admin/clients" className="text-[15px] font-semibold text-[var(--ink-3)] underline">← Clients</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">{name}</h1>
          {st && <Badge tone={st.tone}>{st.label}</Badge>}
          {order.isGift && <Badge tone="wait">Livre offert</Badge>}
        </div>
        <p className="mt-1 text-[15px] text-[var(--ink-3)]">
          {phase ? `Phase ${phase}, ${PHASE_LABELS[phase]} (${project?.phase_progress ?? 0} %)` : "Pas de livre en cours"} · {c.interviews.length} appel(s), {fmtDuration(totalSeconds)} · {c.chapters.length} récit(s), {fmtNumber(words)} mots
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Narrateur">
          <dl>
            <Field label="Prénom, nom">{name}</Field>
            <Field label="Prononcé">{profile.first_name_phonetic ?? "comme écrit"}</Field>
            <Field label="Téléphone">{profile.phone_number}</Field>
            <Field label="E-mail du compte">{profile.email}</Field>
            <Field label="Tu / vous">{profile.politeness_preference}</Field>
            <Field label="Style d’écriture">{profile.writing_style}</Field>
            <Field label="Sujets à éviter">{profile.sensitive_topics || "aucun"}</Field>
            <Field label="Compte créé">{fmtDate(profile.created_at)}</Field>
          </dl>
        </Panel>
        <Panel title="Commande">
          <dl>
            <Field label="Payée le">{fmtDate(order.paidAt)}</Field>
            <Field label="Pour">{order.isGift ? "un proche (cadeau)" : "soi-même"}</Field>
            <Field label="E-mail acheteur">{order.buyerEmail}</Field>
            {order.giver && <Field label="Offert par">{`${order.giver.firstName ?? "?"} · ${order.giver.phone}`}</Field>}
            <Field label="Durée d’appel voulue">{`${order.callMinutes} min`}</Field>
            <Field label="Paiement Stripe">
              {order.stripeSessionId ? (
                <a className="underline" target="_blank" rel="noreferrer" href={`https://dashboard.stripe.com/search?query=${encodeURIComponent(order.stripeSessionId)}`}>
                  {order.stripeSessionId.slice(0, 18)}…
                </a>
              ) : "aucun (créé à la main ou test)"}
            </Field>
            {c.projects.length > 1 && <Field label="Autres livres">{`${c.projects.length - 1} commande(s) plus ancienne(s)`}</Field>}
          </dl>
        </Panel>
        <Panel title="Réglages de l’espace auteur">
          <dl>
            <Field label="Rendez-vous">{describeSchedule(settings.schedule) ?? "aucun : il appelle quand il veut"}</Field>
            <Field label="SMS « récit prêt »">{settings.smsChapter ? "oui" : "coupé"}</Field>
            <Field label="Partage avec l’offreur">{order.giver ? (settings.shareWithGiver ? "récits visibles" : "avancement seulement") : "sans objet"}</Field>
            <Field label="Préférences réglées">{settings.prefsSetAt ? fmtDate(settings.prefsSetAt) : "pas encore"}</Field>
            <Field label="Photos envoyées">{String(settings.photos)}</Field>
            <Field label="Proches connus">{String(c.family.length)}</Field>
          </dl>
        </Panel>
      </div>

      {project && (
        <Panel title="Ce que Loomina sait et prépare">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="grid gap-3">
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-3)]">Où reprendre au prochain appel</p>
                <p className="mt-1 text-[16px]">{project.next_question_strategy ?? "Faire connaissance (premier appel)."}</p>
              </div>
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-3)]">Sujets suggérés en attente</p>
                {ctx.suggested_topics?.length ? <ul className="mt-1 list-disc pl-5 text-[15px]">{ctx.suggested_topics.map((t) => <li key={t}>{t}</li>)}</ul> : <p className="mt-1 text-[15px] text-[var(--ink-3)]">Aucun</p>}
              </div>
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-3)]">Sujets propres à cette personne</p>
                {topics.length ? (
                  <ul className="mt-1 grid gap-1 text-[15px]">
                    {topics.map((t) => <li key={t.id}><Badge tone={t.status === "open" ? "wait" : t.status === "done" ? "ok" : "muted"}>{t.status === "open" ? "à raconter" : t.status === "done" ? "raconté" : "pas souhaité"}</Badge> phase {t.phase} · {t.label}</li>)}
                  </ul>
                ) : <p className="mt-1 text-[15px] text-[var(--ink-3)]">Aucun</p>}
              </div>
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-3)]">Corrections de l’auteur</p>
                {ctx.author_corrections?.length ? <ul className="mt-1 list-disc pl-5 text-[15px]">{ctx.author_corrections.map((t) => <li key={t}>{t}</li>)}</ul> : <p className="mt-1 text-[15px] text-[var(--ink-3)]">Aucune</p>}
              </div>
            </div>
            <div className="grid content-start gap-3">
              <Fold summary="Mémoire du livre (telle que les IA la lisent)" mono>{renderContext(ctx)}</Fold>
              {nextCall && (
                <Fold summary="Prompt complet du prochain appel" mono>
                  {`PREMIÈRE PHRASE : « ${nextCall.firstMessage} »\n\n${nextCall.system}`}
                </Fold>
              )}
              {c.family.length > 0 && (
                <Fold summary={`Proches (${c.family.length})`}>
                  <ul className="grid gap-1">
                    {c.family.map((f, i) => <li key={i}><b>{String(f.full_name)}</b> · {String(f.relation ?? "")}{f.is_deceased ? " · décédé(e)" : ""}{f.notes ? ` · ${String(f.notes)}` : ""}</li>)}
                  </ul>
                </Fold>
              )}
            </div>
          </div>
        </Panel>
      )}

      <Panel title={`Appels (${c.interviews.length})`}>
        {c.interviews.length === 0 ? (
          <Empty>Aucun appel pour l’instant.</Empty>
        ) : (
          <ul className="grid gap-3">
            {c.interviews.map((i) => {
              const s = INTERVIEW_STATUS[String(i.processing_status)] ?? { label: String(i.processing_status), tone: "muted" as const };
              const chapter = c.chapters.find((ch) => ch.latest_interview_id === i.id);
              return (
                <li key={String(i.id)} className="rounded-[14px] border border-[var(--line)] p-4">
                  <div className="flex flex-wrap items-center gap-2 text-[15px]">
                    <b>{fmtDate(i.created_at)}</b>
                    <span className="text-[var(--ink-3)]">· {fmtDuration(i.duration_seconds)} · phase {String(i.phase ?? "?")}</span>
                    <Badge tone={s.tone}>{s.label}</Badge>
                    {chapter ? <Badge tone="ok">Récit n° {String(chapter.chapter_number)}</Badge> : null}
                  </div>
                  {i.topics_summary ? <p className="mt-2 text-[15px] text-[var(--ink-2)]">{String(i.topics_summary)}</p> : null}
                  <div className="mt-3 grid gap-2">
                    {i.transcript ? <Fold summary="Transcript de l’appel" mono>{String(i.transcript)}</Fold> : null}
                    {i.ai_analysis_log && Object.keys(i.ai_analysis_log as object).length > 0 ? <Fold summary="Analyse du Directeur" mono>{JSON.stringify(i.ai_analysis_log, null, 2)}</Fold> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel title={`Récits d’appel (${c.chapters.length})`}>
        {c.chapters.length === 0 ? (
          <Empty>Aucun récit écrit.</Empty>
        ) : (
          <div className="grid gap-2">
            {c.chapters.map((ch) => (
              <Fold key={String(ch.id)} summary={`${String(ch.chapter_number)}. ${String(ch.title ?? "Sans titre")} · ${fmtNumber(ch.word_count)} mots · phase ${String(ch.phase ?? "?")} · v${String(ch.version ?? 1)}${ch.status === "archived" ? " · archivé" : ""}`}>
                {String(ch.content_markdown ?? "")}
              </Fold>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Livre composé">
        {!edition ? (
          <Empty>Pas encore composé (il faut au moins deux récits).</Empty>
        ) : (
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2 text-[15px]">
              <Badge tone={(EDITION_STATUS[edition.status] ?? EDITION_STATUS.failed).tone}>{(EDITION_STATUS[edition.status] ?? EDITION_STATUS.failed).label}</Badge>
              <span className="text-[var(--ink-3)]">mis à jour le {fmtDate(edition.updated_at)} · {edition.source_count} récit(s) source · {edition.chapters.length}/{edition.plan.length} chapitre(s)</span>
            </div>
            {edition.error && <p className="text-[15px] text-[var(--danger)]">{edition.error}</p>}
            {c.editions.ready && c.editions.ready !== edition && <p className="text-[15px] text-[var(--ink-3)]">Dernière version prête : {fmtDate(c.editions.ready.updated_at)}.</p>}
            {(c.editions.ready ?? edition).chapters.map((ch, n) => (
              <Fold key={n} summary={`${n + 1}. ${ch.title}`}>{ch.content}</Fold>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Journal technique des appels">
        {c.events.length === 0 ? (
          <Empty>Aucun rapport d’appel reçu.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead className="text-[12px] uppercase tracking-[0.05em] text-[var(--ink-3)]">
                <tr><th className="py-2 pr-3">Reçu</th><th className="pr-3">État</th><th className="pr-3">Essais</th><th className="pr-3">Traité</th><th>Message</th></tr>
              </thead>
              <tbody>
                {c.events.map((e) => {
                  const s = EVENT_STATUS[String(e.status)] ?? { label: String(e.status), tone: "muted" as const };
                  return (
                    <tr key={String(e.id)} className="border-t border-[var(--line-soft)] align-top">
                      <td className="py-2 pr-3 whitespace-nowrap">{fmtDate(e.created_at)}</td>
                      <td className="pr-3"><Badge tone={s.tone}>{s.label}</Badge></td>
                      <td className="pr-3">{String(e.attempts ?? 0)}</td>
                      <td className="pr-3 whitespace-nowrap">{fmtDate(e.processed_at)}</td>
                      <td className="text-[var(--ink-2)]">{String(e.error ?? "")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
