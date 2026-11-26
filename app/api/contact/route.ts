import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/loomina/db";
import { alertTeam, sendEmail, teamContacts } from "@/lib/loomina/notify";
import { contactRecuEmail } from "@/lib/emails/messages/contact";
import { allow, clientIp, TOO_MANY } from "@/lib/loomina/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Formulaire de contact.
 *
 * Avant : un `mailto:` qui ouvrait (ou non) le logiciel de messagerie du
 * visiteur, et un message perdu si rien ne s'ouvrait.
 *
 * Maintenant : le message est enregistré dans `contact_messages`, puis
 * l'équipe est prévenue par e-mail et par SMS (lib/loomina/notify.ts).
 * L'enregistrement suffit à répondre « bien reçu ».
 */

const MAX = { name: 120, email: 200, message: 4000 };

function clean(v: unknown, max: number): string {
    return typeof v === "string" ? v.trim().slice(0, max) : "";
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

    // Limites anti-abus (25/11/2026) : chaque message envoie un SMS à l'équipe.
    const ip = clientIp(request.headers);
    const ok = await Promise.all([allow(`contact:ip:${ip}`, 3600, 5), allow(`contact:mail:${email.toLowerCase()}`, 86400, 5)]);
    if (ok.includes(false)) return NextResponse.json({ message: TOO_MANY }, { status: 429 });

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

    // L'équipe est prévenue par e-mail et par SMS. Attendu : sur Vercel, ce
    // qui n'est pas attendu avant la réponse peut ne jamais partir.
    await alertTeam({
        subject: `Message de ${name} [${subject}]`,
        text: `${name} (${email}) a écrit depuis le formulaire de contact :\n\n${message}`,
        sms: `message de ${name} (${email}) [${subject}] : ${message.slice(0, 300)}`,
        replyTo: email,
    });

    // Et la personne reçoit tout de suite un « bien reçu » (25/11/2026).
    const recu = contactRecuEmail({ name });
    await sendEmail({ to: email, subject: recu.subject, text: recu.text, html: recu.html, replyTo: teamContacts().email }).catch(() => false);

    return NextResponse.json({ ok: true });
}
