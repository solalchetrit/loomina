import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { formatToE164 } from "@/lib/phone";
import { db, maskPhone } from "@/lib/loomina/db";
import { signSession, SESSION_COOKIE, SESSION_MAX_AGE_S } from "@/lib/loomina/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Au-delà, le lien de retour de Stripe n'ouvre plus l'espace : connexion par SMS. */
const WELCOME_WINDOW_S = 24 * 60 * 60;

/**
 * Page de bienvenue après la commande (app/bienvenue).
 *
 * Le navigateur revient de Stripe avec l'identifiant de la session de paiement.
 * On vérifie chez Stripe qu'elle est bien payée (ou à 0 € avec un code) et
 * récente, puis on attend que le webhook ait créé le livre. Dès qu'il existe,
 * on ouvre l'espace sans code SMS : celui de l'auteur, ou l'espace famille de
 * la personne qui offre. Le numéro vient de la commande, jamais du navigateur.
 *
 * Réponses : { ready: false } tant que le livre n'est pas créé (la page
 * réessaie), { ready: true, ... } avec le cookie de session, 404 sinon.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  if (!/^cs_(live|test)_[A-Za-z0-9]{10,}$/.test(sessionId)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  let session;
  try {
    session = await stripe().checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const paid = session.status === "complete" && (session.payment_status === "paid" || session.payment_status === "no_payment_required");
  const recent = Date.now() / 1000 - session.created < WELCOME_WINDOW_S;
  if (!paid || !recent) return NextResponse.json({ error: "not found" }, { status: 404 });

  const meta = session.metadata ?? {};
  const isGift = meta.isGift === "true" || meta.isGift === "1";
  const authorPhone = meta.phone ? formatToE164(meta.phone) : "";
  const giverPhone = isGift && meta.giverPhone ? formatToE164(meta.giverPhone) : "";
  // Livre offert : on ouvre l'espace famille de celui qui offre (il est devant l'écran).
  const familyOpen = Boolean(giverPhone) && /^\+\d{8,15}$/.test(giverPhone) && giverPhone !== authorPhone;
  const phone = familyOpen ? giverPhone : authorPhone;
  if (!/^\+\d{8,15}$/.test(phone)) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: project, error } = await db().from("projects").select("id").eq("stripe_session_id", session.id).maybeSingle();
  if (error) return NextResponse.json({ error: "lecture" }, { status: 500 });

  const info = {
    isGift,
    space: familyOpen ? "famille" : "auteur",
    firstName: meta.firstName?.trim() || "",
    giverFirstName: meta.giverFirstName?.trim() || "",
    phone: maskPhone(phone),
    // Le numéro que Loomina reconnaîtra au téléphone (celui de l'auteur).
    authorPhone: maskPhone(authorPhone),
  };
  if (!project) return NextResponse.json({ ready: false, ...info });

  const response = NextResponse.json({ ready: true, ...info });
  response.cookies.set(SESSION_COOKIE, await signSession(phone), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_S,
    path: "/",
  });
  return response;
}
