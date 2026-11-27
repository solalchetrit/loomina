"use client";

/**
 * Le webmail de l'admin, sur le modèle de celui de L'Étincelle : une barre
 * (dossiers, recherche, actualiser, nouveau message), la liste à gauche, le
 * message ou la rédaction à droite. Repris de L'Étincelle et habillé aux
 * couleurs de Loomina.
 */

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Address, Folder, MailFull, MailList, MailRow } from "@/lib/admin/mailbox";
import { chercher, corbeille, envoyer, lireMail, marquer, plusDeMails } from "./actions";

const TZ = "Europe/Paris";
const heure = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
const jour = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: TZ });
const complet = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: TZ });

function quand(d: string) {
  const t = new Date(d);
  const auj = new Date();
  if (t.toDateString() === auj.toDateString()) return heure.format(t);
  if (t.toDateString() === new Date(auj.getTime() - 86400000).toDateString()) return "Hier";
  return jour.format(t);
}
const nom = (a?: Address) => (a?.name && a.name !== a.address ? a.name.replace(/^["']|["']$/g, "") : a?.address || "(inconnu)");
function initiales(a?: Address) {
  const parts = (a?.name || a?.address || "?").replace(/["']/g, "").split(/[\s.@_-]+/).filter(Boolean);
  return ((parts[0]?.[0] || "?") + (parts[1]?.[0] || "")).toUpperCase();
}
const TEINTES = ["#b5641a", "#2f6b4f", "#2c6a7a", "#3f5f9a", "#6a4c93", "#9a4560", "#7a6a2c", "#55606e"];
function teinte(email: string) {
  let h = 0;
  for (const c of email) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TEINTES[h % TEINTES.length];
}
const octets = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} Mo` : `${Math.max(1, Math.round(n / 1024))} Ko`);
const cx = (...c: Array<string | false | null | undefined | 0>) => c.filter(Boolean).join(" ");

// Petites icônes au trait (grille de 24).
const P: Record<string, string> = {
  pen: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  refresh: "M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  reply: "M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11",
  replyAll: "M7 14 2 9l5-5M12 14 7 9l5-5M7 9h9.5a5.5 5.5 0 0 1 0 11H13",
  forward: "M15 14l5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13",
  trash: "M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14",
  mail: "M4 4h16v16H4zM4 6l8 7 8-7",
  open: "M4 10l8-6 8 6v10H4zM4 10l8 5 8-5",
  star: "M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z",
  clip: "M21 11.5 12.5 20a5 5 0 0 1-7-7L14 4.5a3.5 3.5 0 0 1 5 5L10.5 18a2 2 0 0 1-3-3l7.5-7.5",
  back: "M15 18l-6-6 6-6",
  x: "M18 6 6 18M6 6l12 12",
  check: "M5 12l5 5 9-10",
  select: "M4 4h16v16H4zM8 12l3 3 5-6",
  inbox: "M3 13h5l2 3h4l2-3h5M5 5h14l2 8v6H3v-6z",
  send: "M22 2 11 13M22 2l-7 20-4-9-9-4z",
};
function I({ n, s = 16, className = "", fill = false }: { n: keyof typeof P; s?: number; className?: string; fill?: boolean }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={cx("shrink-0", className)} aria-hidden>
      <path d={P[n]} />
    </svg>
  );
}

const btnGhost = "press inline-flex items-center justify-center gap-1.5 rounded-[7px] text-[13.5px] font-semibold text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] disabled:opacity-40";
const btnOutline = "press inline-flex items-center justify-center gap-1.5 rounded-[7px] bg-[var(--surface)] px-3 text-[13.5px] font-semibold text-[var(--ink)] shadow-[0_0_0_1px_var(--line)] hover:shadow-[0_0_0_1px_var(--rule-strong)] disabled:opacity-40";
const btnPrimary = "press inline-flex items-center justify-center gap-1.5 rounded-[7px] bg-[var(--btn)] px-3.5 text-[13.5px] font-semibold text-[var(--on-btn)] disabled:opacity-40";
const input = "w-full rounded-[7px] border border-[var(--line)] bg-[var(--surface)] px-3 text-[14px] outline-none focus:border-[var(--ink)]";

type Compose = {
  mode: "nouveau" | "repondre" | "tous" | "transferer";
  to: string;
  cc: string;
  subject: string;
  text: string;
  quote?: string;
  inReplyTo?: string;
  references?: string[];
  uid?: number;
  files: Array<{ filename: string; contentType: string; base64: string; size: number }>;
};

function useToast() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 4000);
    return () => clearTimeout(t);
  }, [msg]);
  return { msg, ok: (text: string) => setMsg({ ok: true, text }), err: (text: string) => setMsg({ ok: false, text }) };
}

export function MailApp({ user, folders, folder, q, liste, ouvrir, ecrire }: {
  user: string;
  folders: Array<{ key: Folder; label: string }>;
  folder: Folder;
  q: string;
  liste: MailList;
  ouvrir: number | null;
  ecrire: { to: string; objet: string } | null;
}) {
  const router = useRouter();
  const path = usePathname();
  const toast = useToast();
  const [rows, setRows] = useState<MailRow[]>(liste.messages);
  const [offset, setOffset] = useState(liste.messages.length);
  const [filtre, setFiltre] = useState<"tous" | "nonlus" | "suivis">("tous");
  const [sel, setSel] = useState<number | null>(ouvrir);
  const [mail, setMail] = useState<MailFull | null>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [compose, setCompose] = useState<Compose | null>(ecrire ? { mode: "nouveau", to: ecrire.to, cc: "", subject: ecrire.objet, text: "", files: [] } : null);
  const [recherche, setRecherche] = useState(q);
  const [coches, setCoches] = useState<Set<number> | null>(null);
  const [pending, start] = useTransition();
  const [majA, setMajA] = useState(() => Date.now());
  const [rafraichit, setRafraichit] = useState(false);

  // La liste revient du serveur (actualisation) : on la fusionne avec ce qui est déjà chargé.
  const premier = useRef(true);
  useEffect(() => {
    if (premier.current) {
      premier.current = false;
      return;
    }
    setRows((rs) => [...liste.messages, ...rs.filter((m) => !liste.messages.some((x) => x.uid === m.uid) && new Date(m.date) < new Date(liste.messages.at(-1)?.date || 0))]);
    setMajA(Date.now());
    setRafraichit(false);
  }, [liste]);

  const nav = (p: { folder?: Folder; q?: string }) => {
    const sp = new URLSearchParams();
    sp.set("folder", p.folder ?? folder);
    if (p.q) sp.set("q", p.q);
    router.push(`${path}?${sp}`);
  };
  const actualiser = useCallback(() => {
    setRafraichit(true);
    router.refresh();
  }, [router]);
  useEffect(() => {
    const t = setInterval(() => document.visibilityState === "visible" && actualiser(), 180000);
    return () => clearInterval(t);
  }, [actualiser]);

  const visibles = rows.filter((m) => (filtre === "nonlus" ? !m.seen : filtre === "suivis" ? m.flagged : true));
  const rowsRef = useRef(rows);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  // Ouvrir un message : chargé à droite, marqué lu dans la liste.
  useEffect(() => {
    if (!sel) return;
    let vivant = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- l'ouverture d'un message déclenche son chargement
    setChargement(true);
    setErreur("");
    setMail(null);
    setRows((rs) => rs.map((m) => (m.uid === sel ? { ...m, seen: true } : m)));
    lireMail(folder, sel).then((r) => {
      if (!vivant) return;
      setChargement(false);
      if (!r.ok) return void setErreur(r.error);
      setMail(r.mail);
    });
    const sp = new URLSearchParams(window.location.search);
    sp.set("m", String(sel));
    window.history.replaceState(null, "", `${path}?${sp}`);
    return () => {
      vivant = false;
    };
  }, [sel, folder, path]);

  function charger() {
    start(async () => {
      const r = await plusDeMails(folder, offset);
      if (!r.ok) return void toast.err(r.error);
      setRows((rs) => [...rs, ...r.liste.messages.filter((m) => !rs.some((x) => x.uid === m.uid))]);
      setOffset((o) => o + r.liste.messages.length);
    });
  }
  function basculer(m: MailRow, flag: "seen" | "flagged") {
    const value = flag === "seen" ? !m.seen : !m.flagged;
    setRows((rs) => rs.map((x) => (x.uid === m.uid ? { ...x, [flag]: value } : x)));
    if (mail && mail.uid === m.uid && flag === "flagged") setMail({ ...mail, flagged: value });
    marquer(folder, [m.uid], flag, value).then((r) => !r.ok && toast.err(r.error));
  }
  function jeter(uid: number) {
    start(async () => {
      const r = await corbeille(folder, [uid]);
      if (!r.ok) return void toast.err(r.error);
      toast.ok("Message mis à la corbeille.");
      const i = rows.findIndex((m) => m.uid === uid);
      const suivant = rows[i + 1] || rows[i - 1];
      setRows((rs) => rs.filter((m) => m.uid !== uid));
      setSel(suivant ? suivant.uid : null);
      if (!suivant) setMail(null);
    });
  }
  const cocher = (uid: number) =>
    setCoches((c) => {
      const n = new Set(c || []);
      if (n.has(uid)) n.delete(uid);
      else n.add(uid);
      return n;
    });
  function grouper(action: "lu" | "nonlu" | "corbeille") {
    const uids = [...(coches || [])];
    if (!uids.length) return;
    start(async () => {
      if (action === "corbeille") {
        const r = await corbeille(folder, uids);
        if (!r.ok) return void toast.err(r.error);
        setRows((rs) => rs.filter((m) => !uids.includes(m.uid)));
        if (sel && uids.includes(sel)) {
          setSel(null);
          setMail(null);
        }
        toast.ok(`${uids.length} message(s) mis à la corbeille.`);
      } else {
        const r = await marquer(folder, uids, "seen", action === "lu");
        if (!r.ok) return void toast.err(r.error);
        setRows((rs) => rs.map((m) => (uids.includes(m.uid) ? { ...m, seen: action === "lu" } : m)));
      }
      setCoches(null);
    });
  }
  function rechercher(e: React.FormEvent) {
    e.preventDefault();
    const t = recherche.trim();
    if (t.length >= 2) {
      // Recherche directe, sans recharger la page.
      start(async () => {
        const r = await chercher(folder, t);
        if (!r.ok) return void toast.err(r.error);
        setRows(r.liste.messages);
        setOffset(Number.MAX_SAFE_INTEGER);
        setSel(null);
        setMail(null);
      });
    } else nav({ q: "" });
  }

  function repondre(mode: Compose["mode"]) {
    if (!mail) return;
    const moi = user.toLowerCase();
    const de = mail.replyTo.length ? mail.replyTo : mail.from;
    const dest = folder === "sent" ? mail.to : de;
    const autres = [...mail.to, ...mail.cc].filter((a) => a.address !== moi && !dest.some((d) => d.address === a.address));
    const txt = mail.text || mail.html.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\n{3,}/g, "\n\n");
    const entete = `Le ${complet.format(new Date(mail.date))}, ${nom(mail.from[0])} <${mail.from[0]?.address}> a écrit :`;
    const quote = `${entete}\n${txt.trim().split("\n").map((l) => `> ${l}`).join("\n")}`;
    const re = (s: string) => (/^(re|tr|fwd?)\s*:/i.test(s) ? s : `${mode === "transferer" ? "Tr" : "Re"} : ${s}`);
    setCompose({
      mode,
      to: mode === "transferer" ? "" : dest.map((a) => a.address).join(", "),
      cc: mode === "tous" ? autres.map((a) => a.address).join(", ") : "",
      subject: re(mail.subject),
      text: "",
      quote,
      inReplyTo: mode === "transferer" ? undefined : mail.messageId ?? undefined,
      references: mode === "transferer" ? undefined : mail.references,
      uid: mode === "transferer" ? undefined : mail.uid,
      files: [],
    });
  }

  // Raccourcis clavier, comme sur L'Étincelle.
  const [aide, setAide] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const i = visibles.findIndex((m) => m.uid === sel);
      if (e.key === "j" || e.key === "ArrowDown") {
        const n = visibles[Math.min(visibles.length - 1, i + 1)];
        if (n) { e.preventDefault(); setCompose(null); setSel(n.uid); }
      } else if (e.key === "k" || e.key === "ArrowUp") {
        const n = visibles[Math.max(0, i - 1)];
        if (n) { e.preventDefault(); setCompose(null); setSel(n.uid); }
      } else if (e.key === "r" && mail) { e.preventDefault(); repondre("repondre"); }
      else if (e.key === "a" && mail) { e.preventDefault(); repondre("tous"); }
      else if (e.key === "f" && mail) { e.preventDefault(); repondre("transferer"); }
      else if (e.key === "e" && sel && folder !== "trash") { e.preventDefault(); jeter(sel); }
      else if (e.key === "u" && sel) { const m = rows.find((x) => x.uid === sel); if (m) basculer(m, "seen"); }
      else if (e.key === "s" && sel) { const m = rows.find((x) => x.uid === sel); if (m) basculer(m, "flagged"); }
      else if (e.key === "c") { e.preventDefault(); setCompose({ mode: "nouveau", to: "", cc: "", subject: "", text: "", files: [] }); }
      else if (e.key === "/") { e.preventDefault(); document.getElementById("recherche-mail")?.focus(); }
      else if (e.key === "?") setAide((x) => !x);
      else if (e.key === "Escape") { if (compose) setCompose(null); else { setSel(null); setMail(null); } }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const total = q ? rows.length : liste.total;
  const destinataire = (m: MailRow) => (folder === "sent" ? m.to[0] : m.from);

  return (
    <div className="flex h-[calc(100dvh-7rem)] min-h-[480px] flex-col overflow-hidden rounded-[12px] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-bar)] lg:h-[calc(100dvh-7rem)]">
      {/* Barre : dossiers, recherche, actualiser, nouveau */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--line)] px-3 py-2.5">
        <span className="hidden pl-1 pr-2 text-[14px] font-semibold tracking-[-0.01em] sm:inline">{user}</span>
        <nav className="order-3 -mx-1 flex min-w-0 basis-full items-center gap-0.5 overflow-x-auto whitespace-nowrap px-1 sm:order-1 sm:basis-auto">
          {folders.map((d) => (
            <button
              key={d.key}
              onClick={() => nav({ folder: d.key })}
              aria-current={d.key === folder ? "page" : undefined}
              className={cx("press rounded-[7px] px-3 py-1.5 text-[13.5px] transition-colors", d.key === folder ? "bg-[var(--amber-soft)] font-semibold text-[var(--amber-deep)]" : "font-semibold text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]")}
            >
              {d.label}
              {d.key === "inbox" && folder === "inbox" && liste.unseen > 0 ? <span className="ml-1.5 rounded-full bg-[var(--amber)] px-1.5 text-[11px] font-semibold text-white">{liste.unseen}</span> : null}
            </button>
          ))}
        </nav>
        <form className="relative order-4 min-w-0 basis-full sm:order-2 sm:ml-auto sm:w-56 sm:basis-auto xl:w-72" onSubmit={rechercher}>
          <I n="search" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-3)]" />
          <input id="recherche-mail" className={cx(input, "h-9 pl-8 text-[13.5px]")} placeholder="Rechercher un mail…" title="Expéditeur, destinataire, objet" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
          {recherche && (
            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--ink-3)] hover:text-[var(--ink)]" onClick={() => { setRecherche(""); nav({ q: "" }); }} aria-label="Effacer la recherche">
              <I n="x" />
            </button>
          )}
        </form>
        <div className="order-2 ml-auto flex shrink-0 items-center gap-1 sm:order-3 sm:ml-0">
          <MiseAJour depuis={majA} />
          <button className={cx(btnGhost, "size-9")} onClick={actualiser} title="Actualiser" aria-label="Actualiser">
            <I n="refresh" className={cx((pending || rafraichit) && "animate-spin")} />
          </button>
          <button className={cx(btnPrimary, "h-9")} onClick={() => setCompose({ mode: "nouveau", to: "", cc: "", subject: "", text: "", files: [] })}>
            <I n="pen" />
            <span className="hidden sm:inline">Nouveau</span>
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(300px,390px)_1fr]">
        {/* Liste */}
        <div className={cx("flex min-h-0 flex-col border-r border-[var(--line)]", (sel !== null || compose !== null) && "hidden md:flex")}>
          {coches ? (
            <div className="flex items-center gap-1 border-b border-[var(--line)] bg-[var(--amber-soft)]/50 px-2 py-1.5 text-[13px]">
              <button className={cx(btnGhost, "h-7 px-2 text-[13px]")} onClick={() => setCoches(coches.size === visibles.length ? new Set() : new Set(visibles.map((m) => m.uid)))}>
                <I n="select" s={14} />
                {coches.size === visibles.length && visibles.length ? "Aucun" : "Tous"}
              </button>
              <span className="whitespace-nowrap px-1 tabular-nums text-[var(--ink-2)]">{coches.size} choisi(s)</span>
              <span className="ml-auto flex items-center gap-0.5">
                <button className={cx(btnGhost, "h-7 px-2 text-[13px]")} disabled={pending || !coches.size} onClick={() => grouper("lu")} title="Marquer lu"><I n="open" s={14} />Lu</button>
                <button className={cx(btnGhost, "h-7 px-2 text-[13px]")} disabled={pending || !coches.size} onClick={() => grouper("nonlu")} title="Marquer non lu"><I n="mail" s={14} />Non lu</button>
                {folder !== "trash" && <button className={cx(btnGhost, "h-7 px-2 text-[13px] hover:text-[var(--danger)]")} disabled={pending || !coches.size} onClick={() => grouper("corbeille")} title="Mettre à la corbeille"><I n="trash" s={14} /></button>}
                <button className={cx(btnGhost, "size-7")} onClick={() => setCoches(null)} aria-label="Annuler la sélection"><I n="x" s={14} /></button>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 border-b border-[var(--line)] px-3 py-2 text-[13px]">
              <button className={cx(btnGhost, "-ml-1 size-7")} onClick={() => setCoches(new Set())} title="Sélectionner plusieurs messages" aria-label="Sélectionner"><I n="select" /></button>
              {([["tous", "Tous"], ["nonlus", "Non lus"], ["suivis", "Suivis"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setFiltre(k)} className={cx("press whitespace-nowrap rounded-full px-2.5 py-1 font-semibold", filtre === k ? "bg-[var(--btn)] text-[var(--on-btn)]" : "text-[var(--ink-2)] hover:bg-[var(--surface-2)]")}>{l}</button>
              ))}
              <span className="ml-auto whitespace-nowrap tabular-nums text-[var(--ink-3)]">{total} message(s)</span>
              <button className={cx(btnGhost, "hidden size-7 md:inline-flex")} onClick={() => setAide((x) => !x)} title="Raccourcis clavier (?)" aria-label="Raccourcis clavier">?</button>
            </div>
          )}
          {aide && (
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 border-b border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-[12.5px] text-[var(--ink-2)]">
              {[["j / k", "suivant / précédent"], ["r", "répondre"], ["a", "répondre à tous"], ["f", "transférer"], ["e", "corbeille"], ["u", "lu / non lu"], ["s", "suivre"], ["c", "nouveau message"], ["/", "rechercher"], ["Échap", "fermer"]].map(([k, l]) => (
                <span key={k}><kbd className="rounded border border-[var(--line)] bg-[var(--surface)] px-1 font-mono text-[11px]">{k}</kbd> {l}</span>
              ))}
            </div>
          )}
          <ul className="min-h-0 flex-1 divide-y divide-[var(--line-soft)] overflow-y-auto">
            {visibles.map((m) => {
              const a = destinataire(m);
              const actif = m.uid === sel;
              const coche = coches?.has(m.uid);
              return (
                <li key={m.uid}>
                  <button
                    onClick={() => {
                      if (coches) return cocher(m.uid);
                      setSel(m.uid);
                      setCompose(null);
                    }}
                    className={cx("flex w-full gap-3 px-3 py-2.5 text-left transition-colors", coche || (actif && !coches) ? "bg-[var(--amber-soft)]/70" : "hover:bg-[var(--canvas)]")}
                  >
                    {coches ? (
                      <span className={cx("mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border-2", coche ? "border-[var(--ink)] bg-[var(--btn)] text-[var(--on-btn)]" : "border-[var(--line)] bg-[var(--surface)]")}>{coche && <I n="check" />}</span>
                    ) : (
                      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full text-[12px] font-semibold text-white" style={{ background: teinte(a?.address || "?") }}>{initiales(a)}</span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span className={cx("min-w-0 flex-1 truncate text-[13.5px]", !m.seen ? "font-semibold text-[var(--ink)]" : "text-[var(--ink-2)]")}>
                          {folder === "sent" && <span className="font-normal text-[var(--ink-3)]">À : </span>}
                          {nom(a)}
                        </span>
                        <span className={cx("shrink-0 text-[12.5px] tabular-nums", !m.seen ? "font-semibold text-[var(--amber-ink)]" : "text-[var(--ink-3)]")}>{quand(m.date)}</span>
                      </span>
                      <span className={cx("mt-0.5 flex items-center gap-1.5 text-[13.5px]", !m.seen ? "font-semibold text-[var(--ink)]" : "text-[var(--ink-2)]")}>
                        <span className="min-w-0 flex-1 truncate">{m.subject}</span>
                        {m.answered && <I n="reply" s={13} className="text-[var(--ink-3)]" />}
                        {m.attach && <I n="clip" s={13} className="text-[var(--ink-3)]" />}
                        {m.flagged && <I n="star" s={13} fill className="text-[var(--amber)]" />}
                      </span>
                    </span>
                    {!m.seen && <span className="mt-2 size-2 shrink-0 rounded-full bg-[var(--amber)]" />}
                  </button>
                </li>
              );
            })}
            {!visibles.length && <li className="px-4 py-12 text-center text-[13.5px] text-[var(--ink-3)]">{rows.length ? "Aucun message pour ce filtre." : q ? "Aucun message ne correspond à la recherche." : "Ce dossier est vide."}</li>}
            {!q && offset < liste.total && filtre === "tous" && (
              <li className="p-3">
                <button className={cx(btnOutline, "h-9 w-full")} onClick={charger} disabled={pending}>Messages plus anciens</button>
              </li>
            )}
          </ul>
        </div>

        {/* Lecture ou rédaction */}
        <div className={cx("min-h-0 overflow-y-auto", !sel && !compose && "hidden md:block")}>
          {compose ? (
            <Composer
              user={user}
              folder={folder}
              compose={compose}
              setCompose={setCompose}
              onSent={(text) => {
                toast.ok(text);
                const uid = compose.uid;
                setCompose(null);
                if (uid) setRows((rs) => rs.map((m) => (m.uid === uid ? { ...m, answered: true } : m)));
              }}
              onError={toast.err}
            />
          ) : chargement ? (
            <div className="space-y-4 p-6">
              <div className="h-6 w-2/3 animate-pulse rounded bg-[var(--surface-2)]" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-[var(--surface-2)]" />
              <div className="h-64 animate-pulse rounded-[8px] bg-[var(--surface-2)]" />
            </div>
          ) : erreur ? (
            <div className="p-8 text-center text-[13.5px] font-semibold text-[var(--danger)]">{erreur}</div>
          ) : mail ? (
            <article className="min-w-0 p-5 lg:p-6">
              <div className="mb-4 flex flex-wrap items-center gap-1">
                <button className={cx(btnGhost, "h-8 px-2 md:hidden")} onClick={() => { setSel(null); setMail(null); }}><I n="back" /> Retour</button>
                <button className={cx(btnOutline, "h-8")} onClick={() => repondre("repondre")}><I n="reply" /> Répondre</button>
                {[...mail.to, ...mail.cc].length > 1 && <button className={cx(btnGhost, "h-8 px-2")} onClick={() => repondre("tous")}><I n="replyAll" /> À tous</button>}
                <button className={cx(btnGhost, "h-8 px-2")} onClick={() => repondre("transferer")}><I n="forward" /> Transférer</button>
                <span className="ml-auto flex items-center gap-0.5">
                  {(() => {
                    const ligne = rows.find((r) => r.uid === mail.uid);
                    return ligne ? (
                      <>
                        <button className={cx(btnGhost, "size-8")} title={ligne.seen ? "Marquer non lu" : "Marquer lu"} onClick={() => basculer(ligne, "seen")}><I n={ligne.seen ? "mail" : "open"} /></button>
                        <button className={cx(btnGhost, "size-8")} title="Suivre" onClick={() => basculer(ligne, "flagged")}><I n="star" fill={ligne.flagged} className={ligne.flagged ? "text-[var(--amber)]" : ""} /></button>
                      </>
                    ) : null;
                  })()}
                  {folder !== "trash" && <button className={cx(btnGhost, "size-8 hover:text-[var(--danger)]")} title="Mettre à la corbeille" disabled={pending} onClick={() => jeter(mail.uid)}><I n="trash" /></button>}
                </span>
              </div>
              <h2 className="text-balance text-[22px] font-semibold leading-snug tracking-[-0.02em] [overflow-wrap:anywhere]">{mail.subject}</h2>
              <div className="mt-3 flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full text-[13px] font-semibold text-white" style={{ background: teinte(mail.from[0]?.address || "?") }}>{initiales(mail.from[0])}</span>
                <div className="min-w-0 flex-1 text-[13.5px]">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold">{nom(mail.from[0])}</span>
                    <span className="truncate text-[var(--ink-3)]">{mail.from[0]?.address}</span>
                  </div>
                  <Destinataires to={mail.to} cc={mail.cc} />
                  <time className="mt-0.5 block text-[12.5px] text-[var(--ink-3)]" dateTime={mail.date}>{complet.format(new Date(mail.date))}</time>
                </div>
              </div>
              <div className="mt-5">{mail.html ? <Corps html={mail.html} /> : <pre className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed text-[var(--ink)]">{mail.text}</pre>}</div>
              {mail.attachments.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {mail.attachments.map((a) => (
                    <a key={a.i} href={`/api/admin/mails/piece?${new URLSearchParams({ folder, uid: String(mail.uid), i: String(a.i) })}`} target="_blank" rel="noreferrer" className="flex max-w-72 items-center gap-2 rounded-[7px] border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-[13.5px] hover:bg-[var(--surface-2)]">
                      <I n="clip" className="text-[var(--ink-3)]" />
                      <span className="min-w-0 flex-1 truncate">{a.filename}</span>
                      <span className="shrink-0 text-[12px] text-[var(--ink-3)]">{octets(a.size)}</span>
                    </a>
                  ))}
                </div>
              )}
            </article>
          ) : (
            <div className="grid h-full place-items-center p-8 text-center">
              <div>
                <div className="mx-auto mb-3 grid size-12 place-items-center rounded-[10px] bg-[var(--amber-soft)] text-[var(--amber-ink)]"><I n="inbox" s={20} /></div>
                <p className="font-semibold">{user}</p>
                <p className="mt-1 text-[13.5px] text-[var(--ink-3)]">Sélectionnez un message pour le lire.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast.msg && (
        <div role="status" className={cx("fixed bottom-5 left-1/2 z-[1100] -translate-x-1/2 rounded-[8px] px-4 py-2.5 text-[13.5px] font-semibold shadow-[var(--shadow-float)]", toast.msg.ok ? "bg-[var(--btn)] text-[var(--on-btn)]" : "bg-[var(--danger)] text-[var(--on-btn)]")}>{toast.msg.text}</div>
      )}
    </div>
  );
}

/** « Mis à jour à l'instant / il y a 9 min », recalculé toutes les 30 s. */
function MiseAJour({ depuis }: { depuis: number }) {
  const [now, setNow] = useState(depuis);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  const min = Math.max(0, Math.floor((now - depuis) / 60000));
  return (
    <span className="hidden items-center gap-1.5 whitespace-nowrap text-[12.5px] text-[var(--ink-3)] lg:flex" title={`Mis à jour le ${complet.format(depuis)}`}>
      <span className={cx("size-1.5 rounded-full", min < 10 ? "bg-[var(--success)]" : "bg-[var(--amber)]")} />
      {min < 1 ? "à l’instant" : `il y a ${min} min`}
    </span>
  );
}

function Destinataires({ to, cc }: { to: Address[]; cc: Address[] }) {
  const [tout, setTout] = useState(false);
  const liste = [...to.map((a) => ({ a, cc: false })), ...cc.map((a) => ({ a, cc: true }))];
  const montres = tout ? liste : liste.slice(0, 3);
  return (
    <div className="text-[12.5px] text-[var(--ink-3)]">
      À{" "}
      {montres.map(({ a, cc: c }, i) => (
        <span key={a.address + i} title={a.address}>
          {i ? ", " : ""}
          {c ? "Cc " : ""}
          {nom(a)}
        </span>
      ))}
      {liste.length > 3 && (
        <button className="ml-1 font-semibold text-[var(--amber-ink)] hover:underline" onClick={() => setTout(!tout)}>
          {tout ? "réduire" : `et ${liste.length - 3} autre(s)`}
        </button>
      )}
    </div>
  );
}

/** Le corps HTML dans un cadre isolé (aucun script) ; images distantes masquées tant qu'on ne les demande pas. */
function Corps({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [images, setImages] = useState(false);
  const [h, setH] = useState(240);
  const distantes = /<img[^>]+src=["']?https?:/i.test(html) || /url\(\s*["']?https?:/i.test(html);
  const doc = useMemo(
    () => `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: ${images ? "https: http:" : ""}; style-src 'unsafe-inline' ${images ? "https:" : ""}; font-src data: ${images ? "https:" : ""};">
<base target="_blank">
<style>html,body{margin:0;background:#fff}body{padding:20px 22px;font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;color:#161616;overflow-wrap:anywhere}
img{max-width:100%;height:auto}table{max-width:100%!important}pre{white-space:pre-wrap}blockquote{margin:0 0 0 .8ex;border-left:2px solid #d4d3cc;padding-left:1ex;color:#4a4a45}a{color:#95580a}</style>
</head><body>${html}</body></html>`,
    [html, images]
  );
  useEffect(() => {
    const f = ref.current;
    if (!f) return;
    let ro: ResizeObserver | null = null;
    const ajuster = () => {
      const d = f.contentDocument;
      if (!d?.documentElement) return;
      setH(Math.min(Math.max(d.documentElement.scrollHeight, 120), 20000));
      if (!ro && d.body) {
        ro = new ResizeObserver(() => setH(Math.min(Math.max(d.documentElement.scrollHeight, 120), 20000)));
        ro.observe(d.body);
      }
    };
    f.addEventListener("load", ajuster);
    return () => {
      f.removeEventListener("load", ajuster);
      ro?.disconnect();
    };
  }, [doc]);
  return (
    <div>
      {distantes && !images && (
        <div className="mb-2 flex flex-wrap items-center gap-2 rounded-[7px] border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-[13px] text-[var(--ink-2)]">
          Images distantes masquées (elles peuvent signaler l’ouverture à l’expéditeur).
          <button className="ml-auto font-semibold text-[var(--amber-ink)] hover:underline" onClick={() => setImages(true)}>Afficher les images</button>
        </div>
      )}
      <div className="overflow-hidden rounded-[8px] border border-[var(--line)] bg-[var(--surface)]">
        {/* Même origine pour mesurer la hauteur, mais aucun script autorisé : allow-scripts n'est pas donné. */}
        <iframe ref={ref} title="Contenu du message" srcDoc={doc} sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox" className="block w-full" style={{ height: h }} />
      </div>
    </div>
  );
}

function Composer({ user, folder, compose, setCompose, onSent, onError }: {
  user: string;
  folder: Folder;
  compose: Compose;
  setCompose: (c: Compose | null) => void;
  onSent: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [pending, start] = useTransition();
  const [cc, setCc] = useState(Boolean(compose.cc));
  const set = (p: Partial<Compose>) => setCompose({ ...compose, ...p });
  const titre = { nouveau: "Nouveau message", repondre: "Répondre", tous: "Répondre à tous", transferer: "Transférer" }[compose.mode];

  async function joindre(list: FileList | null) {
    if (!list) return;
    const ajout: Compose["files"] = [];
    for (const f of Array.from(list).slice(0, 10)) {
      if (f.size > 10 * 1024 * 1024) {
        onError(`${f.name} dépasse 10 Mo.`);
        continue;
      }
      const base64 = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
        r.readAsDataURL(f);
      });
      ajout.push({ filename: f.name, contentType: f.type || "application/octet-stream", base64, size: f.size });
    }
    set({ files: [...compose.files, ...ajout].slice(0, 10) });
  }

  function envoi() {
    start(async () => {
      const text = compose.quote ? `${compose.text.trimEnd()}\n\n${compose.quote}` : compose.text;
      const r = await envoyer({
        to: compose.to,
        cc: compose.cc,
        subject: compose.subject,
        text,
        inReplyTo: compose.inReplyTo,
        references: compose.references,
        answered: compose.uid ? { folder, uid: compose.uid } : undefined,
        files: compose.files.map(({ filename, contentType, base64 }) => ({ filename, contentType, base64 })),
      });
      if (!r.ok) return onError(r.error);
      onSent(`Message envoyé à ${compose.to}.`);
    });
  }

  return (
    <div className="flex h-full flex-col p-5 lg:p-6">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-[20px] font-semibold tracking-[-0.02em]">{titre}</h2>
        <span className="text-[13px] text-[var(--ink-3)]">depuis {user}</span>
        <button className={cx(btnGhost, "ml-auto size-8")} onClick={() => setCompose(null)} aria-label="Fermer"><I n="x" /></button>
      </div>
      <div className="grid gap-2">
        <label className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-[13px] font-semibold text-[var(--ink-3)]">À</span>
          <input className={cx(input, "h-9")} value={compose.to} onChange={(e) => set({ to: e.target.value })} placeholder="adresse@exemple.fr" autoFocus={!compose.to} />
          {!cc && <button className={cx(btnGhost, "h-9 px-2 text-[13px]")} onClick={() => setCc(true)}>Cc</button>}
        </label>
        {cc && (
          <label className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-[13px] font-semibold text-[var(--ink-3)]">Cc</span>
            <input className={cx(input, "h-9")} value={compose.cc} onChange={(e) => set({ cc: e.target.value })} />
          </label>
        )}
        <label className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-[13px] font-semibold text-[var(--ink-3)]">Objet</span>
          <input className={cx(input, "h-9")} value={compose.subject} onChange={(e) => set({ subject: e.target.value })} />
        </label>
      </div>
      <textarea
        className={cx(input, "mt-3 min-h-56 flex-1 resize-y py-3 leading-relaxed")}
        value={compose.text}
        onChange={(e) => set({ text: e.target.value })}
        autoFocus={Boolean(compose.to)}
        placeholder="Votre message…"
      />
      {compose.quote && (
        <details className="mt-2 text-[13px] text-[var(--ink-3)]">
          <summary className="cursor-pointer">Message d’origine (ajouté sous votre réponse)</summary>
          <pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-[7px] bg-[var(--canvas)] p-3 font-sans">{compose.quote}</pre>
        </details>
      )}
      {compose.files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {compose.files.map((f, i) => (
            <span key={f.filename + i} className="flex items-center gap-2 rounded-[7px] border border-[var(--line)] bg-[var(--canvas)] px-2.5 py-1.5 text-[13px]">
              <I n="clip" s={14} />
              <span className="max-w-48 truncate">{f.filename}</span>
              <span className="text-[var(--ink-3)]">{octets(f.size)}</span>
              <button onClick={() => set({ files: compose.files.filter((_, j) => j !== i) })} aria-label={`Retirer ${f.filename}`} className="text-[var(--ink-3)] hover:text-[var(--ink)]"><I n="x" s={14} /></button>
            </span>
          ))}
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button className={cx(btnPrimary, "h-9 px-4")} onClick={envoi} disabled={pending}>
          <I n="send" />
          {pending ? "Envoi…" : "Envoyer"}
        </button>
        <label className={cx(btnOutline, "h-9 cursor-pointer")}>
          <I n="clip" />
          Joindre
          <input type="file" multiple className="sr-only" onChange={(e) => { void joindre(e.target.files); e.target.value = ""; }} />
        </label>
        <button className={cx(btnGhost, "h-9 px-3")} onClick={() => setCompose(null)}>Annuler</button>
      </div>
    </div>
  );
}
