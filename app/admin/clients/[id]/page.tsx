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
import { Badge, Panel, Field, Fold, Empty, Avatar, Progress, Stat } from "@/components/admin/ui";
import AIcon from "@/components/admin/icons";
import { callCosts, sumCosts, fmtEur } from "@/lib/admin/costs";
import BookSteps from "@/components/admin/BookSteps";

export const metadata = { title: "Fiche client" };

export default async function AdminClient({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ fait?: string; erreur?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { fait, erreur } = await searchParams;
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

  // Ce que chaque appel a coûté : ligne (prix réel Twilio), voix, IA de la conversation, analyse et écriture.
  const costs = await callCosts(c.interviews).catch(() => new Map());
  const spent = sumCosts(costs.values());

  return (
    <div className="grid grid-cols-1 gap-5">
      <div>
        <Link href="/admin/clients" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--ink-3)] hover:text-[var(--ink)]">
          <AIcon name="chevron" size={14} className="rotate-180" /> Clients
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Avatar name={name} size={64} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[30px] font-extrabold leading-tight tracking-[-0.025em] sm:text-[34px]">{name}</h1>
              {st && <Badge tone={st.tone}>{st.label}</Badge>}
              {order.isGift && <Badge tone="wait">Livre offert</Badge>}
              {order.refundedAt && <Badge tone="bad">Remboursé</Badge>}
              {order.test && <Badge>Client de test</Badge>}
            </div>
            <p className="mt-1 text-[15px] tabular-nums text-[var(--ink-3)]">{profile.phone_number ?? "pas de numéro"} · client depuis le {fmtDate(profile.created_at, false)}</p>
          </div>
        </div>
        {(fait || erreur) && (
          <p role="status" className={`mt-5 rounded-[16px] px-4 py-3 text-[15px] font-semibold ${fait ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[#fbeae6] text-[#a8402f]"}`}>
            {fait ?? erreur}
          </p>
        )}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-[18px] border border-black/[0.06] bg-white p-4">
            <p className="text-[13px] font-semibold text-[var(--ink-3)]">Phase</p>
            <p className="mt-1 text-[18px] font-extrabold tracking-[-0.01em]">{phase ? `${phase}. ${PHASE_LABELS[phase]}` : "—"}</p>
            <div className="mt-2"><Progress value={project?.phase_progress ?? 0} /></div>
          </div>
          <Stat icon="phone" tone="amber" label="Appels" value={c.interviews.length} hint={fmtDuration(totalSeconds)} />
          <Stat icon="book" label="Récits" value={c.chapters.length} hint={`${fmtNumber(words)} mots`} />
          <Stat icon="layers" label="Livre composé" value={edition ? (EDITION_STATUS[edition.status] ?? EDITION_STATUS.failed).label : "—"} hint={edition ? `${edition.chapters.length} chapitre(s)` : "dès 2 récits"} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Panel icon="user" title="Narrateur">
          <dl>
            <Field label="Prénom, nom">{name}</Field>
            <Field label="Prononcé">{profile.first_name_phonetic ?? "comme écrit"}</Field>
            <Field label="Téléphone">{profile.phone_number}</Field>
            <Field label="E-mail du compte">{profile.email ? <Link className="underline" href={`/admin/mails?ecrire=${encodeURIComponent(profile.email)}`}>{profile.email}</Link> : null}</Field>
            <Field label="Tu / vous">{profile.politeness_preference}</Field>
            <Field label="Style d’écriture">{profile.writing_style}</Field>
            <Field label="Sujets à éviter">{profile.sensitive_topics || "aucun"}</Field>
            <Field label="Compte créé">{fmtDate(profile.created_at)}</Field>
          </dl>
        </Panel>
        <Panel icon="card" title="Commande">
          <dl>
            <Field label="Payée le">{fmtDate(order.paidAt)}</Field>
            <Field label="Pour">{order.isGift ? "un proche (cadeau)" : "soi-même"}</Field>
            <Field label="E-mail acheteur">{order.buyerEmail}</Field>
            {order.giver && <Field label="Offert par">{`${order.giver.firstName ?? "?"} · ${order.giver.phone}`}</Field>}
            {order.family.length > 0 && <Field label="Espace famille">{order.family.map((m) => `${m.firstName ?? "?"} · ${m.phone}`).join(", ")}</Field>}
            <Field label="Durée d’appel voulue">{`${order.callMinutes} min`}</Field>
            <Field label="Adresse de livraison">{order.shipping ? order.shipping.join(", ") : "pas encore demandée (elle l’est quand le livre est terminé)"}</Field>
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
        <Panel icon="pen" title="Réglages de l’espace auteur" className="md:col-span-2 xl:col-span-1">
          <dl>
            <Field label="Rendez-vous">{describeSchedule(settings.schedule) ?? "aucun : il appelle quand il veut"}</Field>
            <Field label="SMS « récit prêt »">{settings.smsChapter ? "oui" : "coupé"}</Field>
            <Field label="Partage avec la famille">{order.giver || order.family.length ? (settings.shareWithGiver ? "récits visibles" : "avancement seulement") : "sans objet"}</Field>
            <Field label="Préférences réglées">{settings.prefsSetAt ? fmtDate(settings.prefsSetAt) : "pas encore"}</Field>
            <Field label="Photos envoyées">{String(settings.photos)}</Field>
            <Field label="Proches connus">{String(c.family.length)}</Field>
          </dl>
        </Panel>
      </div>

      {project && order.fulfillment.completed && !order.refundedAt && (
        <Panel icon="book" title="Le livre, de la relecture à l’envoi" action={<Link href={`/admin/clients/${id}/livre`} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--ink-2)] hover:text-[var(--ink)]">Relire et fichiers d’impression <AIcon name="arrow" size={14} /></Link>}>
          <BookSteps profileId={id} f={order.fulfillment} hasAddress={!!order.shipping} retour="fiche" completedAt={typeof project.project_metadata?.completed_at === "string" ? (project.project_metadata.completed_at as string) : null} />
        </Panel>
      )}

      {project && (
        <Panel icon="pen" title="Agir">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-[18px] bg-[var(--canvas)] p-4">
              <p className="text-[16px] font-bold">Relancer ce client</p>
              <p className="mt-1 text-[14.5px] text-[var(--ink-2)]">
                Envoie un SMS et un e-mail qui rappellent le numéro à appeler. Pour un livre offert sans aucun appel, la relance va à celui qui l’a offert. Elle part aussi toute seule après 14 jours sans appel.
                {order.relances.length > 0 && ` Dernière relance : ${fmtDate(order.relances[order.relances.length - 1].at)} (${order.relances.length} en tout).`}
              </p>
              <form action={`/api/admin/clients/${id}/relance`} method="post" className="mt-3">
                <button disabled={!!order.refundedAt} className="press inline-flex h-11 items-center rounded-[14px] bg-[var(--ink)] px-4 text-[15px] font-bold text-white disabled:opacity-40">Envoyer la relance</button>
              </form>
            </div>
            <div className="rounded-[18px] bg-[var(--canvas)] p-4">
              <p className="text-[16px] font-bold">Rembourser ce client</p>
              {order.refundedAt ? (
                <p className="mt-1 text-[14.5px] text-[var(--ink-2)]">Remboursé le {fmtDate(order.refundedAt)}{order.refundAmount != null ? ` (${order.refundAmount} €)` : ""}. Le livre est fermé.</p>
              ) : !order.stripeSessionId ? (
                <p className="mt-1 text-[14.5px] text-[var(--ink-2)]">Pas de paiement Stripe lié à ce livre : rien à rembourser.</p>
              ) : (
                <>
                  <p className="mt-1 text-[14.5px] text-[var(--ink-2)]">Rembourse toute la commande dans Stripe, ferme le livre et arrête les rendez-vous. Le client reçoit un e-mail. On ne peut pas revenir en arrière.</p>
                  <form action={`/api/admin/clients/${id}/refund`} method="post" className="mt-3 flex flex-wrap items-center gap-2">
                    <input name="confirmation" required autoComplete="off" placeholder="Écrire REMBOURSER" aria-label="Écrire REMBOURSER pour confirmer" className="h-11 w-[200px] rounded-[14px] border border-[var(--line)] bg-white px-3 text-[15px]" />
                    <button className="press inline-flex h-11 items-center rounded-[14px] bg-[#a8402f] px-4 text-[15px] font-bold text-white">Rembourser ce client</button>
                  </form>
                </>
              )}
            </div>
            <div className="rounded-[18px] bg-[var(--canvas)] p-4">
              <p className="text-[16px] font-bold">{order.test ? "Client de test" : "Classer en test"}</p>
              <p className="mt-1 text-[14.5px] text-[var(--ink-2)]">
                {order.test
                  ? "Ce client ne compte dans aucun chiffre de l’admin (clients, commandes, argent, parcours). Il reste visible, rangé avec les tests."
                  : "Pour vos essais et ceux de vos proches : le client reste visible, mais sort de tous les chiffres. Une commande payée 0 € est classée en test toute seule."}
              </p>
              <form action={`/api/admin/clients/${id}/test`} method="post" className="mt-3">
                {order.test && <input type="hidden" name="annuler" value="1" />}
                <button className="press inline-flex h-11 items-center rounded-[14px] bg-white px-4 text-[15px] font-bold text-[var(--ink)] shadow-[0_0_0_1px_var(--line)]">
                  {order.test ? "C’est un vrai client" : "C’est un client de test"}
                </button>
              </form>
            </div>
          </div>
        </Panel>
      )}

      {project && (
        <Panel icon="spark" title="Ce que Loomina sait et prépare">
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

      <Panel icon="phone" title={`Appels (${c.interviews.length})`}>
        {c.interviews.length > 0 && (
          <div className="mb-4 rounded-[18px] bg-[var(--canvas)] p-4">
            <p className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[var(--ink-3)]">Ce que ces appels ont coûté</p>
            <p className="mt-1 text-[24px] font-extrabold tracking-[-0.02em] tabular-nums">
              {fmtEur(spent.totalTtc)} TTC <span className="text-[15px] font-semibold text-[var(--ink-3)]">({fmtEur(spent.total)} HT{spent.estimated ? ", en partie estimé" : ""})</span>
            </p>
            <p className="mt-1 text-[14.5px] text-[var(--ink-2)]">
              Ligne téléphonique {fmtEur(spent.line)} · voix {fmtEur(spent.voice)} · IA de la conversation {fmtEur(spent.conversation)} · analyse et écriture des récits {fmtEur(spent.writing)}.
              Soit {fmtEur(spent.totalTtc / c.interviews.length)} TTC par appel en moyenne.
            </p>
          </div>
        )}
        {c.interviews.length === 0 ? (
          <Empty>Aucun appel pour l’instant.</Empty>
        ) : (
          <ul className="grid gap-3">
            {c.interviews.map((i) => {
              const s = INTERVIEW_STATUS[String(i.processing_status)] ?? { label: String(i.processing_status), tone: "muted" as const };
              const chapter = c.chapters.find((ch) => ch.latest_interview_id === i.id);
              const cost = costs.get(String(i.id));
              return (
                <li key={String(i.id)} className="rounded-[18px] border border-[var(--line)] bg-[#fcfbf8] p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2 text-[15px]">
                    <b>{fmtDate(i.created_at)}</b>
                    <span className="text-[var(--ink-3)]">· {fmtDuration(i.duration_seconds)} · phase {String(i.phase ?? "?")}</span>
                    <Badge tone={s.tone}>{s.label}</Badge>
                    {chapter ? <Badge tone="ok">Récit n° {String(chapter.chapter_number)}</Badge> : null}
                    {cost && (
                      <span className="ml-auto text-[14px] font-bold tabular-nums" title={`Ligne ${fmtEur(cost.line)} · voix ${fmtEur(cost.voice)} · conversation ${fmtEur(cost.conversation)} · analyse et écriture ${fmtEur(cost.writing)} (hors taxes)`}>
                        {fmtEur(cost.totalTtc)} TTC{cost.estimated ? " (estimé)" : ""}
                      </span>
                    )}
                  </div>
                  {i.topics_summary ? <p className="mt-2 text-[15px] text-[var(--ink-2)]">{String(i.topics_summary)}</p> : null}
                  {cost?.recordingEventId && (
                    <audio controls preload="none" src={`/api/admin/recordings/${cost.recordingEventId}`} className="mt-3 w-full" />
                  )}
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

      <Panel icon="book" title={`Récits d’appel (${c.chapters.length})`}>
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

      <Panel icon="layers" title="Livre composé" action={c.editions.ready ? <Link href={`/admin/clients/${id}/livre`} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--ink-2)] hover:text-[var(--ink)]">Relire le livre et demander l’avis de l’IA <AIcon name="arrow" size={14} /></Link> : undefined}>
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

      <Panel icon="server" title="Journal technique des appels">
        {c.events.length === 0 ? (
          <Empty>Aucun rapport d’appel reçu.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead className="text-[12px] uppercase tracking-[0.05em] text-[var(--ink-3)]">
                <tr><th className="py-2 pr-3">Reçu</th><th className="pr-3">État</th><th className="pr-3">Essais</th><th className="pr-3">Traité</th><th>Message</th><th /></tr>
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
                      <td className="pl-3">
                        {e.status === "failed" && (
                          <form action={`/api/admin/events/${String(e.id)}/retry?client=${id}`} method="post">
                            <button className="press whitespace-nowrap rounded-[10px] bg-[var(--ink)] px-3 py-1.5 text-[13px] font-bold text-white">Relancer</button>
                          </form>
                        )}
                      </td>
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
