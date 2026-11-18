import { NextResponse } from "next/server";
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE_S } from "@/lib/loomina/session";
import { maskPhone } from "@/lib/loomina/db";

/**
 * Ouverture directe de l'espace auteur, sans code SMS.
 *
 * Seulement sur un poste local (sinon 404) : `next dev` avec
 * LOOMINA_DEV_LOGIN=true, session du numéro LOOMINA_DEV_PHONE (.env.local).
 *
 * L'ouverture en ligne pour la phase de test (LOOMINA_OPEN_AUTHOR_PROFILE_ID)
 * est retirée le 18/11/2026 à la demande de Solal : en ligne, l'espace auteur
 * demande toujours le numéro puis un code SMS, même si la variable traîne
 * encore sur Vercel.
 *
 * Aucun numéro ni identifiant ne vient du navigateur.
 */
async function openPhone(): Promise<string | null> {
  if (process.env.NODE_ENV === "development" && process.env.LOOMINA_DEV_LOGIN === "true") {
    return process.env.LOOMINA_DEV_PHONE ?? null;
  }
  return null;
}

export async function POST() {
  const phone = await openPhone();
  if (!phone) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Le numéro reste côté serveur : le navigateur n'en reçoit qu'une version masquée.
  const response = NextResponse.json({ phone: maskPhone(phone) });
  response.cookies.set(SESSION_COOKIE, await signSession(phone), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_S,
    path: "/",
  });
  return response;
}
