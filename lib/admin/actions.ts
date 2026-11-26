/**
 * Ce que l'équipe peut FAIRE depuis l'admin (le reste de l'admin ne fait que lire).
 *
 * Demandes de Solal (17/11/2026) : rembourser un client d'un clic, relancer
 * un client qui n'appelle pas, relancer le traitement d'un appel en échec.
 * Chaque action est appelée par une route de /api/admin, qui vérifie d'abord
 * le cookie de l'admin.
 */

import { db, phoneVariants } from '@/lib/loomina/db';
import type { Profile, Project } from '@/lib/loomina/db';
import { stripe } from '@/lib/stripe';
import { sendSms } from '@/lib/loomina/sms';
import { sendEmail, alertTeam, teamContacts } from '@/lib/loomina/notify';
import { readGiver } from '@/lib/loomina/giver';
import { SITE } from '@/config/site';
import { formatToE164 } from '@/lib/phone';
import { WRITING_STYLES } from '@/lib/loomina/styles';

type Meta = Record<string, unknown>;
type PaidProject = Project & { created_at: string; stripe_session_id: string | null };

async function latestProject(profileId: string): Promise<PaidProject | null> {
    const { data, error } = await db().from('projects').select('*').eq('user_id', profileId).order('created_at', { ascending: false }).limit(1);
    if (error) throw new Error(`Lecture du livre impossible : ${error.message}`);
    return ((data ?? [])[0] as PaidProject | undefined) ?? null;
}

async function readProfile(profileId: string): Promise<Profile | null> {
    const { data } = await db().from('profiles').select('*').eq('id', profileId).maybeSingle();
    return (data as Profile | null) ?? null;
}

// ------------------------------------------------------------
// Rembourser
// ------------------------------------------------------------

export interface RefundResult {
    ok: boolean;
    message: string;
}

/**
 * Rembourse intégralement la commande du client dans Stripe, puis ferme le
 * livre : plus de rendez-vous, plus d'entretien quand il appelle.
 *
 * Sans danger si on clique deux fois : la clé d'idempotence fait que Stripe
 * ne rembourse qu'une fois, et un livre déjà remboursé est refusé avant.
 */
export async function refundClient(profileId: string): Promise<RefundResult> {
    const project = await latestProject(profileId);
    if (!project) return { ok: false, message: 'Ce client n’a pas de livre.' };
    const meta = (project.project_metadata ?? {}) as Meta;
    if (typeof meta.refunded_at === 'string') return { ok: false, message: 'Cette commande a déjà été remboursée.' };
    if (!project.stripe_session_id) return { ok: false, message: 'Pas de paiement Stripe lié à ce livre (créé à la main ou test) : rien à rembourser.' };

    const session = await stripe().checkout.sessions.retrieve(project.stripe_session_id);
    const intent = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
    if (!intent) return { ok: false, message: 'Stripe ne retrouve pas le paiement de cette commande.' };

    const refund = await stripe().refunds.create({ payment_intent: intent, reason: 'requested_by_customer' }, { idempotencyKey: `loomina-refund-${project.id}` });
    const amount = (refund.amount ?? 0) / 100;

    const schedule = (meta.call_schedule ?? {}) as Meta;
    const { error } = await db()
        .from('projects')
        .update({
            status: 'paused',
            project_metadata: {
                ...meta,
                refunded_at: new Date().toISOString(),
                refund_id: refund.id,
                refund_amount: amount,
                call_schedule: { ...schedule, active: false },
                // L'appel à date unique est annulé aussi.
                call_once: undefined,
            },
        })
        .eq('id', project.id);
    if (error) {
        // L'argent est reparti mais le livre n'est pas fermé : à dire clairement.
        return { ok: false, message: `Remboursement de ${amount} € fait dans Stripe (${refund.id}), mais le livre n’a pas pu être fermé : ${error.message}` };
    }

    const profile = await readProfile(profileId);
    const name = profile?.first_name ?? 'le client';
    const buyerEmail = typeof meta.buyer_email === 'string' ? meta.buyer_email : profile?.email ?? null;
    await Promise.allSettled([
        buyerEmail
            ? sendEmail({
                  to: buyerEmail,
                  subject: 'Votre remboursement Loomina',
                  text: `Bonjour,\n\nNous venons de vous rembourser intégralement votre commande Loomina (${amount} €). Selon votre banque, le montant apparaît sur votre compte sous 5 à 10 jours.\n\nMerci d'avoir essayé Loomina. Si vous avez une question, répondez simplement à ce message.\n\nL'équipe Loomina`,
                  replyTo: teamContacts().email,
              })
            : Promise.resolve(false),
        alertTeam({
            subject: `Remboursement fait : ${name}`,
            text: `La commande de ${name} a été remboursée (${amount} €, ${refund.id}). Le livre est fermé et les rendez-vous sont arrêtés.`,
            sms: `remboursement de ${amount} € fait pour ${name}.`,
        }),
    ]);
    return { ok: true, message: `Remboursement de ${amount} € envoyé. Le livre est fermé.` };
}

// ------------------------------------------------------------
// Relancer un client qui n'appelle pas
// ------------------------------------------------------------

/** Les textes de relance : au narrateur, ou à celui qui a offert le livre. */
export function relanceTexts(params: { firstName: string | null; tu: boolean; toGiver: boolean; narrator: string }): { sms: string; subject: string; email: string } {
    const host = SITE.url.replace(/^https?:\/\/(www\.)?/, '');
    if (params.toGiver) {
        return {
            sms: `Loomina : le livre de ${params.narrator} n'attend plus que son premier appel. ${params.narrator} peut appeler le ${SITE.phoneDisplay} depuis son téléphone, quand il ou elle veut. Besoin d'aide ? Écrivez à contact@loomina.eu`,
            subject: `Le livre de ${params.narrator} n'attend plus que son premier appel`,
            email: `Bonjour${params.firstName ? ` ${params.firstName}` : ''},\n\nLe livre que vous avez offert à ${params.narrator} est prêt, mais nous n'avons pas encore eu son premier appel.\n\nPour commencer, ${params.narrator} n'a qu'à appeler le ${SITE.phoneDisplay} depuis son propre téléphone, quand il ou elle le souhaite. Il n'y a rien à préparer : Loomina mène la conversation.\n\nSi quelque chose bloque, répondez simplement à ce message : nous vous aidons volontiers.\n\nL'équipe Loomina`,
        };
    }
    const hello = params.firstName ? `Bonjour ${params.firstName}` : 'Bonjour';
    return {
        sms: params.tu
            ? `${hello}, c'est Loomina. Ton livre t'attend : appelle le ${SITE.phoneDisplay} quand tu veux, je serai ravi de t'écouter. Ton espace : ${host}/dashboard`
            : `${hello}, c'est Loomina. Votre livre vous attend : appelez le ${SITE.phoneDisplay} quand vous voulez, je serai ravi de vous écouter. Votre espace : ${host}/dashboard`,
        subject: params.tu ? 'Ton livre t’attend' : 'Votre livre vous attend',
        // Au tutoiement si l'auteur l'a choisi, comme le SMS (23/11/2026).
        email: params.tu
            ? `${hello},\n\nTon livre t'attend. Pour continuer, appelle le ${SITE.phoneDisplay} depuis ton téléphone, quand tu veux : il n'y a rien à préparer, Loomina mène la conversation.\n\nTu peux aussi choisir des jours et une heure dans ton espace (${host}/dashboard) : Loomina t'appellera.\n\nSi quelque chose te gêne, réponds simplement à ce message.\n\nL'équipe Loomina`
            : `${hello},\n\nVotre livre vous attend. Pour continuer, appelez le ${SITE.phoneDisplay} depuis votre téléphone, quand vous le souhaitez : il n'y a rien à préparer, Loomina mène la conversation.\n\nVous pouvez aussi choisir des jours et une heure dans votre espace (${host}/dashboard) : Loomina vous appellera.\n\nSi quelque chose vous gêne, répondez simplement à ce message.\n\nL'équipe Loomina`,
    };
}

/**
 * Envoie une relance par SMS et par e-mail. Livre offert sans aucun appel :
 * elle va à celui qui a offert (le narrateur ne sait peut-être pas encore).
 * `auto` : relance automatique après 14 jours sans appel (lib/admin/watch.ts) ;
 * on note alors depuis quand le client n'appelle plus, pour ne la faire qu'une fois.
 */
export async function relanceClient(profileId: string, opts: { auto?: string } = {}): Promise<RefundResult> {
    const [profile, project] = await Promise.all([readProfile(profileId), latestProject(profileId)]);
    if (!profile || !project) return { ok: false, message: 'Client ou livre introuvable.' };
    const meta = (project.project_metadata ?? {}) as Meta;
    if (typeof meta.refunded_at === 'string') return { ok: false, message: 'Commande remboursée : pas de relance.' };

    const { count } = await db().from('interviews').select('id', { count: 'exact', head: true }).eq('project_id', project.id);
    const giver = readGiver(meta);
    const toGiver = meta.is_gift === true && !!giver && (count ?? 0) === 0;
    const texts = relanceTexts({
        firstName: toGiver ? giver!.firstName : profile.first_name,
        tu: profile.politeness_preference === 'tu',
        toGiver,
        narrator: profile.first_name ?? 'votre proche',
    });
    const phone = toGiver ? giver!.phone : profile.phone_number;
    const email = toGiver ? (typeof meta.buyer_email === 'string' ? meta.buyer_email : null) : meta.is_gift === true ? null : profile.email;

    const [sms, mail] = await Promise.all([
        phone ? sendSms(phone, texts.sms) : Promise.resolve(false),
        email ? sendEmail({ to: email, subject: texts.subject, text: texts.email, replyTo: teamContacts().email }) : Promise.resolve(false),
    ]);
    if (!sms && !mail) return { ok: false, message: 'Ni le SMS ni l’e-mail ne sont partis (numéro manquant, ou envoi refusé).' };

    const history = Array.isArray(meta.relances) ? (meta.relances as unknown[]).slice(-9) : [];
    await db()
        .from('projects')
        .update({
            project_metadata: {
                ...meta,
                relances: [...history, { at: new Date().toISOString(), sms, mail, to: toGiver ? 'offreur' : 'narrateur', ...(opts.auto ? { auto: true } : {}) }],
                ...(opts.auto ? { auto_relance: { since: opts.auto, at: new Date().toISOString() } } : {}),
            },
        })
        .eq('id', project.id);
    return { ok: true, message: `Relance envoyée ${toGiver ? 'à celui qui a offert le livre' : 'au narrateur'} (${[sms ? 'SMS' : null, mail ? 'e-mail' : null].filter(Boolean).join(' et ')}).` };
}

// ------------------------------------------------------------
// Relancer le traitement d'un appel en échec
// ------------------------------------------------------------

/** Remet un appel en échec dans la file : il sera retraité dans les 5 minutes. */
export async function retryEvent(eventId: string): Promise<RefundResult> {
    const { data, error } = await db()
        .from('call_events')
        .update({ status: 'pending', attempts: 0, error: null, claimed_at: null })
        .eq('id', eventId)
        .eq('status', 'failed')
        .select('id');
    if (error) return { ok: false, message: `Relance impossible : ${error.message}` };
    if (!data?.length) return { ok: false, message: 'Cet appel n’est pas en échec.' };
    return { ok: true, message: 'Appel remis dans la file : il sera retraité dans les 5 minutes.' };
}

// ------------------------------------------------------------
// Corriger la fiche du narrateur
// ------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Le texte d'un champ, nettoyé ; null si vide. */
function text(form: FormData, key: string, max: number): string | null {
    const v = String(form.get(key) ?? '').replace(/\s+/g, ' ').trim();
    if (v.length > max) throw new Error(`Champ « ${key} » trop long (${max} caractères au plus).`);
    return v || null;
}

/**
 * Demande de Solal (25/11/2026) : corriger depuis l'admin ce que le narrateur
 * a donné (prénom, nom, téléphone, e-mail, tu ou vous, ton
 * d'écriture, sujets à éviter). Seule la ligne `profiles` change : l'e-mail
 * technique du compte (auth.users) reste celui créé à la commande.
 *
 * Le téléphone est la clé qui reconnaît l'appelant et que l'on rappelle aux
 * rendez-vous : il est mis au format +33…, et refusé s'il appartient déjà à
 * un autre client.
 */
export async function updateNarrator(profileId: string, form: FormData): Promise<RefundResult> {
    const profile = await readProfile(profileId);
    if (!profile) return { ok: false, message: 'Client introuvable.' };

    const firstName = text(form, 'first_name', 60);
    const lastName = text(form, 'last_name', 80);
    const emailRaw = text(form, 'email', 200);
    const phoneRaw = text(form, 'phone_number', 30);
    const politeness = String(form.get('politeness_preference') ?? '');
    const style = String(form.get('writing_style') ?? '').trim();
    const topicsRaw = String(form.get('sensitive_topics') ?? '').trim();

    if (!firstName) return { ok: false, message: 'Le prénom est obligatoire : Loomina s’en sert pour saluer.' };
    if (politeness !== 'tu' && politeness !== 'vous') return { ok: false, message: 'Choisir tutoiement ou vouvoiement.' };
    const styles: readonly string[] = WRITING_STYLES;
    if (!styles.includes(style) && style !== profile.writing_style) return { ok: false, message: 'Ton d’écriture inconnu.' };
    if (topicsRaw.length > 1000) return { ok: false, message: 'Sujets à éviter : 1 000 caractères au plus.' };

    const email = emailRaw ? emailRaw.toLowerCase() : null;
    if (email && !EMAIL_RE.test(email)) return { ok: false, message: `E-mail invalide : « ${emailRaw} ».` };

    if (!phoneRaw) return { ok: false, message: 'Le téléphone est obligatoire : c’est lui qui reconnaît le narrateur quand il appelle.' };
    const phone = formatToE164(phoneRaw);
    if (!/^\+\d{8,15}$/.test(phone)) return { ok: false, message: `Numéro invalide : « ${phoneRaw} ». Exemple : 06 12 34 56 78.` };
    if (phone !== profile.phone_number) {
        const { data: others, error } = await db().from('profiles').select('id, first_name').in('phone_number', phoneVariants(phone)).neq('id', profileId).limit(1);
        if (error) throw new Error(`Vérification du numéro impossible : ${error.message}`);
        if (others && others.length) return { ok: false, message: `Ce numéro est déjà celui d’un autre client (${(others[0] as { first_name: string | null }).first_name ?? 'sans prénom'}).` };
    }

    const update = {
        first_name: firstName,
        last_name: lastName,
        full_name: [firstName, lastName].filter(Boolean).join(' '),
        email,
        phone_number: phone,
        politeness_preference: politeness,
        writing_style: style,
        sensitive_topics: topicsRaw || null,
        updated_at: new Date().toISOString(),
    };
    const changed = (Object.keys(update) as Array<keyof typeof update>).filter((k) => k !== 'updated_at' && k !== 'full_name' && (profile as unknown as Record<string, unknown>)[k] !== update[k]);
    if (changed.length === 0) return { ok: true, message: 'Rien n’a changé.' };

    const { error } = await db().from('profiles').update(update).eq('id', profileId);
    if (error) throw new Error(`Enregistrement impossible : ${error.message}`);
    console.log(`[admin] fiche ${profileId} corrigée : ${changed.join(', ')}`);

    const labels: Record<string, string> = {
        first_name: 'prénom', last_name: 'nom', email: 'e-mail', phone_number: 'téléphone',
        politeness_preference: 'tu / vous', writing_style: 'ton d’écriture', sensitive_topics: 'sujets à éviter',
    };
    return { ok: true, message: `Fiche enregistrée (${changed.map((k) => labels[k]).join(', ')}).` };
}
