"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { CONSENT_EVENT, GA_ID, clearGaCookies, readConsent, saveConsent, track, type Consent } from "@/lib/analytics";

/**
 * Google Analytics chargé seulement après « Accepter », bandeau de choix,
 * et suivi des clics sur le numéro de la démo partout sur le site.
 */
export default function Analytics() {
  // undefined : pas encore lu (premier rendu serveur) ; null : pas encore choisi.
  const [consent, setConsent] = useState<Consent | null | undefined>(undefined);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage n'existe que dans le navigateur
    setConsent(readConsent());
    const onChange = (e: Event) => {
      const value = (e as CustomEvent<Consent | null>).detail;
      if (value === "non" && window.gtag) {
        clearGaCookies();
        window.location.reload(); // décharge Google Analytics
        return;
      }
      setConsent(value);
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  // Un clic sur le numéro de la démo (« Essayer la démo », en-tête, pied de page…).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href^="tel:"]');
      if (!link) return;
      track("clic_demo", { emplacement: window.location.pathname, texte: link.textContent?.trim().slice(0, 60) });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return (
    <>
      {consent === "oui" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="gtag" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
              window.dispatchEvent(new Event('loomina:ga-pret'));`}
          </Script>
        </>
      )}
      {consent === null && <CookieBanner />}
    </>
  );
}

function CookieBanner() {
  return (
    <div
      role="dialog"
      aria-label="Cookies"
      className="fixed inset-x-0 bottom-0 z-[1000] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-4 rounded-[22px] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-bar)] sm:flex-row sm:items-center">
        <p className="flex-1 text-[15px] leading-snug text-[var(--ink-2)]">
          Nous utilisons des cookies pour améliorer votre expérience et mesurer l’audience du site. Vous pouvez les accepter ou les refuser.{" "}
          <Link href="/legal#cookies" className="link">
            En savoir plus
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => saveConsent("non")}
            className="press h-11 flex-1 rounded-[14px] border border-[var(--rule-strong)] bg-white px-5 text-[15px] font-bold text-[var(--ink)] sm:flex-none"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => saveConsent("oui")}
            className="press h-11 flex-1 rounded-[14px] border border-[var(--ink)] bg-[var(--ink)] px-5 text-[15px] font-bold text-white sm:flex-none"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
