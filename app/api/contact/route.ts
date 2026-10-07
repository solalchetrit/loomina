import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/loomina/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Formulaire de contact.
 *
 * Avant : un `mailto:` qui ouvrait (ou non) le logiciel de messagerie du
 * visiteur, et un message perdu si rien ne s'ouvrait.
 *
 * Maintenant : le message est enregistré dans `contact_messages`, puis, si
 * `CONTACT_NOTIFY_PHONE` est renseignée, un SMS prévient l'équipe via Twilio.
 * L'enregistrement suffit à répondre « bien reçu » ; le SMS est un confort.
 */

const MAX = { name: 120, email: 200, message: 4000 };

function clean(v: unknown, max: number): string {
    return typeof v === "string" ? v.trim().slice(0, max) : "";
}

async function notifyBySms(text: string): Promise<void> {
    const to = process.env.CONTACT_NOTIFY_PHONE;
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.CONTACT_SMS_FROM;
    if (!to || !sid || !token || !from) return;

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: "POST",
        headers: {
            Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: from, Body: text.slice(0, 600) }),
    });
    if (!res.ok) console.warn("[contact] SMS non envoyé :", res.status);
}

export async function POST(request: NextRequest) {
    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: "Requête illisible." }, { status: 400 });
    }

    // Champ invisible pour les robots : s'il est rempli, on répond OK sans rien garder.
    if (clean(body.website, 50)) return NextResponse.json({ ok: true });

    const name = clean(body.name, MAX.name);
    const email = clean(body.email, MAX.email);
    const message = clean(body.message, MAX.message);
    const subject = clean(body.subject, 40) || "question";

    if (!name || !email || !message) {
        return NextResponse.json({ message: "Merci d’indiquer votre nom, votre e-mail et votre message." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        return NextResponse.json({ message: "L’adresse e-mail ne semble pas valide." }, { status: 400 });
    }

    try {
        const { error } = await db().from("contact_messages").insert({ name, email, subject, message });
        if (error) throw new Error(error.message);
    } catch (err) {
        console.error("[contact] enregistrement impossible :", err);
        return NextResponse.json(
            { message: "Nous n’avons pas pu enregistrer votre message. Écrivez-nous directement à contact@loomina.eu." },
            { status: 500 }
        );
    }

    notifyBySms(`Loomina — message de ${name} (${email}) [${subject}] : ${message}`).catch(() => {});

    return NextResponse.json({ ok: true });
}
