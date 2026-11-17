/**
 * Mesure d'audience (Google Analytics 4).
 *
 * Rien n'est chargé ni envoyé tant que le visiteur n'a pas accepté (règle CNIL).
 * Le choix est gardé dans le navigateur ; le lien « Cookies » du pied de page permet d'en changer.
 */
export const GA_ID = "G-3F6NDBKRJ8";
const CONSENT_KEY = "loomina_cookies";
export const CONSENT_EVENT = "loomina:cookies";

export type Consent = "oui" | "non";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "oui" || v === "non" ? v : null;
  } catch {
    return null;
  }
}

export function saveConsent(value: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* stockage indisponible : le bandeau reviendra à la prochaine visite */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

/** Rouvre le bandeau (lien « Cookies » du pied de page). */
export function reopenConsent() {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
}

/** Événements suivis. Sans accord, rien ne part (gtag n'existe pas). */
export function track(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", name, params);
}

/** Supprime les cookies Google Analytics quand le visiteur refuse après avoir accepté. */
export function clearGaCookies() {
  const host = window.location.hostname.replace(/^www\./, "");
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0].trim();
    if (!name.startsWith("_ga")) continue;
    for (const domain of ["", `; domain=.${host}`, `; domain=${window.location.hostname}`]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`;
    }
  }
}

/** Comme track, mais attend que Google Analytics ait fini de se charger (arrivée sur une page). */
export function trackWhenReady(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || readConsent() !== "oui") return;
  if (window.gtag) return track(name, params);
  window.addEventListener("loomina:ga-pret", () => track(name, params), { once: true });
}
