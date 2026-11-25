"use client";

import { useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import type { Prefs } from "./types";
import CallOncePicker from "./CallOncePicker";
import { describeCallOnce } from "@/lib/loomina/schedule";
import { CALL_MINUTES_OPTIONS } from "@/lib/loomina/call-length";
import { WRITING_STYLES, normalizeStyle } from "@/lib/loomina/styles";

export const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
export const DAY_LABELS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
export const CALL_HOURS = Array.from({ length: 12 }, (_, i) => `${String(9 + i).padStart(2, "0")}:00`).flatMap((h) => [h, h.replace(":00", ":30")]).filter((h) => h <= "20:30");

const STYLES: readonly string[] = WRITING_STYLES;

/** Réglages de l'entretien et du livre. Lus par Loomina dès l'appel suivant. */
export default function Settings({
  prefs,
  firstName,
  onSaved,
  onUnauthorized,
}: {
  prefs: Prefs;
  firstName: string | null;
  onSaved: (prefs: Prefs) => void;
  onUnauthorized: () => void;
}) {
  const [form, setForm] = useState(prefs);
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Le rendez-vous s'enregistre dès qu'on touche un jour ou l'heure, sans attendre
  // « Enregistrer » en bas de page (23/11/2026 : un rendez-vous choisi mais jamais
  // enregistré, l'appel n'est pas parti). Seul le dernier choix compte.
  const [scheduleStatus, setScheduleStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const scheduleSeq = useRef(0);
  const saveSchedule = async (callSchedule: Prefs["callSchedule"]) => {
    const seq = ++scheduleSeq.current;
    setScheduleStatus("saving");
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callSchedule }),
      });
      if (res.status === 401) return onUnauthorized();
      if (!res.ok) throw new Error();
      if (seq !== scheduleSeq.current) return;
      onSaved({ ...prefs, callSchedule });
      setScheduleStatus("saved");
    } catch {
      if (seq === scheduleSeq.current) setScheduleStatus("error");
    }
  };
  const updateSchedule = (callSchedule: Prefs["callSchedule"]) => {
    setForm((f) => ({ ...f, callSchedule }));
    void saveSchedule(callSchedule);
  };

  // L'appel à date unique s'enregistre de la même façon, dès qu'on le touche.
  const [onceStatus, setOnceStatus] = useState<"idle" | "saving" | "saved" | "error" | "past">("idle");
  const onceSeq = useRef(0);
  const updateOnce = async (callOnce: Prefs["callOnce"]) => {
    setForm((f) => ({ ...f, callOnce }));
    const seq = ++onceSeq.current;
    setOnceStatus("saving");
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callOnce }),
      });
      if (res.status === 401) return onUnauthorized();
      if (seq !== onceSeq.current) return;
      if (res.status === 400) return setOnceStatus("past");
      if (!res.ok) throw new Error();
      onSaved({ ...prefs, callOnce });
      setOnceStatus("saved");
    } catch {
      if (seq === onceSeq.current) setOnceStatus("error");
    }
  };

  const update = (patch: Partial<Prefs>) => {
    setForm((f) => ({ ...f, ...patch }));
    setStatus("idle");
  };

  const addTopic = () => {
    const t = topic.trim();
    if (t && !form.sensitiveTopics.includes(t)) update({ sensitiveTopics: [...form.sensitiveTopics, t] });
    setTopic("");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, callOnce: undefined, title: form.title ?? "", firstNamePhonetic: form.firstNamePhonetic ?? "", writingStyle: form.writingStyle ?? "" }),
      });
      if (res.status === 401) return onUnauthorized();
      if (!res.ok) throw new Error();
      onSaved(form);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={save} className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2 lg:gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)]">
      <section className="card p-6 md:p-7" aria-labelledby="reglages-livre">
        <h2 id="reglages-livre" className="text-[19px] font-extrabold leading-tight tracking-[-0.02em]">
          Votre livre
        </h2>
        <div className="mt-5 space-y-5">
          <Input
            label="Titre du livre"
            name="title"
            maxLength={120}
            value={form.title ?? ""}
            onChange={(e) => update({ title: e.target.value })}
            placeholder={firstName ? `L’histoire de ${firstName}` : "Mon histoire"}
          />
          <fieldset className="min-w-0">
            <legend className="field-label">Ton de l’écriture</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {STYLES.map((s) => {
                const active = normalizeStyle(form.writingStyle) === s;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={active}
                    onClick={() => update({ writingStyle: s })}
                    className={`press rounded-[12px] px-3.5 py-2.5 text-left text-[15px] font-semibold ${
                      active ? "bg-[var(--ink)] text-white" : "bg-[var(--canvas)] hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {form.writingStyle && !STYLES.includes(normalizeStyle(form.writingStyle)) && (
              <p className="t-small mt-1.5">Ton actuel, choisi par Loomina d’après vos appels : « {form.writingStyle} ».</p>
            )}
          </fieldset>
        </div>
      </section>

      <section className="card p-6 md:p-7" aria-labelledby="reglages-appel">
        <h2 id="reglages-appel" className="text-[19px] font-extrabold leading-tight tracking-[-0.02em]">
          Vos appels avec Loomina
        </h2>
        <div className="mt-5 space-y-5">
          <fieldset className="min-w-0">
            <legend className="field-label">Loomina vous dit</legend>
            <div className="flex gap-2">
              {(["vous", "tu"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={form.politeness === p}
                  onClick={() => update({ politeness: p })}
                  className={`press min-h-11 flex-1 rounded-full text-[15px] font-bold ${
                    form.politeness === p ? "bg-[var(--ink)] text-white" : "bg-[var(--canvas)] hover:bg-[var(--surface-2)]"
                  }`}
                >
                  « {p} »
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="sujet-evite" className="field-label">
              Sujets à ne pas aborder
            </label>
            <div className="flex gap-2">
              <input
                id="sujet-evite"
                className="field"
                maxLength={80}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTopic();
                  }
                }}
                placeholder="Par exemple : la guerre"
              />
              <Button onClick={addTopic} variant="secondary" disabled={!topic.trim()} className="!min-h-[46px] !px-4 !text-[15px]">
                Ajouter
              </Button>
            </div>
            {form.sensitiveTopics.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {form.sensitiveTopics.map((t) => (
                  <li key={t}>
                    <button
                      type="button"
                      onClick={() => update({ sensitiveTopics: form.sensitiveTopics.filter((x) => x !== t) })}
                      className="press inline-flex items-center gap-2 rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-[14px] font-semibold hover:bg-[var(--line)]"
                      aria-label={`Retirer « ${t} »`}
                    >
                      {t} <span aria-hidden="true">×</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Input
            label="Prononciation de votre prénom"
            name="phonetic"
            maxLength={80}
            value={form.firstNamePhonetic ?? ""}
            onChange={(e) => update({ firstNamePhonetic: e.target.value })}
            placeholder={firstName ?? "Votre prénom"}
            hint="Écrivez-le comme il se prononce."
          />
        </div>
      </section>

      <section className="card p-6 md:p-7 lg:col-span-2 xl:col-span-1" aria-labelledby="reglages-rendezvous">
        <h2 id="reglages-rendezvous" className="text-[19px] font-extrabold leading-tight tracking-[-0.02em]">
          Rendez-vous et nouvelles
        </h2>
        <div className="mt-5 grid gap-x-8 gap-y-5 md:grid-cols-2 xl:grid-cols-1">
          <fieldset className="min-w-0">
            <legend className="field-label">Loomina vous appelle le</legend>
            <div className="flex gap-1.5">
              {DAYS.map((d, i) => {
                const day = i + 1;
                const on = form.callSchedule.days.includes(day);
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={on}
                    aria-label={DAY_LABELS[i]}
                    onClick={() => {
                      const days = on ? form.callSchedule.days.filter((x) => x !== day) : [...form.callSchedule.days, day].sort();
                      updateSchedule({ ...form.callSchedule, days, active: days.length > 0 });
                    }}
                    className={`press min-h-11 min-w-0 flex-1 rounded-full px-0 text-[13.5px] font-bold sm:text-[14px] ${
                      on ? "bg-[var(--ink)] text-white" : "bg-[var(--canvas)] hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-3">
            <label htmlFor="heure-appel" className="field-label !mb-0">
              À quelle heure
            </label>
            <select
              id="heure-appel"
              className="field max-w-[8.5rem]"
              value={form.callSchedule.time}
              onChange={(e) => updateSchedule({ ...form.callSchedule, time: e.target.value })}
            >
              {CALL_HOURS.map((h) => (
                <option key={h} value={h}>
                  {`${Number(h.slice(0, 2))} h${h.endsWith("30") ? " 30" : ""}`}
                </option>
              ))}
            </select>
            </div>
            {form.callSchedule.days.length === 0 && !form.callOnce && <p className="t-small mt-1.5">Sans jour choisi, c’est vous qui appelez, quand vous voulez.</p>}
            <p role="status" className="mt-1.5 text-[14px] font-semibold">
              {scheduleStatus === "saved" && <span className="text-[var(--success)]">{form.callSchedule.days.length ? "Rendez-vous enregistré." : "Rendez-vous retiré."}</span>}
              {scheduleStatus === "error" && <span className="text-[var(--danger)]">Le rendez-vous n’a pas été enregistré. Réessayez.</span>}
            </p>
          </fieldset>
          <fieldset className="min-w-0">
            <legend className="field-label">Ou une seule fois, à une date précise</legend>
            <CallOncePicker idPrefix="reglages-une-fois" value={form.callOnce} onChange={(v) => void updateOnce(v)} />
            <p role="status" className="mt-1.5 text-[14px] font-semibold">
              {onceStatus === "saved" && (
                <span className="text-[var(--success)]">
                  {form.callOnce ? `Loomina vous appellera ${describeCallOnce(form.callOnce) ?? ""}.` : "Appel retiré."}
                </span>
              )}
              {onceStatus === "past" && <span className="text-[var(--danger)]">Cette heure est déjà passée. Choisissez-en une autre.</span>}
              {onceStatus === "error" && <span className="text-[var(--danger)]">L’appel n’a pas été enregistré. Réessayez.</span>}
            </p>
          </fieldset>
          <fieldset className="min-w-0">
            <legend className="field-label">Durée d’un appel</legend>
            <div className="flex flex-wrap gap-2">
              {CALL_MINUTES_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={form.callMinutes === m}
                  onClick={() => update({ callMinutes: m })}
                  className={`press min-h-11 flex-1 rounded-full px-3 text-[15px] font-bold ${
                    form.callMinutes === m ? "bg-[var(--ink)] text-white" : "bg-[var(--canvas)] hover:bg-[var(--surface-2)]"
                  }`}
                >
                  {m} min
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="min-w-0">
            <legend className="field-label">Un SMS quand votre récit est prêt</legend>
            <div className="flex gap-2">
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  aria-pressed={form.smsChapter === v}
                  onClick={() => update({ smsChapter: v })}
                  className={`press min-h-11 flex-1 rounded-full text-[15px] font-bold ${
                    form.smsChapter === v ? "bg-[var(--ink)] text-white" : "bg-[var(--canvas)] hover:bg-[var(--surface-2)]"
                  }`}
                >
                  {v ? "Oui" : "Non merci"}
                </button>
              ))}
            </div>
          </fieldset>
          {(form.giverFirstName !== null || (prefs.family?.length ?? 0) > 0) && (
            <fieldset className="min-w-0">
              <legend className="field-label">
                {(prefs.family?.length ?? 0) > 1 || form.giverFirstName === null
                  ? "Laisser votre famille lire vos récits"
                  : `Laisser ${form.giverFirstName || "la personne qui vous a offert ce livre"} lire vos récits`}
              </legend>
              <div className="flex gap-2">
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    aria-pressed={form.shareWithGiver === v}
                    onClick={() => update({ shareWithGiver: v })}
                    className={`press min-h-11 flex-1 rounded-full text-[15px] font-bold ${
                      form.shareWithGiver === v ? "bg-[var(--ink)] text-white" : "bg-[var(--canvas)] hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    {v ? "Oui" : "Pas pour l’instant"}
                  </button>
                ))}
              </div>
              <p className="t-small mt-1.5">Sans votre accord, votre famille voit seulement que le livre avance.</p>
            </fieldset>
          )}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4 lg:col-span-2 xl:col-span-3">
        <Button type="submit" loading={status === "saving"} className="max-sm:w-full">
          Enregistrer
        </Button>
        <p role="status" className="text-[15px] font-semibold">
          {status === "saved" && <span className="text-[var(--success)]">Enregistré : Loomina en tiendra compte dès le prochain appel.</span>}
          {status === "error" && <span className="text-[var(--danger)]">L’enregistrement n’a pas abouti. Réessayez.</span>}
        </p>
      </div>
    </form>
  );
}
