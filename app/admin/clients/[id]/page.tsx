import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getClient } from "@/lib/admin/data";
import { fmtDate, fmtDuration, fmtNumber, EVENT_STATUS, PROJECT_STATUS, EDITION_STATUS } from "@/lib/admin/format";
import { PHASE_LABELS, toPhase } from "@/lib/loomina/phases";
import { normalizeContext, renderContext } from "@/lib/loomina/context";
import { describeSchedule } from "@/lib/loomina/schedule";
import { readTopics } from "@/lib/loomina/phase-plan";
import { buildAssistant } from "@/lib/loomina/assistant";
import { getSystemPrompt } from "@/lib/loomina/db";
import { Badge, Panel, Field, Fold, Empty, Progress, NightFigure } from "@/components/admin/ui";
import AIcon from "@/components/admin/icons";
import { sumCosts, fmtEur, type CallCost } from "@/lib/admin/costs";
import { callCostsKept } from "@/lib/admin/cached";
import BookSteps from "@/components/admin/BookSteps";
import CallCard from "@/components/admin/CallCard";
import { readReviews, type ReviewRow } from "@/lib/admin/ecoute";
import { WRITING_STYLES } from "@/lib/loomina/styles";

/**
 * Refonte du 24/11/2026 (Solal : « la fiche cliente est mal foutue ») : un en-tête
 * avec l'essentiel (numéro, e-mail, rendez-vous), puis quatre onglets. Les appels
 * d'abord, chacun avec son son, son écoute et son coût poste par poste.
 */
const TABS = [
  { id: "appels", label: "Appels" },
  { id: "livre", label: "Récits et livre" },
  { id: "fiche", label: "Fiche et actions" },
  { id: "coulisses", label: "Coulisses" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export const metadata = { title: "Fiche client" };

export default async function AdminClient({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ fait?: string; erreur?: string; onglet?: string; modifier?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { fait, erreur, onglet, modifier } = await searchParams;
  const editing = modifier === "1";
  const tab: Tab = TABS.some((t) => t.id === onglet) ? (onglet as Tab) : "appels";
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
  if (tab === "coulisses" && project && phase) {
    const prompt = await getSystemPrompt(phase).catch(() => null);
    const payload = buildAssistant({ profile, project, prompt, phase, serverUrl: "https://www.loomina.eu/api/vapi/webhook" });
    nextCall = { firstMessage: payload.assistant.firstMessage, system: payload.assistant.model.messages[0].content };
  }

  const edition = c.editions.running ?? c.editions.ready ?? c.editions.failed;

  // Ce que chaque appel a coûté : ligne (prix réel Twilio), voix, IA de la conversation, analyse et écriture.
  // Seul l'onglet Appels s'en sert : les autres onglets s'ouvrent sans attendre Twilio.
  // La clé du cache suit les appels, leurs écoutes et les compositions du livre : un changement recalcule aussitôt.
  const onCalls = tab === "appels";
  const reviews = onCalls ? await readReviews(c.interviews.map((i) => String(i.id))).catch(() => new Map<string, ReviewRow>()) : new Map<string, ReviewRow>();
  const stamp = [c.interviews.length, reviews.size, edition ? `${String(edition.id)}:${String(edition.status)}` : ""].join("|");
  const costs = onCalls
    ? await callCostsKept(c.interviews, { phone: profile.phone_number ?? null, projectId: project?.id ?? null }, stamp).catch(() => new Map<string, CallCost>())
    : new Map<string, CallCost>();
  const spent = sumCosts(costs.values());

  return (
    <div className="grid grid-cols-1 gap-[22px]">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.025em]">{name}</h1>
            {st && <Badge tone={st.tone}>{st.label}</Badge>}
            {order.isGift && <Badge tone="wait">Livre offert</Badge>}
            {order.refundedAt && <Badge tone="bad">Remboursé</Badge>}
            {order.test && <Badge>Client de test</Badge>}
          </div>
          <p className="mt-1 flex flex-wrap gap-x-3.5 gap-y-0.5 text-[13.5px] text-[var(--ink-2)]">
            <span className="tabular-nums">{profile.phone_number ?? "pas de numéro"}</span>
            {profile.email ? <Link className="underline decoration-[var(--rule-strong)] underline-offset-4 hover:text-[var(--ink)]" href={`/admin/mails?ecrire=${encodeURIComponent(profile.email)}`}>{profile.email}</Link> : <span>pas d’e-mail</span>}
            <span>{profile.politeness_preference === "tu" ? "tutoiement" : "vouvoiement"}</span>
            <span>{describeSchedule(settings.schedule) ? `rendez-vous ${describeSchedule(settings.schedule)}` : "pas de rendez-vous, appelle quand il veut"}</span>
            <span className="text-[var(--ink-3)]">client depuis le {fmtDate(profile.created_at, false)}</span>
          </p>
        </div>
        {profile.email && <Link href={`/admin/mails?ecrire=${encodeURIComponent(profile.email)}`} className="adm-btn adm-btn-sec"><AIcon name="message" size={15} /> Lui écrire</Link>}
      </header>

      {(fait || erreur) && (
        <p role="status" className={`rounded-[8px] px-4 py-2.5 text-[13.5px] font-medium ${fait ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--danger-soft)] text-[var(--danger)]"}`}>
          {fait ?? erreur}
        </p>
      )}

      <section aria-label="Où en est son livre" className="adm-figs">
        <div className="adm-fig">
          <span className="block text-[12.5px] text-[var(--ink-3)]">Phase</span>
          <span className="mt-1.5 block truncate text-[20px] font-semibold leading-[26px] tracking-[-0.02em]">{phase ? `${phase}. ${PHASE_LABELS[phase]}` : "—"}</span>
          <span className="mt-2.5 block"><Progress value={project?.phase_progress ?? 0} /></span>
        </div>
        <NightFigure label="Appels" value={c.interviews.length} hint={fmtDuration(totalSeconds)} />
        <NightFigure label="Récits" value={c.chapters.length} hint={`${fmtNumber(words)} mots`} />
        <NightFigure label="Livre composé" value={edition ? (EDITION_STATUS[edition.status] ?? EDITION_STATUS.failed).label : "—"} hint={edition ? `${edition.chapters.length} chapitre(s)` : "dès 2 récits"} />
      </section>

      <nav aria-label="Rubriques de la fiche" className="-mb-2 flex gap-6 overflow-x-auto border-b border-[var(--line)]">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin/clients/${id}?onglet=${t.id}`}
            aria-current={tab === t.id ? "page" : undefined}
            className={`-mb-px whitespace-nowrap border-b-2 pb-2.5 pt-1 text-[13.5px] font-medium ${tab === t.id ? "border-[var(--amber)] text-[var(--ink)]" : "border-transparent text-[var(--ink-3)] hover:text-[var(--ink)]"}`}
          >
            {t.label}
            {t.id === "appels" ? <span className="ml-1.5 tabular-nums text-[var(--ink-3)]">{c.interviews.length}</span> : t.id === "livre" ? <span className="ml-1.5 tabular-nums text-[var(--ink-3)]">{c.chapters.length}</span> : null}
          </Link>
        ))}
      </nav>

      {tab === "appels" && (
        <>
      <Panel title={`Appels (${c.interviews.length})`}>
        {c.interviews.length > 0 && (
          <div className="mb-4 rounded-[8px] border border-[var(--line)] p-3.5">
            <p className="text-[12.5px] text-[var(--ink-3)]">Ce que ces appels ont coûté</p>
            <p className="mt-1 text-[20px] font-semibold tracking-[-0.02em] tabular-nums">
              {fmtEur(spent.totalTtc)} TTC <span className="text-[14px] font-semibold text-[var(--ink-3)]">({fmtEur(spent.total)} HT{spent.estimated ? ", en partie estimé" : ""})</span>
            </p>
            <p className="mt-1 text-[13.5px] text-[var(--ink-2)]">
              Soit {fmtEur(spent.totalTtc / c.interviews.length)} TTC par appel en moyenne, tout compris (ligne, voix, IA, SMS, livre, écoute). Le détail est sous chaque appel.
            </p>
          </div>
        )}
        {c.interviews.length === 0 ? (
          <Empty>Aucun appel pour l’instant.</Empty>
        ) : (
          <ul className="grid gap-4">
            {c.interviews.map((i) => (
              <CallCard
                key={String(i.id)}
                profileId={id}
                interview={i}
                cost={costs.get(String(i.id))}
                review={reviews.get(String(i.id))}
                chapterNumber={(c.chapters.find((ch) => ch.latest_interview_id === i.id)?.chapter_number as number | undefined) ?? undefined}
                firstName={profile.first_name ?? "le narrateur"}
              />
            ))}
          </ul>
        )}
      </Panel>

        </>
      )}

      {tab === "livre" && (
        <>
      {project && order.fulfillment.completed && !order.refundedAt && (
        <Panel icon="book" title="Le livre, de la relecture à l’envoi" action={<Link href={`/admin/clients/${id}/livre`} className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--ink-2)] hover:text-[var(--ink)]">Relire et fichiers d’impression <AIcon name="arrow" size={14} /></Link>}>
          <BookSteps profileId={id} f={order.fulfillment} hasAddress={!!order.shipping} retour="fiche" completedAt={typeof project.project_metadata?.completed_at === "string" ? (project.project_metadata.completed_at as string) : null} />
        </Panel>
      )}

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

      <Panel icon="layers" title="Livre composé" action={c.editions.ready ? <Link href={`/admin/clients/${id}/livre`} className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--ink-2)] hover:text-[var(--ink)]">Relire le livre et demander l’avis de l’IA <AIcon name="arrow" size={14} /></Link> : undefined}>
        {!edition ? (
          <Empty>Pas encore composé (il faut au moins deux récits).</Empty>
        ) : (
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2 text-[14px]">
              <Badge tone={(EDITION_STATUS[edition.status] ?? EDITION_STATUS.failed).tone}>{(EDITION_STATUS[edition.status] ?? EDITION_STATUS.failed).label}</Badge>
              <span className="text-[var(--ink-3)]">mis à jour le {fmtDate(edition.updated_at)} · {edition.source_count} récit(s) source · {edition.chapters.length}/{edition.plan.length} chapitre(s)</span>
            </div>
            {edition.error && <p className="text-[14px] text-[var(--danger)]">{edition.error}</p>}
            {c.editions.ready && c.editions.ready !== edition && <p className="text-[14px] text-[var(--ink-3)]">Dernière version prête : {fmtDate(c.editions.ready.updated_at)}.</p>}
            {(c.editions.ready ?? edition).chapters.map((ch, n) => (
              <Fold key={n} summary={`${n + 1}. ${ch.title}`}>{ch.content}</Fold>
            ))}
          </div>
        )}
      </Panel>

        </>
      )}

      {tab === "fiche" && (
        <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Panel
          icon="user"
          title="Narrateur"
          className={editing ? "md:col-span-2 xl:col-span-3" : ""}
          action={editing ? undefined : <Link href={`/admin/clients/${id}?onglet=fiche&modifier=1`} className="adm-btn adm-btn-sec"><AIcon name="pen" size={14} /> Modifier</Link>}
        >
          {editing ? (
            <NarratorForm id={id} profile={profile} />
          ) : (
          <dl>
            <Field label="Prénom, nom">{name}</Field>
            <Field label="Prononcé">{profile.first_name_phonetic ?? "comme écrit"}</Field>
            <Field label="Téléphone">{profile.phone_number}</Field>
            <Field label="E-mail">{profile.email ? <Link className="underline" href={`/admin/mails?ecrire=${encodeURIComponent(profile.email)}`}>{profile.email}</Link> : null}</Field>
            <Field label="Tu / vous">{profile.politeness_preference === "tu" ? "tutoiement" : "vouvoiement"}</Field>
            <Field label="Style d’écriture">{profile.writing_style}</Field>
            <Field label="Sujets à éviter">{profile.sensitive_topics || "aucun"}</Field>
            <Field label="Compte créé">{fmtDate(profile.created_at)}</Field>
          </dl>
          )}
        </Panel>
        <Panel icon="card" title="Commande">
          <dl>
            <Field label="Payée le">{fmtDate(order.paidAt)}</Field>
            <Field label="Pour">{order.isGift ? "un proche (cadeau)" : "soi-même"}</Field>
            <Field label="E-mail acheteur">{order.buyerEmail}</Field>
            {order.giver && <Field label="Offert par">{`${order.giver.firstName ?? "?"} · ${order.giver.phone}`}</Field>}
            {order.family.length > 0 && <Field label="Espace famille">{order.family.map((m) => `${m.firstName ?? "?"} · ${m.phone}`).join(", ")}</Field>}
            <Field label="Durée d’appel voulue">{`${order.callMinutes} min`}</Field>
            <Field label="Exemplaires en plus">
              {order.extraCopies.length
                ? `${order.extraCopies.reduce((n, o) => n + o.copies, 0)} à imprimer : ` +
                  order.extraCopies
                    .map((o) =>
                      o.source === "commande"
                        ? `${o.copies} à la commande, avec le livre`
                        : `${o.copies} par ${o.by?.first_name ?? (o.source === "auteur" ? "l’auteur" : "un proche")} (espace ${o.source}) le ${fmtDate(o.at)}, ${o.shipping ? `à envoyer à ${o.shipping}` : "avec le livre"}`
                    )
                    .join(" ; ")
                : "aucun"}
            </Field>
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

      {project && (
        <Panel icon="pen" title="Agir">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-[10px] bg-[var(--canvas)] p-4">
              <p className="text-[14.5px] font-semibold">Relancer ce client</p>
              <p className="mt-1 text-[13.5px] text-[var(--ink-2)]">
                Envoie un SMS et un e-mail qui rappellent le numéro à appeler. Pour un livre offert sans aucun appel, la relance va à celui qui l’a offert. Elle part aussi toute seule après 14 jours sans appel.
                {order.relances.length > 0 && ` Dernière relance : ${fmtDate(order.relances[order.relances.length - 1].at)} (${order.relances.length} en tout).`}
              </p>
              <form action={`/api/admin/clients/${id}/relance`} method="post" className="mt-3">
                <button disabled={!!order.refundedAt} className="press inline-flex h-9 items-center rounded-[8px] bg-[var(--btn)] px-4 text-[14px] font-semibold text-[var(--on-btn)] disabled:opacity-40">Envoyer la relance</button>
              </form>
            </div>
            <div className="rounded-[10px] bg-[var(--canvas)] p-4">
              <p className="text-[14.5px] font-semibold">Rembourser ce client</p>
              {order.refundedAt ? (
                <p className="mt-1 text-[13.5px] text-[var(--ink-2)]">Remboursé le {fmtDate(order.refundedAt)}{order.refundAmount != null ? ` (${order.refundAmount} €)` : ""}. Le livre est fermé.</p>
              ) : !order.stripeSessionId ? (
                <p className="mt-1 text-[13.5px] text-[var(--ink-2)]">Pas de paiement Stripe lié à ce livre : rien à rembourser.</p>
              ) : (
                <>
                  <p className="mt-1 text-[13.5px] text-[var(--ink-2)]">Rembourse toute la commande dans Stripe, ferme le livre et arrête les rendez-vous. Le client reçoit un e-mail. On ne peut pas revenir en arrière.</p>
                  <form action={`/api/admin/clients/${id}/refund`} method="post" className="mt-3 flex flex-wrap items-center gap-2">
                    <input name="confirmation" required autoComplete="off" placeholder="Écrire REMBOURSER" aria-label="Écrire REMBOURSER pour confirmer" className="h-9 w-[200px] rounded-[8px] border border-[var(--line)] bg-[var(--surface)] px-3 text-[14px]" />
                    <button className="press inline-flex h-9 items-center rounded-[8px] bg-[var(--danger)] px-4 text-[14px] font-semibold text-white">Rembourser ce client</button>
                  </form>
                </>
              )}
            </div>
            <div className="rounded-[10px] bg-[var(--canvas)] p-4">
              <p className="text-[14.5px] font-semibold">{order.test ? "Client de test" : "Classer en test"}</p>
              <p className="mt-1 text-[13.5px] text-[var(--ink-2)]">
                {order.test
                  ? "Ce client ne compte dans aucun chiffre de l’admin (clients, commandes, argent, parcours). Il reste visible, rangé avec les tests."
                  : "Pour vos essais et ceux de vos proches : le client reste visible, mais sort de tous les chiffres. Une commande payée 0 € est classée en test toute seule."}
              </p>
              <form action={`/api/admin/clients/${id}/test`} method="post" className="mt-3">
                {order.test && <input type="hidden" name="annuler" value="1" />}
                <button className="press inline-flex h-9 items-center rounded-[8px] bg-[var(--surface)] px-4 text-[14px] font-semibold text-[var(--ink)] shadow-[0_0_0_1px_var(--line)]">
                  {order.test ? "C’est un vrai client" : "C’est un client de test"}
                </button>
              </form>
            </div>
          </div>
        </Panel>
      )}

        </>
      )}

      {tab === "coulisses" && (
        <>
      {project && (
        <Panel icon="spark" title="Ce que Loomina sait et prépare">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="grid gap-3">
              <div>
                <p className="text-[12px] font-medium text-[var(--ink-3)]">Où reprendre au prochain appel</p>
                <p className="mt-1 text-[14.5px]">{project.next_question_strategy ?? "Faire connaissance (premier appel)."}</p>
              </div>
              <div>
                <p className="text-[12px] font-medium text-[var(--ink-3)]">Sujets suggérés en attente</p>
                {ctx.suggested_topics?.length ? <ul className="mt-1 list-disc pl-5 text-[14px]">{ctx.suggested_topics.map((t) => <li key={t}>{t}</li>)}</ul> : <p className="mt-1 text-[14px] text-[var(--ink-3)]">Aucun</p>}
              </div>
              <div>
                <p className="text-[12px] font-medium text-[var(--ink-3)]">Sujets propres à cette personne</p>
                {topics.length ? (
                  <ul className="mt-1 grid gap-1 text-[14px]">
                    {topics.map((t) => <li key={t.id}><Badge tone={t.status === "open" ? "wait" : t.status === "done" ? "ok" : "muted"}>{t.status === "open" ? "à raconter" : t.status === "done" ? "raconté" : "pas souhaité"}</Badge> phase {t.phase} · {t.label}</li>)}
                  </ul>
                ) : <p className="mt-1 text-[14px] text-[var(--ink-3)]">Aucun</p>}
              </div>
              <div>
                <p className="text-[12px] font-medium text-[var(--ink-3)]">Corrections de l’auteur</p>
                {ctx.author_corrections?.length ? <ul className="mt-1 list-disc pl-5 text-[14px]">{ctx.author_corrections.map((t) => <li key={t}>{t}</li>)}</ul> : <p className="mt-1 text-[14px] text-[var(--ink-3)]">Aucune</p>}
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

      <Panel icon="server" title="Journal technique des appels">
        {c.events.length === 0 ? (
          <Empty>Aucun rapport d’appel reçu.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[13.5px]">
              <thead className="text-[12px] font-medium text-[var(--ink-3)]">
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
                            <button className="press whitespace-nowrap rounded-[7px] bg-[var(--btn)] px-3 py-1.5 text-[13px] font-semibold text-[var(--on-btn)]">Relancer</button>
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
        </>
      )}
    </div>
  );
}

const inputCls = "h-9 w-full rounded-[8px] border border-[var(--line)] bg-[var(--surface)] px-3 text-[14px]";

function Input({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block text-[13px]">
      <span className="mb-1.5 block font-medium text-[var(--ink-2)]">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12.5px] text-[var(--ink-3)]">{hint}</span>}
    </label>
  );
}

/** Corriger les infos du narrateur (demande de Solal, 25/11/2026). */
function NarratorForm({ id, profile }: { id: string; profile: { first_name: string | null; last_name: string | null; first_name_phonetic: string | null; phone_number: string | null; email: string | null; politeness_preference: string | null; writing_style: string | null; sensitive_topics: string | null } }) {
  const styles: string[] = [...WRITING_STYLES];
  if (profile.writing_style && !styles.includes(profile.writing_style)) styles.unshift(profile.writing_style);
  return (
    <form action={`/api/admin/clients/${id}/fiche`} method="post" className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Input label="Prénom">
          <input name="first_name" required maxLength={60} defaultValue={profile.first_name ?? ""} className={inputCls} />
        </Input>
        <Input label="Nom">
          <input name="last_name" maxLength={80} defaultValue={profile.last_name ?? ""} className={inputCls} />
        </Input>
        <Input label="Prononciation du prénom" hint="Vide : Loomina le dit comme il est écrit.">
          <input name="first_name_phonetic" maxLength={80} defaultValue={profile.first_name_phonetic ?? ""} className={inputCls} />
        </Input>
        <Input label="Téléphone" hint="Reconnaît le narrateur quand il appelle, et sert aux rendez-vous.">
          <input name="phone_number" type="tel" required maxLength={30} defaultValue={profile.phone_number ?? ""} className={`${inputCls} tabular-nums`} />
        </Input>
        <Input label="E-mail">
          <input name="email" type="email" maxLength={200} defaultValue={profile.email ?? ""} className={inputCls} />
        </Input>
        <Input label="Tu ou vous">
          <select name="politeness_preference" defaultValue={profile.politeness_preference === "tu" ? "tu" : "vous"} className={inputCls}>
            <option value="vous">Vouvoiement</option>
            <option value="tu">Tutoiement</option>
          </select>
        </Input>
        <Input label="Ton d’écriture">
          <select name="writing_style" defaultValue={profile.writing_style ?? WRITING_STYLES[0]} className={inputCls}>
            {styles.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Input>
        <div className="md:col-span-2">
          <Input label="Sujets à éviter" hint="Loomina n’en parlera pas, et ils restent hors du livre.">
            <textarea name="sensitive_topics" maxLength={1000} rows={2} defaultValue={profile.sensitive_topics ?? ""} className="w-full rounded-[8px] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[14px]" />
          </Input>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="adm-btn">Enregistrer</button>
        <Link href={`/admin/clients/${id}?onglet=fiche`} className="adm-btn adm-btn-sec">Annuler</Link>
      </div>
    </form>
  );
}
