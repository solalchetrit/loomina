"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import LiveBook from "@/components/LiveBook";
import Button from "@/components/ui/Button";
import { SITE } from "@/config/site";
import Progress from "./Progress";
import SuggestTopic from "./SuggestTopic";
import LifeStory from "./LifeStory";
import Calls from "./Calls";
import Settings from "./Settings";
import { formatDate, type Overview } from "./types";

const TABS = [
  { id: "apercu", label: "Aperçu" },
  { id: "livre", label: "Mon livre" },
  { id: "vie", label: "Ma vie" },
  { id: "appels", label: "Mes appels" },
  { id: "reglages", label: "Réglages" },
] as const;

type Tab = (typeof TABS)[number]["id"];

/** Le prochain appel : le numéro, et le sujet que Loomina a prévu d'aborder. */
function NextCall({ topic }: { topic: string | null }) {
  return (
    <section className="flex flex-col rounded-[var(--radius-card)] bg-[var(--ink)] p-7 text-white md:p-8" aria-labelledby="prochain-appel">
      <h2 id="prochain-appel" className="text-[15px] font-bold tracking-normal text-[var(--amber)]">
        Votre prochain appel
      </h2>
      {topic ? (
        <>
          <p className="mt-3 text-[15px] text-[#cfcfc8]">Loomina a prévu de commencer par :</p>
          <p className="mt-2 font-serif text-[clamp(1.3rem,2.1vw,1.6rem)] leading-snug text-white">« {topic} »</p>
        </>
      ) : (
        <p className="mt-3 text-[clamp(1.3rem,2.2vw,1.6rem)] font-bold leading-snug tracking-[-0.02em] text-white">Loomina reprendra là où vous vous étiez arrêté.</p>
      )}
      <div className="mt-auto pt-8">
        <a
          href={`tel:${SITE.phone}`}
          className="press inline-flex min-h-14 items-center rounded-full bg-[var(--amber)] px-7 text-[22px] font-extrabold tracking-[-0.02em] text-[var(--ink)] hover:bg-[#f4ac4b]"
        >
          {SITE.phoneDisplay}
        </a>
        <p className="mt-3 text-[15px] text-[#cfcfc8]">Depuis le numéro de votre commande, quand vous voulez.</p>
      </div>
    </section>
  );
}

export default function AuthorSpace({ onLogout, onUnauthorized }: { onLogout: () => void; onUnauthorized: () => void }) {
  const [tab, setTab] = useState<Tab>("apercu");
  const [data, setData] = useState<Overview | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/user/overview");
      if (res.status === 401) return onUnauthorized();
      if (!res.ok) throw new Error();
      setData(await res.json());
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    // Chargement initial depuis l'API : le setState arrive après la réponse réseau.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const project = data?.project ?? null;
  const title = data?.prefs.title || (data?.firstName ? `L’histoire de ${data.firstName}` : "Votre livre");
  const lastCall = project?.calls[0];

  return (
    <div className="w-full pb-24 pt-32 md:pb-32 md:pt-40">
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-6">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[16px] font-semibold text-[var(--ink-3)]">{title}</p>
            <h1 className="t-display mt-2">{data?.firstName ? `Bonjour ${data.firstName}` : "Bonjour"}</h1>
          </div>
          <Button onClick={onLogout} variant="secondary" className="self-start md:self-auto">
            Se déconnecter
          </Button>
        </header>

        <nav aria-label="Rubriques de l’espace auteur" className="-mx-5 mt-8 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <ul className="flex w-max gap-1 rounded-full bg-white p-1.5 shadow-[inset_0_0_0_1px_var(--line)]">
            {TABS.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  aria-current={tab === t.id ? "page" : undefined}
                  onClick={() => setTab(t.id)}
                  className={`press min-h-11 whitespace-nowrap rounded-full px-5 text-[15px] font-bold ${
                    tab === t.id ? "bg-[var(--ink)] text-white" : "text-[var(--ink-2)] hover:text-[var(--ink)]"
                  }`}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-6">
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
            <div className="flex flex-col gap-4">
              {project && <Progress project={project} />}
              <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                <NextCall topic={project?.nextTopic ?? null} />
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
                <button type="button" onClick={() => setTab("appels")} className="card lift press p-6 text-left md:p-8">
                  <span className="text-[15px] font-bold text-[var(--ink-3)]">Dernier appel · {formatDate(lastCall.date, false)}</span>
                  <span className="mt-2 block text-[17px] leading-relaxed">{lastCall.summary ?? "Appel enregistré."}</span>
                  <span className="link mt-3 inline-block text-[15px]">Tous vos appels</span>
                </button>
              )}
            </div>
          )}

          {data && tab === "livre" && (
            <div className="grid gap-4 lg:grid-cols-[1.9fr_1fr]">
              <LiveBook onUnauthorized={onUnauthorized} />
              <aside className="flex flex-col gap-4 lg:sticky lg:top-32 lg:self-start">
                <div className="card p-7">
                  <p className="text-[17px] font-bold">Corriger un passage</p>
                  <p className="t-body mt-2">Dites-le à Loomina au prochain appel : le chapitre sera réécrit avec votre correction.</p>
                </div>
                <div className="card p-7">
                  <p className="text-[17px] font-bold">Vos photos</p>
                  <p className="t-body mt-2">
                    Envoyez-les à{" "}
                    <a href={`mailto:contact@loomina.eu?subject=${encodeURIComponent("Photos pour mon livre")}`} className="link">
                      contact@loomina.eu
                    </a>
                    , en précisant le souvenir qu’elles illustrent.
                  </p>
                </div>
              </aside>
            </div>
          )}

          {data && tab === "vie" && (project ? <LifeStory project={project} /> : null)}
          {data && tab === "appels" && (project ? <Calls project={project} /> : null)}
          {data && tab === "reglages" && (
            <Settings
              prefs={data.prefs}
              firstName={data.firstName}
              onSaved={(prefs) => setData((d) => (d ? { ...d, prefs } : d))}
              onUnauthorized={onUnauthorized}
            />
          )}
        </div>
      </div>
    </div>
  );
}
