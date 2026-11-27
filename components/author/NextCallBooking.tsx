"use client";

import { useMemo, useRef, useState } from "react";
import { addDays, dayText, describeCallOnce, parisNow } from "@/lib/loomina/schedule";
import type { CallOnceValue } from "./CallOncePicker";

const DAY_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
/** Les heures proposées dans l'Aperçu : une par heure, de 9 h à 20 h (les demi-heures restent dans Réglages). */
const HOURS = Array.from({ length: 12 }, (_, i) => `${String(9 + i).padStart(2, "0")}:00`);

/**
 * Le prochain appel, réservé depuis le module « Votre prochain appel » de l'Aperçu
 * (demande de Solal, 25/11/2026) : on touche un jour, une heure, puis
 * « Enregistrer mon prochain appel ». Une fois réservé, le module affiche l'appel
 * avec « Changer » et « Annuler ».
 */
export default function NextCallBooking({
  value,
  onSaved,
  onUnauthorized,
}: {
  value: CallOnceValue;
  onSaved: () => void;
  onUnauthorized: () => void;
}) {
  const [booked, setBooked] = useState<CallOnceValue>(value);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<string | null>(value?.date ?? null);
  const [time, setTime] = useState<string | null>(value?.time ?? null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error" | "past">("idle");
  const seq = useRef(0);

  // Les 14 prochains jours, et les heures encore possibles aujourd'hui (un quart d'heure devant soi).
  const { days, hoursFor } = useMemo(() => {
    const p = parisNow();
    const hoursFor = (d: string) => (d === p.ymd ? HOURS.filter((h) => Number(h.slice(0, 2)) * 60 >= p.minutes + 15) : HOURS);
    const days = Array.from({ length: 14 }, (_, i) => {
      const ymd = addDays(p.ymd, i);
      const d = new Date(`${ymd}T12:00:00Z`);
      return { ymd, top: i === 0 ? "Auj." : i === 1 ? "Demain" : DAY_SHORT[(d.getUTCDay() + 6) % 7], num: d.getUTCDate() };
    }).filter((d) => hoursFor(d.ymd).length > 0);
    return { days, hoursFor };
  }, []);

  const save = async (next: CallOnceValue) => {
    const n = ++seq.current;
    setStatus("saving");
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callOnce: next }),
      });
      if (res.status === 401) return onUnauthorized();
      if (n !== seq.current) return;
      if (res.status === 400) return setStatus("past");
      if (!res.ok) throw new Error();
      setBooked(next);
      setOpen(false);
      setStatus("saved");
      onSaved();
    } catch {
      if (n === seq.current) setStatus("error");
    }
  };

  const pill = (on: boolean) =>
    `press rounded-[14px] text-center font-bold transition-colors ${
      on ? "bg-[var(--amber)] text-white" : "bg-white/[0.07] text-white hover:bg-white/[0.14]"
    }`;

  // Appel réservé : on l'affiche, avec « Changer » et « Annuler ».
  if (booked && !open) {
    return (
      <div className="mt-5 rounded-[16px] bg-white/[0.07] p-4">
        <p className="text-[14px] font-semibold text-[#cfcfc8]">Loomina vous appelle</p>
        <p className="mt-1 text-[19px] font-extrabold leading-snug tracking-[-0.01em] text-white first-letter:uppercase">{describeCallOnce(booked) ?? ""}</p>
        <p className="mt-1 text-[14px] text-[#cfcfc8]">{status === "saved" ? "C’est enregistré. " : ""}Un SMS vous prévient une demi-heure avant.</p>
        <div className="mt-3 flex gap-5 text-[15px] font-semibold">
          <button type="button" onClick={() => { setDate(booked.date); setTime(booked.time); setStatus("idle"); setOpen(true); }} className="text-white underline decoration-[var(--amber)] underline-offset-4 hover:text-[var(--amber)]">
            Changer
          </button>
          <button type="button" disabled={status === "saving"} onClick={() => void save(null)} className="text-[#cfcfc8] underline decoration-white/30 underline-offset-4 hover:text-white">
            Annuler l’appel
          </button>
        </div>
        {status === "error" && <p role="alert" className="mt-2 text-[14px] font-semibold text-[#f3b2a5]">Ça n’a pas marché. Réessayez.</p>}
      </div>
    );
  }

  // Rien de réservé : une seule ligne, qui ouvre le choix.
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => { setStatus("idle"); setOpen(true); }}
        className="press mt-5 flex w-full items-center justify-between gap-3 rounded-[16px] bg-white/[0.07] px-4 py-3.5 text-left hover:bg-white/[0.12]"
      >
        <span>
          <span className="block text-[16px] font-bold text-white">Choisir le jour de mon prochain appel</span>
          <span className="block text-[14px] text-[#cfcfc8]">Loomina vous appelle à l’heure dite.</span>
        </span>
        <span aria-hidden="true" className="text-[22px] text-[var(--amber)]">→</span>
      </button>
    );
  }

  const hours = date ? hoursFor(date) : [];
  const ready = Boolean(date && time && hours.includes(time));

  return (
    <div className="mt-5 rounded-[16px] bg-white/[0.07] p-4">
      <fieldset className="min-w-0">
        <legend className="text-[15px] font-bold text-white">Quel jour ?</legend>
        <div className="mt-2 flex snap-x gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {days.map((d) => (
            <button
              key={d.ymd}
              type="button"
              aria-pressed={date === d.ymd}
              aria-label={dayText(d.ymd)}
              onClick={() => {
                setDate(d.ymd);
                if (time && !hoursFor(d.ymd).includes(time)) setTime(null);
              }}
              className={`${pill(date === d.ymd)} flex min-h-[3.6rem] w-[3.6rem] shrink-0 snap-start flex-col items-center justify-center`}
            >
              <span className="text-[12.5px] font-semibold leading-none opacity-80">{d.top}</span>
              <span className="mt-1 text-[19px] leading-none">{d.num}</span>
            </button>
          ))}
        </div>
      </fieldset>
      {date && (
        <fieldset className="mt-4 min-w-0">
          <legend className="text-[15px] font-bold text-white">À quelle heure ?</legend>
          <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-6">
            {hours.map((h) => (
              <button key={h} type="button" aria-pressed={time === h} onClick={() => setTime(h)} className={`${pill(time === h)} min-h-11 text-[15px]`}>
                {Number(h.slice(0, 2))} h
              </button>
            ))}
          </div>
        </fieldset>
      )}
      {ready && date && time && (
        <p className="mt-4 text-[15px] font-semibold text-white first-letter:uppercase">{describeCallOnce({ date, time })}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <button
          type="button"
          disabled={!ready || status === "saving"}
          onClick={() => date && time && void save({ date, time })}
          className="press inline-flex min-h-12 w-full items-center justify-center whitespace-nowrap rounded-full bg-[var(--amber)] px-4 text-[15px] font-extrabold sm:w-auto sm:px-6 sm:text-[16px] text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "saving" ? "Enregistrement…" : "Enregistrer mon prochain appel"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-[15px] font-semibold text-[#cfcfc8] underline decoration-white/30 underline-offset-4 hover:text-white">
          Fermer
        </button>
      </div>
      {status === "past" && <p role="alert" className="mt-2 text-[14px] font-semibold text-[#f3b2a5]">Cette heure est déjà passée. Choisissez-en une autre.</p>}
      {status === "error" && <p role="alert" className="mt-2 text-[14px] font-semibold text-[#f3b2a5]">Ça n’a pas marché. Réessayez.</p>}
    </div>
  );
}
