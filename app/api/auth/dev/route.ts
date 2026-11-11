import { NextResponse } from "next/server";
import { signSession, SESSION_COOKIE } from "@/lib/loomina/session";

/**
 * Connexion automatique à l'espace auteur, sur le poste local uniquement.
 *
 * Répond 404 sauf sous `next dev` avec LOOMINA_DEV_LOGIN=true, et n'ouvre que la
 * session du numéro LOOMINA_DEV_PHONE (.env.local) : aucun numéro venu du navigateur.
 */
export async function POST() {
  const phone = process.env.LOOMINA_DEV_PHONE;
  if (process.env.NODE_ENV !== "development" || process.env.LOOMINA_DEV_LOGIN !== "true" || !phone) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const response = NextResponse.json({ phone });
  response.cookies.set(SESSION_COOKIE, await signSession(phone), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}
