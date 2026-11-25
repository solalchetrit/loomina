"use client";

import { useMemo } from "react";
import { callOnceDays, parisNow } from "@/lib/loomina/schedule";
import { CALL_HOURS } from "./Settings";

export type CallOnceValue = { date: string; time: string } | null;

const hourLabel = (h: string) => `${Number(h.slice(0, 2))} h${h.endsWith("30") ? " 30" : ""}`;

/**
 * Un seul appel, à une date précise (demande de Solal, 25/11/2026) : « ce lundi
 * à 10 h, Loomina m'appelle ». Surtout pour le premier appel. Un jour parmi les
 * deux semaines à venir et une heure, comme pour les rendez-vous de la semaine.
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
  // Les heures encore possibles aujourd'hui : au moins un quart d'heure devant soi.
  const { days, hoursFor } = useMemo(() => {
    const now = new Date();
    const p = parisNow(now);
    const soon = p.minutes + 15;
    const hoursFor = (date: string) =>
      date === p.ymd ? CALL_HOURS.filter((h) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3)) >= soon) : CALL_HOURS;
    const days = callOnceDays(now).filter((d) => hoursFor(d.date).length > 0);
    return { days, hoursFor };
  }, []);

  const pickDay = (date: string) => {
    if (!date) return onChange(null);
    const hours = hoursFor(date);
    const keep = value?.time && hours.includes(value.time) ? value.time : hours.includes("10:00") ? "10:00" : hours[0];
    onChange({ date, time: keep });
  };

  const hours = value ? hoursFor(value.date) : [];

  return (
    <div>
      <label htmlFor={`${idPrefix}-jour`} className="sr-only">
        Le jour
      </label>
      <select id={`${idPrefix}-jour`} className="field w-full" value={value?.date ?? ""} onChange={(e) => pickDay(e.target.value)}>
        <option value="">Pas d’appel prévu</option>
        {days.map((d) => (
          <option key={d.date} value={d.date}>
            {d.label}
          </option>
        ))}
      </select>
      {value && (
        <div className="mt-3 flex items-center gap-3">
          <label htmlFor={`${idPrefix}-heure`} className="field-label !mb-0">
            À quelle heure
          </label>
          <select id={`${idPrefix}-heure`} className="field max-w-[8.5rem]" value={value.time} onChange={(e) => onChange({ ...value, time: e.target.value })}>
            {hours.map((h) => (
              <option key={h} value={h}>
                {hourLabel(h)}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
