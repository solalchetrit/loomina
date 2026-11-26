"use client";

import { useMemo, useState } from "react";
import Icon from "@/components/ui/Icon";
import { addDays, describeCallOnce, parisNow } from "@/lib/loomina/schedule";

export type CallOnceValue = { date: string; time: string } | null;

const WEEK_HEAD = ["L", "M", "M", "J", "V", "S", "D"];
const WEEK_NAMES = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
/** Une heure par bouton, de 9 h à 20 h : douze boutons lisibles plutôt qu'une liste de vingt-quatre. */
const HOURS = Array.from({ length: 12 }, (_, i) => `${String(9 + i).padStart(2, "0")}:00`);
const DAYS_AHEAD = 14;

const hourLabel = (h: string) => `${Number(h.slice(0, 2))} h${h.endsWith("00") ? "" : ` ${h.slice(3)}`}`;
const toDate = (ymd: string) => new Date(`${ymd}T12:00:00Z`);
const weekday = (ymd: string) => (toDate(ymd).getUTCDay() + 6) % 7; // 0 = lundi

/**
 * Un seul appel, à une date précise (demande de Solal, 25/11/2026) : « ce lundi
 * à 10 h, Loomina m'appelle ». Surtout pour le premier appel.
 *
 * Refait le 26/11/2026 (Solal : « le module est très, très moche ») : plus de
 * listes déroulantes. Une ligne « Choisir une date » ouvre un petit calendrier
 * des deux semaines à venir, rangé par semaine comme un vrai calendrier, puis
 * douze boutons d'heure. Une fois choisi, l'appel s'affiche en une carte avec
 * « Changer » et « Retirer ». Grands chiffres, cibles de 44 px au moins.
 * Utilisé dans l'accueil de l'espace auteur et dans Réglages.
 */
export default function CallOncePicker({
  value,
  onChange,
  idPrefix,
}: {
  value: CallOnceValue;
  onChange: (v: CallOnceValue) => void;
  idPrefix: string;
}) {
  const [open, setOpen] = useState(false);

  // Les heures encore possibles aujourd'hui : au moins un quart d'heure devant soi.
  const { weeks, hoursFor, first, last, today } = useMemo(() => {
    const p = parisNow();
    const soon = p.minutes + 15;
    const hoursFor = (date: string) =>
      date === p.ymd ? HOURS.filter((h) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3)) >= soon) : HOURS;
    const first = hoursFor(p.ymd).length > 0 ? p.ymd : addDays(p.ymd, 1);
    const last = addDays(p.ymd, DAYS_AHEAD - 1);
    // Du lundi de la première semaine au dimanche de la dernière.
    const start = addDays(first, -weekday(first));
    const end = addDays(last, 6 - weekday(last));
    const weeks: string[][] = [];
    for (let d = start; d <= end; d = addDays(d, 7)) weeks.push(Array.from({ length: 7 }, (_, i) => addDays(d, i)));
    return { weeks, hoursFor, first, last, today: p.ymd };
  }, []);

  const monthTitle = useMemo(() => {
    const a = toDate(first).getUTCMonth();
    const b = toDate(last).getUTCMonth();
    const t = a === b ? MONTHS[a] : `${MONTHS[a]} – ${MONTHS[b]}`;
    return t.charAt(0).toUpperCase() + t.slice(1);
  }, [first, last]);

  const pickDay = (date: string) => {
    const hours = hoursFor(date);
    const keep = value?.time && hours.includes(value.time) ? value.time : hours.includes("10:00") ? "10:00" : hours[0];
    onChange({ date, time: keep });
  };

  const described = value ? describeCallOnce(value) : null;

  // Fermé, rien de choisi : une seule ligne qui ouvre le calendrier.
  if (!open && !described) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press flex min-h-14 w-full items-center gap-3 rounded-[16px] bg-[var(--canvas)] px-4 text-left hover:bg-[var(--surface-2)]"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[var(--ink)]">
          <Icon name="calendar" size={19} />
        </span>
        <span className="flex-1 text-[16px] font-bold">Choisir une date</span>
        <Icon name="arrow" size={18} className="text-[var(--ink-3)]" />
      </button>
    );
  }

  // Fermé, un appel choisi : la carte de l'appel.
  if (!open && described) {
    return (
      <div className="flex items-start gap-3 rounded-[16px] bg-[var(--canvas)] p-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--ink)] text-white">
          <Icon name="phone" size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-[var(--ink-3)]">Loomina vous appelle</p>
          <p className="text-[17px] font-extrabold leading-snug first-letter:uppercase">{described}</p>
          <div className="mt-2 flex gap-5 text-[15px] font-semibold">
            <button type="button" onClick={() => setOpen(true)} className="underline decoration-[var(--amber-line)] decoration-2 underline-offset-4 hover:decoration-[var(--amber)]">
              Changer
            </button>
            <button type="button" onClick={() => onChange(null)} className="text-[var(--ink-3)] underline decoration-[var(--line)] decoration-2 underline-offset-4 hover:text-[var(--ink)]">
              Retirer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hours = value ? hoursFor(value.date) : [];
  // Une heure à la demi-heure choisie dans l'ancien sélecteur reste visible et cochée.
  const shownHours = value && !hours.includes(value.time) ? [...hours, value.time].sort() : hours;

  return (
    <div className="rounded-[18px] border border-[var(--line)] bg-white p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-[16px] font-extrabold tracking-[-0.01em]">{monthTitle}</p>
        <button type="button" onClick={() => setOpen(false)} className="text-[15px] font-semibold text-[var(--ink-3)] underline decoration-[var(--line)] decoration-2 underline-offset-4 hover:text-[var(--ink)]">
          Fermer
        </button>
      </div>

      <div role="group" aria-label="Quel jour ?">
        <div className="grid grid-cols-7 gap-1 pb-1 text-center text-[13px] font-bold text-[var(--ink-3)]" aria-hidden="true">
          {WEEK_HEAD.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="grid gap-1">
          {weeks.map((week) => (
            <div key={week[0]} className="grid grid-cols-7 gap-1">
              {week.map((ymd) => {
                const d = toDate(ymd);
                const n = d.getUTCDate();
                const usable = ymd >= first && ymd <= last;
                const on = value?.date === ymd;
                const isToday = ymd === today;
                const label = `${isToday ? "Aujourd’hui, " : ""}${WEEK_NAMES[weekday(ymd)]} ${n === 1 ? "1er" : n} ${MONTHS[d.getUTCMonth()]}`;
                if (!usable) {
                  return (
                    <span key={ymd} aria-hidden="true" className="grid h-12 place-items-center text-[17px] font-semibold text-[var(--ink-3)] opacity-35">
                      {n}
                    </span>
                  );
                }
                return (
                  <button
                    key={ymd}
                    id={`${idPrefix}-${ymd}`}
                    type="button"
                    aria-pressed={on}
                    aria-label={label}
                    onClick={() => pickDay(ymd)}
                    className={`press relative grid h-12 place-items-center rounded-[12px] text-[18px] font-bold tabular-nums transition-colors ${
                      on ? "bg-[var(--ink)] text-white" : "bg-[var(--canvas)] hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    {n}
                    {isToday && <span aria-hidden="true" className={`absolute bottom-1.5 h-1 w-1 rounded-full ${on ? "bg-white" : "bg-[var(--amber)]"}`} />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {value && (
        <div role="group" aria-label="À quelle heure ?" className="mt-4 border-t border-[var(--line-soft)] pt-4">
          <p className="mb-2 flex items-center gap-2 px-1 text-[15px] font-bold">
            <Icon name="clock" size={17} className="text-[var(--ink-3)]" />À quelle heure ?
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {shownHours.map((h) => (
              <button
                key={h}
                type="button"
                aria-pressed={value.time === h}
                onClick={() => onChange({ ...value, time: h })}
                className={`press min-h-11 rounded-full text-[16px] font-bold tabular-nums transition-colors ${
                  value.time === h ? "bg-[var(--ink)] text-white" : "bg-[var(--canvas)] hover:bg-[var(--surface-2)]"
                }`}
              >
                {hourLabel(h)}
              </button>
            ))}
          </div>
          {described && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-[var(--canvas)] px-4 py-3">
              <p className="text-[16px] font-bold first-letter:uppercase">{described}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="press inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--ink)] px-5 text-[15px] font-bold text-white hover:bg-[var(--ink-soft)]"
              >
                <Icon name="check" size={17} /> C’est noté
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
