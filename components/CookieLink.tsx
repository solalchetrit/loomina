"use client";

import { reopenConsent } from "@/lib/analytics";

/** Lien du pied de page pour revoir son choix sur les cookies. */
export default function CookieLink({ className }: { className?: string }) {
  return (
    <button type="button" onClick={reopenConsent} className={className}>
      Cookies
    </button>
  );
}
