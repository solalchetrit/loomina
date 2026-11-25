"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ComposedBook from "./ComposedBook";
import BookCopies from "./BookCopies";
import Icon, { type IconName } from "@/components/ui/Icon";
import { SITE } from "@/config/site";
import Progress from "./Progress";
import Companion from "./Companion";
import SuggestTopic from "./SuggestTopic";
import LifeStory from "./LifeStory";
import Calls from "./Calls";
import Settings from "./Settings";
import FamilyAccess from "./FamilyAccess";
import Photos from "./Photos";
import Onboarding from "./Onboarding";
import NextCallBooking from "./NextCallBooking";
import type { CallOnceValue } from "./CallOncePicker";
import { describeSchedule } from "@/lib/loomina/schedule";
import Shipping from "./Shipping";
import { formatDate, type Overview } from "./types";

// `short` : le libellé de la barre du bas, sur téléphone (cinq onglets tiennent sur 320 px).
const TABS: readonly { id: string; label: string; short: string; icon: IconName }[] = [
  { id: "apercu", label: "Aperçu", short: "Aperçu", icon: "home" },
  { id: "livre", label: "Mon livre", short: "Livre", icon: "book" },
  { id: "vie", label: "Ma vie", short: "Ma vie", icon: "heart" },
  { id: "appels", label: "Mes appels", short: "Appels", icon: "phone" },
  { id: "reglages", label: "Réglages", short: "Réglages", icon: "sliders" },
] as const;

type Tab = "apercu" | "livre" | "vie" | "appels" | "reglages";

/** Le prochain appel : le numéro, et le sujet que Loomina a prévu d'aborder. */
/**
 * « Votre prochain appel » : le sujet prévu, la réservation du prochain appel
 * (jour et heure, demande de Solal 25/11/2026), le numéro, et un lien vers
 * Réglages pour les rendez-vous de la semaine.
 */
function NextCall({
  topic,
  schedule,
  weekly,
  callOnce,
  canBook,
  onBooked,
  onSettings,
  onUnauthorized,
}: {
  topic: string | null;
  schedule?: string | null;
  /** « chaque mardi à 15 h », ou null. */
  weekly: string | null;
  callOnce: CallOnceValue;
  canBook: boolean;
  onBooked: () => void;
  onSettings: () => void;
  onUnauthorized: () => void;
}) {
  return (
    <section className="flex min-w-0 flex-col rounded-[var(--radius-card)] bg-[var(--ink)] p-6 text-white md:p-7" aria-labelledby="prochain-appel">
      <h2 id="prochain-appel" className="text-[17px] font-bold tracking-normal text-[var(--amber)]">
        Votre prochain appel
      </h2>
      {topic ? (
        <>
          <p className="mt-3 text-[16px] text-[#cfcfc8]">Loomina a prévu de commencer par :</p>
          <p className="mt-2 font-serif text-[clamp(1.4rem,2.1vw,1.75rem)] leading-[1.3] text-white">« {topic} »</p>
        </>
      ) : (
        <p className="mt-3 text-[clamp(1.4rem,2.1vw,1.7rem)] font-bold leading-snug tracking-[-0.02em] text-white">Loomina reprendra là où vous vous étiez arrêté.</p>
      )}
      {canBook && <NextCallBooking value={callOnce} onSaved={onBooked} onUnauthorized={onUnauthorized} />}
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5">
        <a
          href={`tel:${SITE.phone}`}
          className="press inline-flex min-h-12 shrink-0 items-center rounded-full border border-white/25 px-6 text-[20px] font-extrabold tracking-[-0.02em] text-white hover:border-[var(--amber)] hover:text-[var(--amber)]"
        >
          {SITE.phoneDisplay}
        </a>
        <p className="min-w-[12rem] flex-1 text-[15px] leading-snug text-[#cfcfc8]">
          {canBook
            ? "Ou appelez Loomina quand vous voulez."
            : schedule
              ? `Loomina vous appelle ${schedule}. Vous pouvez aussi appeler quand vous voulez.`
              : "Depuis le numéro de votre commande, quand vous voulez."}
        </p>
      </div>
      {canBook && (
        <p className="mt-3 text-[15px] text-[#cfcfc8]">
          {weekly ? `Rendez-vous ${weekly}. ` : "Un appel chaque semaine ? "}
          <button type="button" onClick={onSettings} className="font-semibold text-white underline decoration-[var(--amber)] underline-offset-4 hover:text-[var(--amber)]">
            {weekly ? "Modifier" : "Réglages"}
          </button>
        </p>
      )}
    </section>
  );
}

export default function AuthorSpace({
  onLogout,
  onUnauthorized,
  onNotAuthor,
}: {
  onLogout: () => void;
  onUnauthorized: () => void;
  /** Le numéro connecté n'est celui d'aucun auteur : c'est peut-être celui d'une personne qui a offert un livre. */
  onNotAuthor: () => void;
}) {
  const [tab, setTabState] = useState<Tab>("apercu");
  const [replay, setReplay] = useState(false);
  // Changer d'onglet ramène en haut : sur téléphone, la barre du bas reste sous le pouce
  // et la nouvelle rubrique commence à son titre, pas au milieu de la précédente.
  const setTab = useCallback((next: Tab) => {
    setTabState(next);
    if (typeof window !== "undefined" && window.scrollY > 0) window.scrollTo({ top: 0 });
  }, []);
  // Retour de Stripe après des exemplaires payés : l'onglet « Le livre », où BookCopies dit merci.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("exemplaires") !== "merci") return;
    const id = window.setTimeout(() => setTabState("livre"), 0);
    return () => window.clearTimeout(id);
  }, []);
  const [data, setData] = useState<Overview | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/user/overview");
      if (res.status === 401) return onUnauthorized();
      if (res.status === 404) return onNotAuthor();
      if (!res.ok) throw new Error();
      setData(await res.json());
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [onUnauthorized, onNotAuthor]);

  useEffect(() => {
    // Chargement initial depuis l'API : le setState arrive après la réponse réseau.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  // Tant que l'espace auteur est ouvert, le menu et le pied de page du site s'effacent (voir globals.css).
  useEffect(() => {
    document.documentElement.dataset.space = "auteur";
    return () => {
      delete document.documentElement.dataset.space;
    };
  }, []);

  const project = data?.project ?? null;
  const title = data?.prefs.title || (data?.firstName ? `L’histoire de ${data.firstName}` : "Votre livre");
  const lastCall = project?.calls[0];

  return (
    <div className="author-space w-full pb-10 pt-[5.9rem] md:pt-[6.5rem]">
      {/* Le menu de l'espace auteur : la même barre flottante que le site, avec ses rubriques.
          Le logo ramène au site grand public (Solal, 19/11/2026). */}
      <header className="fixed inset-x-0 top-0 z-[1000] px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-3 rounded-[22px] border border-white/70 bg-white/80 pl-5 pr-2.5 shadow-[var(--shadow-bar)] backdrop-blur-xl backdrop-saturate-150 md:h-[68px] md:pl-6">
          {/* Le repère de l'espace : le logo, signé « AUTEUR » dessous, comme une maison signe une collection. */}
          <Link href="/" className="flex shrink-0 flex-col" aria-label="Loomina, espace auteur. Retour au site">
            <span className="relative block h-[26px] w-[91px] md:h-[28px] md:w-[98px]">
              <Image src="/header-logo-bleu.png" alt="" fill className="object-contain object-left" priority sizes="98px" />
            </span>
            <span aria-hidden="true" className="mt-[5px] flex items-center gap-2">
              <span className="h-px flex-1 bg-[var(--amber)]" />
              <span className="-mr-[0.32em] text-[9.5px] font-bold uppercase leading-none tracking-[0.32em] text-[var(--amber-ink)]">Auteur</span>
            </span>
          </Link>

          <nav aria-label="Rubriques de l’espace auteur" className="hidden md:block">
            <ul className="flex items-center gap-0.5">
              {TABS.map((t) => {
                const active = tab === t.id;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      aria-current={active ? "page" : undefined}
                      onClick={() => setTab(t.id as Tab)}
                      className={`press inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-[14px] px-3 text-[15px] font-bold transition-colors duration-150 lg:px-3.5 ${
                        active ? "bg-[var(--ink)] text-white" : "text-[var(--ink-2)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
                      }`}
                    >
                      <Icon name={t.icon} size={18} className={active ? "text-[var(--amber)]" : ""} />
                      {t.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <button
            type="button"
            onClick={onLogout}
            aria-label="Se déconnecter"
            className="press inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-[14px] px-3 text-[15px] font-bold text-[var(--ink)] hover:bg-[var(--canvas)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            <span className="hidden lg:inline">Se déconnecter</span>
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-6">
        <header className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5">
          <h1 className="text-[clamp(1.6rem,2.6vw,2rem)] font-extrabold leading-[1.1] tracking-[-0.03em]">
            {tab === "apercu" ? (data?.firstName ? `Bonjour ${data.firstName}` : "Bonjour") : TABS.find((t) => t.id === tab)?.label}
          </h1>
          {tab === "apercu" && <p className="text-[15px] font-semibold text-[var(--ink-3)]">{title}</p>}
        </header>

        {data?.welcome && <Onboarding ask={data.welcome} prefs={data.prefs} firstName={data.firstName} onDone={load} onUnauthorized={onUnauthorized} />}
        {data && replay && (
          <Onboarding ask={{ politeness: true, topics: true }} prefs={data.prefs} firstName={data.firstName} preview onDone={() => setReplay(false)} onUnauthorized={onUnauthorized} />
        )}

        <div className={tab === "apercu" ? "mt-4" : "mt-5"}>
          {failed && (
            <p role="alert" className="rounded-[14px] bg-[#fbeae6] px-4 py-3 text-[16px] font-medium text-[var(--danger)]">
              Nous n’arrivons pas à charger votre espace pour le moment.{" "}
              <button type="button" onClick={load} className="underline underline-offset-4">
                Réessayer
              </button>
            </p>
          )}

          {!data && !failed && (
            <p className="t-body flex items-center gap-3" role="status">
              <span className="spinner" aria-hidden="true" />
              Nous ouvrons votre espace…
            </p>
          )}

          {data && tab === "apercu" && (
            <div className="flex flex-col gap-3">
              {project?.completed && <Shipping saved={data.shipping ?? null} delivery={data.delivery} firstName={data.firstName} onSaved={load} onUnauthorized={onUnauthorized} />}
              {project && (project.weave ? <Companion project={project} demo={data.demo} skipIntro={Boolean(data.welcome)} /> : <Progress project={project} />)}
              <div className="grid gap-3 lg:grid-cols-[1fr_1.2fr]">
                <NextCall
                  topic={project?.nextTopic ?? null}
                  schedule={project?.scheduleText}
                  weekly={describeSchedule(data.prefs.callSchedule)}
                  callOnce={data.prefs.callOnce ?? null}
                  canBook={Boolean(project && !project.completed)}
                  onBooked={load}
                  onSettings={() => setTab("reglages")}
                  onUnauthorized={onUnauthorized}
                />
                {project ? (
                  <SuggestTopic
                    questions={project.openQuestions}
                    onAdded={(openQuestions) => setData((d) => (d?.project ? { ...d, project: { ...d.project, openQuestions } } : d))}
                    onUnauthorized={onUnauthorized}
                  />
                ) : (
                  <section className="card p-7">
                    <h2 className="t-heading">Votre livre n’est pas encore ouvert</h2>
                    <p className="t-body mt-2">
                      Il se crée à la commande.{" "}
                      <Link href="/order" className="link">
                        Commander
                      </Link>
                    </p>
                  </section>
                )}
              </div>
              {lastCall && (
                <button type="button" onClick={() => setTab("appels")} className="card lift press px-6 py-4 text-left">
                  <span className="text-[14px] font-bold text-[var(--ink-3)]">Dernier appel · {formatDate(lastCall.date, false)}</span>
                  {lastCall.title && <span className="mt-1 block text-[17px] font-bold leading-snug">{lastCall.title}</span>}
                  <span className={`line-clamp-2 text-[15px] leading-normal ${lastCall.title ? "mt-0.5 text-[var(--ink-2)]" : "mt-1"}`}>{lastCall.summary ?? "Appel enregistré."}</span>
                  <span className="link mt-1.5 inline-block text-[14px]">Tous vos appels</span>
                </button>
              )}
              {data.demo && (
                // Livre d'exemple seulement : revoir l'accueil que découvre un nouvel auteur.
                <button type="button" onClick={() => setReplay(true)} className="link self-center text-[14px]">
                  Revoir l’accueil d’un nouvel auteur
                </button>
              )}
            </div>
          )}

          {data && tab === "livre" && (
            <ComposedBook
              onUnauthorized={onUnauthorized}
              aside={<Photos onUnauthorized={onUnauthorized} />}
              after={project ? <BookCopies compact extraCopies={data.extraCopies ?? 0} endpoint="/api/user/exemplaires" onUnauthorized={onUnauthorized} /> : null}
            />
          )}

          {data && tab === "vie" &&
            (project ? (
              <LifeStory
                project={project}
                onPersonAdded={(family, openQuestions) => setData((d) => (d?.project ? { ...d, project: { ...d.project, family, openQuestions } } : d))}
                onUnauthorized={onUnauthorized}
              />
            ) : null)}
          {data && tab === "appels" && (project ? <Calls project={project} onUnauthorized={onUnauthorized} /> : null)}
          {data && tab === "reglages" && (
            <div className="flex flex-col gap-4 lg:gap-5">
              <Settings
                prefs={data.prefs}
                firstName={data.firstName}
                onSaved={(prefs) => setData((d) => (d ? { ...d, prefs: { ...prefs, family: d.prefs.family } } : d))}
                onUnauthorized={onUnauthorized}
              />
              {project && (
                <FamilyAccess
                  family={data.prefs.family ?? []}
                  shared={data.prefs.shareWithGiver}
                  onChange={(family) => setData((d) => (d ? { ...d, prefs: { ...d.prefs, family, giverFirstName: d.prefs.giverFirstName ?? (family.length ? "" : null) } } : d))}
                  onUnauthorized={onUnauthorized}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Téléphone : les rubriques en barre fixe en bas d'écran, à portée de pouce, comme une application.
          Avant, la rangée d'onglets du haut faisait 543 px pour un écran de 390 : « Mes appels » et
          « Réglages » sortaient de l'écran sans que rien ne le signale. */}
      <div aria-hidden="true" className="h-[calc(5.5rem+env(safe-area-inset-bottom))] md:hidden" />
      <nav
        aria-label="Rubriques de l’espace auteur"
        className="fixed inset-x-0 bottom-0 z-[900] border-t border-[var(--line)] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => setTab(t.id as Tab)}
                  className={`press flex min-h-[4.25rem] w-full flex-col items-center justify-center gap-1 px-1 text-[13px] font-bold leading-none ${
                    active ? "text-[var(--ink)]" : "text-[var(--ink-3)]"
                  }`}
                >
                  <span
                    className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors ${active ? "bg-[var(--amber-soft)] text-[var(--amber-deep)]" : ""}`}
                  >
                    <Icon name={t.icon} size={22} />
                  </span>
                  {t.short}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
