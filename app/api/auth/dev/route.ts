import { NextResponse } from "next/server";
import { signSession, SESSION_COOKIE } from "@/lib/loomina/session";
import { db, maskPhone } from "@/lib/loomina/db";

/**
 * Ouverture directe de l'espace auteur, sans code SMS.
 *
 * Deux cas, et seulement ces deux-là (sinon 404) :
 * - poste local : `next dev` avec LOOMINA_DEV_LOGIN=true, session du numéro
 *   LOOMINA_DEV_PHONE (.env.local) ;
 * - en ligne, phase de test : LOOMINA_OPEN_AUTHOR_PROFILE_ID posée sur Vercel.
 *   Tout visiteur qui ouvre l'espace auteur arrive sur CE profil. À retirer
 *   avant le premier vrai client : la variable supprimée, la connexion par
 *   SMS revient d'elle-même.
 *
 * Aucun numéro ni identifiant ne vient du navigateur.
 */
async function openPhone(): Promise<string | null> {
  const profileId = process.env.LOOMINA_OPEN_AUTHOR_PROFILE_ID;
  if (profileId) {
    const { data } = await db().from("profiles").select("phone_number").eq("id", profileId).maybeSingle();
    return (data?.phone_number as string | null) ?? null;
  }
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
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}
