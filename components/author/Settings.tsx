"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import type { Prefs } from "./types";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DAY_LABELS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const HOURS = Array.from({ length: 12 }, (_, i) => `${String(9 + i).padStart(2, "0")}:00`).flatMap((h) => [h, h.replace(":00", ":30")]).filter((h) => h <= "20:30");

const STYLES = ["Naturel et sobre", "Chaleureux et vivant", "Littéraire et soigné", "Simple, comme je parle"];

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
        body: JSON.stringify({ ...form, title: form.title ?? "", firstNamePhonetic: form.firstNamePhonetic ?? "", writingStyle: form.writingStyle ?? "" }),
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
    <form onSubmit={save} className="grid gap-4 lg:grid-cols-2">
      <section className="card p-6 md:p-8" aria-labelledby="reglages-livre">
        <h2 id="reglages-livre" className="t-heading">
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
            hint="Il figurera sur la couverture. Vous pourrez le changer jusqu’à l’impression."
          />
          <fieldset>
            <legend className="field-label">Ton de l’écriture</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {STYLES.map((s) => {
                const active = form.writingStyle === s;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={active}
                    onClick={() => update({ writingStyle: s })}
                    className={`press rounded-[14px] px-4 py-3 text-left text-[15px] font-semibold ${
                      active ? "bg-[var(--ink)] text-white" : "bg-[var(--canvas)] hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {form.writingStyle && !STYLES.includes(form.writingStyle) && (
              <p className="t-small mt-2">Ton actuel, choisi par Loomina d’après vos appels : « {form.writingStyle} ».</p>
            )}
          </fieldset>
        </div>
      </section>

      <section className="card p-6 md:p-8" aria-labelledby="reglages-appel">
        <h2 id="reglages-appel" className="t-heading">
          Vos appels avec Loomina
        </h2>
        <div className="mt-5 space-y-5">
          <fieldset>
            <legend className="field-label">Loomina s’adresse à vous en disant</legend>
            <div className="flex gap-2">
              {(["vous", "tu"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={form.politeness === p}
                  onClick={() => update({ politeness: p })}
                  className={`press min-h-12 flex-1 rounded-full text-[16px] font-bold ${
                    form.politeness === p ? "bg-[var(--ink)] text-white" : "bg-[var(--canvas)] hover:bg-[var(--surface-2)]"
                  }`}
                >
                  « {p} »
                </button>
              ))}
            </div>
          </fieldset>
          <Input
            label="Prononciation de votre prénom"
            name="phonetic"
            maxLength={80}
            value={form.firstNamePhonetic ?? ""}
            onChange={(e) => update({ firstNamePhonetic: e.target.value })}
            placeholder={firstName ?? "Votre prénom"}
            hint="Si la voix l’écorche, écrivez-le comme il se prononce (par exemple « Solale »)."
          />
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
              <Button onClick={addTopic} variant="secondary" disabled={!topic.trim()}>
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
            <p className="t-small mt-2">Loomina ne les abordera pas. Vous restez libre d’en parler vous-même.</p>
          </div>
        </div>
      </section>

      <section className="card p-6 md:p-8 lg:col-span-2" aria-labelledby="reglages-rendezvous">
        <h2 id="reglages-rendezvous" className="t-heading">
          Rendez-vous et nouvelles
        </h2>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <fieldset>
            <legend className="field-label">Loomina vous appelle de lui-même</legend>
            <div className="flex flex-wrap gap-2">
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
                      update({ callSchedule: { ...form.callSchedule, days, active: days.length > 0 } });
                    }}
                    className={`press min-h-12 min-w-14 rounded-full px-3 text-[15px] font-bold ${
                      on ? "bg-[var(--ink)] text-white" : "bg-[var(--canvas)] hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
            <label htmlFor="heure-appel" className="field-label mt-4 block">
              À quelle heure
            </label>
            <select
              id="heure-appel"
              className="field max-w-[12rem]"
              value={form.callSchedule.time}
              onChange={(e) => update({ callSchedule: { ...form.callSchedule, time: e.target.value } })}
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {`${Number(h.slice(0, 2))} h${h.endsWith("30") ? " 30" : ""}`}
                </option>
              ))}
            </select>
            <p className="t-small mt-2">
              {form.callSchedule.days.length
                ? "Loomina appellera le numéro de votre commande à ces moments-là. Vous pouvez toujours appeler quand vous voulez."
                : "Choisissez un ou plusieurs jours. Sans jour choisi, c’est vous qui appelez, quand vous voulez."}
            </p>
          </fieldset>
          <fieldset>
            <legend className="field-label">Prévenir quand un chapitre est prêt</legend>
            <div className="flex gap-2">
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  aria-pressed={form.smsChapter === v}
                  onClick={() => update({ smsChapter: v })}
                  className={`press min-h-12 flex-1 rounded-full text-[16px] font-bold ${
                    form.smsChapter === v ? "bg-[var(--ink)] text-white" : "bg-[var(--canvas)] hover:bg-[var(--surface-2)]"
                  }`}
                >
                  {v ? "Oui, par SMS" : "Non merci"}
                </button>
              ))}
            </div>
            <p className="t-small mt-2">Un SMS arrive quelques minutes après l’appel, avec le lien vers le nouveau chapitre.</p>
          </fieldset>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4 lg:col-span-2">
        <Button type="submit" size="lg" loading={status === "saving"}>
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
