"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SITE } from "@/config/site";
import Button from "@/components/ui/Button";

/**
 * La carte à offrir : celui qui offre l'imprime et la glisse sous le sapin
 * (ou dans une enveloppe). Le module de Noël promet « le soir de Noël, vous
 * lui annoncez » : il fallait quelque chose à tendre (audit du 26/11/2026,
 * Solal : « la carte cadeau à mettre sous le sapin »).
 *
 * Une feuille A4, la carte sur la moitié du haut : on plie la feuille en
 * deux, la carte est devant et l'intérieur reste libre pour écrire à la main.
 * Les champs viennent de l'espace famille ou de la page de bienvenue
 * (?pour=Jeanne&de=Claire&tu=1) et restent modifiables ici.
 */

type Style = "noel" | "annee";

const clean = (v: string | null, max: number) => (v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

function Carte() {
  const params = useSearchParams();
  const [pour, setPour] = useState(() => clean(params.get("pour"), 40));
  const [de, setDe] = useState(() => clean(params.get("de"), 60));
  const [tu, setTu] = useState(() => params.get("tu") !== "0");
  const [mot, setMot] = useState("");
  // Noël jusqu'au 25 décembre, puis la carte de toute l'année.
  const [style, setStyle] = useState<Style>(() => {
    const s = params.get("style");
    if (s === "noel" || s === "annee") return s;
    const d = new Date();
    return d.getMonth() === 10 || (d.getMonth() === 11 && d.getDate() <= 25) ? "noel" : "annee";
  });

  useEffect(() => {
    document.documentElement.dataset.print = "carte";
    return () => {
      delete document.documentElement.dataset.print;
    };
  }, []);

  const noel = style === "noel";
  const accent = noel ? "var(--noel)" : "var(--amber-display)";
  const field =
    "mt-1.5 w-full rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-[16px] outline-none transition focus:border-[var(--ink)]";

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 md:py-12">
      <div className="carte-ecran mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" aria-label="Loomina, accueil">
          <Image src="/header-logo-trimmed.png" alt="Loomina" width={134} height={38} priority />
        </Link>
        <Link href="/dashboard" className="link text-[15px]">
          Retour à l’espace famille
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[340px_1fr] lg:items-start">
        <form className="carte-ecran card order-2 p-6 lg:order-none" onSubmit={(e) => e.preventDefault()}>
          <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.02em]">La carte à offrir</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-2)]">
            Imprimez-la sur une feuille A4 et pliez la feuille en deux : la carte est devant, l’intérieur reste libre pour un mot à la main.
          </p>

          <label className="mt-6 block text-[15px] font-bold">
            Pour
            <input className={field} value={pour} maxLength={40} onChange={(e) => setPour(e.target.value)} placeholder="Jeanne, Mamie…" />
          </label>
          <label className="mt-4 block text-[15px] font-bold">
            De la part de
            <input className={field} value={de} maxLength={60} onChange={(e) => setDe(e.target.value)} placeholder="Claire, Léo et Lina" />
          </label>
          <label className="mt-4 block text-[15px] font-bold">
            Un petit mot <span className="font-normal text-[var(--ink-3)]">(facultatif)</span>
            <textarea className={`${field} min-h-[84px] resize-none`} value={mot} maxLength={140} onChange={(e) => setMot(e.target.value)} placeholder="J’ai hâte de lire tes souvenirs." />
          </label>

          <fieldset className="mt-5">
            <legend className="text-[15px] font-bold">La carte dit</legend>
            <div className="mt-2 flex gap-2">
              {[
                { v: true, l: "Tu" },
                { v: false, l: "Vous" },
              ].map((o) => (
                <button
                  key={o.l}
                  type="button"
                  onClick={() => setTu(o.v)}
                  aria-pressed={tu === o.v}
                  className={`rounded-full border px-4 py-2 text-[15px] font-semibold transition ${tu === o.v ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--line)] bg-white"}`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="text-[15px] font-bold">Le style</legend>
            <div className="mt-2 flex gap-2">
              {[
                { v: "noel" as Style, l: "Noël" },
                { v: "annee" as Style, l: "Toute l’année" },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => setStyle(o.v)}
                  aria-pressed={style === o.v}
                  className={`rounded-full border px-4 py-2 text-[15px] font-semibold transition ${style === o.v ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--line)] bg-white"}`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </fieldset>

          <Button onClick={() => window.print()} size="lg" className="mt-7 w-full">
            Imprimer la carte
          </Button>
        </form>

        {/* La feuille : à l'écran, seulement la carte ; à l'impression, la moitié haute d'une A4. */}
        <div className="carte-feuille order-1 lg:order-none">
          <article
            className="carte relative mx-auto flex w-full sm:aspect-[210/148.5] max-w-[760px] flex-col overflow-hidden bg-white shadow-[var(--shadow-float)]"
            aria-label="Aperçu de la carte"
          >
            <div className="carte-cadre absolute inset-[3.5%] rounded-[6px] border" style={{ borderColor: accent }} aria-hidden />
            {noel && <Sapins />}
            <div className="relative flex h-full flex-col items-center justify-center px-[12%] py-12 text-center sm:py-0">
              <p className="carte-pour text-[clamp(13px,2.2vw,18px)] font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>
                {noel ? "Joyeux Noël" : tu ? "Pour toi" : "Pour vous"}
                {pour ? `, ${pour}` : ""}
              </p>
              <h2 className="carte-titre mt-[3%] font-serif text-[clamp(30px,6.4vw,58px)] italic leading-[1.02] tracking-[-0.01em] text-[var(--title)]">
                Le livre de {tu ? "ta" : "votre"} vie
              </h2>
              <p className="carte-texte mt-[3.5%] max-w-[34em] text-[clamp(12px,1.9vw,16px)] leading-[1.5] text-[var(--ink-2)]">
                {tu
                  ? "Tu racontes tes souvenirs au téléphone, à ton rythme. Loomina les écrit, et ils deviennent un vrai livre imprimé."
                  : "Vous racontez vos souvenirs au téléphone, à votre rythme. Loomina les écrit, et ils deviennent un vrai livre imprimé."}
              </p>
              <p className="carte-appel mt-[3.5%] text-[clamp(12px,1.9vw,16px)] font-semibold text-[var(--ink)]">
                {tu ? "Pour commencer, appelle le" : "Pour commencer, appelez le"}
                <span className="carte-numero mt-1 block text-[clamp(22px,4.4vw,38px)] font-extrabold tabular-nums tracking-[-0.01em]">{SITE.phoneDisplay}</span>
                <span className="block text-[clamp(11px,1.6vw,14px)] font-normal text-[var(--ink-3)]">
                  {tu ? "depuis ton téléphone, quand tu veux." : "depuis votre téléphone, quand vous voulez."}
                </span>
              </p>
              {mot.trim() && <p className="carte-mot mt-[3%] max-w-[30em] font-serif text-[clamp(13px,2vw,18px)] italic text-[var(--ink-2)]">« {mot.trim()} »</p>}
              {de.trim() && <p className="carte-de mt-[2.5%] text-[clamp(12px,1.8vw,15px)] text-[var(--ink-2)]">De la part de {de.trim()}</p>}
            </div>
            <Image src="/header-logo-trimmed.png" alt="Loomina" width={268} height={76} className="carte-logo absolute bottom-[5%] right-[7%] h-auto w-[18%] sm:bottom-[7%] sm:w-[13%]" />
          </article>
          <p className="carte-ecran mt-4 text-center text-[14px] text-[var(--ink-3)]">À l’impression : choisissez A4, « Taille réelle » ou 100 %, sans en-têtes ni pieds de page.</p>
          <div className="carte-pli" aria-hidden />
        </div>
      </div>
    </div>
  );
}

/** Deux petits sapins dans les coins, en trait rouge : discrets, et légers à l'impression. */
function Sapins() {
  const sapin = (
    <svg viewBox="0 0 40 52" className="h-full w-full" fill="none" stroke="var(--noel)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <path d="M20 3 L30 17 H25 L34 30 H28 L37 43 H3 L12 30 H6 L15 17 H10 Z" />
      <path d="M20 43 V50" />
      <circle cx="20" cy="3" r="0.6" fill="var(--noel)" />
    </svg>
  );
  return (
    <>
      <span className="absolute left-[7%] top-[9%] block w-[6%]" aria-hidden>
        {sapin}
      </span>
      <span className="absolute bottom-[9%] left-[7%] block w-[4.2%] opacity-80" aria-hidden>
        {sapin}
      </span>
    </>
  );
}

export default function CarteCadeauPage() {
  return (
    <Suspense>
      <Carte />
    </Suspense>
  );
}
