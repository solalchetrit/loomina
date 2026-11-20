/**
 * La personne qui offre le livre, et son « espace famille ».
 *
 * Quand un livre est offert, celui qui raconte et celui qui offre sont deux
 * personnes : le narrateur se connecte à l'espace auteur avec SON numéro,
 * l'offreur à l'espace famille avec LE SIEN, demandé à la commande.
 *
 * L'offreur est rangé dans `projects.project_metadata.giver`
 * ({ first_name, phone }), au même endroit que `is_gift` et `buyer_email` :
 * pas de table de plus, et le lien avec le livre du narrateur est direct.
 *
 * Ce qu'il voit : l'avancement du livre et le titre des récits. Le texte
 * des récits n'apparaît que si le narrateur l'a décidé dans ses réglages
 * (`project_metadata.share_with_giver`) : c'est sa vie, c'est lui qui choisit.
 */

import { db, type Project } from './db';

export interface Giver {
    firstName: string | null;
    /** Toujours en E.164, comme les numéros des narrateurs. */
    phone: string;
}

export function readGiver(meta: Record<string, unknown> | null | undefined): Giver | null {
    const raw = meta?.giver;
    if (!raw || typeof raw !== 'object') return null;
    const g = raw as Record<string, unknown>;
    const phone = typeof g.phone === 'string' ? g.phone.trim() : '';
    if (!/^\+\d{8,15}$/.test(phone)) return null;
    const firstName = typeof g.first_name === 'string' && g.first_name.trim() ? g.first_name.trim().slice(0, 60) : null;
    return { firstName, phone };
}

/** Le narrateur a-t-il choisi de laisser lire ses récits à celui qui a offert le livre ? */
export function sharesWithGiver(meta: Record<string, unknown> | null | undefined): boolean {
    return meta?.share_with_giver === true;
}

/**
 * Les souvenirs soufflés par l'offreur et pas encore abordés par Loomina.
 * L'offreur ne voit QUE les siens : les autres sujets en attente (ceux de
 * l'auteur, ceux que Loomina se garde) parlent de la vie du narrateur.
 */
export function giverPendingTopics(meta: Record<string, unknown> | null | undefined, suggested: string[] | undefined): string[] {
    const mine = Array.isArray(meta?.giver_topics) ? (meta.giver_topics as unknown[]).filter((t): t is string => typeof t === 'string') : [];
    const pending = new Set(suggested ?? []);
    return mine.filter((t) => pending.has(t));
}

/**
 * Les autres proches qui suivent le livre (demande de Solal du 20/11/2026) :
 * ajoutés à la commande par celui qui offre, ou plus tard par l'auteur dans
 * ses réglages. Rangés dans `project_metadata.family_members`. Chacun ouvre
 * l'espace famille avec son propre numéro et y voit la même chose que
 * l'offreur.
 */
export interface FamilyMember {
    firstName: string | null;
    phone: string;
    addedBy: 'order' | 'author';
    addedAt: string | null;
}

/** Au plus dix proches par livre, en plus de celui qui l'a offert. */
export const MAX_FAMILY_MEMBERS = 10;

export function readFamilyMembers(meta: Record<string, unknown> | null | undefined): FamilyMember[] {
    const raw = meta?.family_members;
    if (!Array.isArray(raw)) return [];
    const seen = new Set<string>();
    const out: FamilyMember[] = [];
    for (const item of raw) {
        if (!item || typeof item !== 'object') continue;
        const m = item as Record<string, unknown>;
        const phone = typeof m.phone === 'string' ? m.phone.trim() : '';
        if (!/^\+\d{8,15}$/.test(phone) || seen.has(phone)) continue;
        seen.add(phone);
        out.push({
            firstName: typeof m.first_name === 'string' && m.first_name.trim() ? m.first_name.trim().slice(0, 60) : null,
            phone,
            addedBy: m.added_by === 'author' ? 'author' : 'order',
            addedAt: typeof m.added_at === 'string' ? m.added_at : null,
        });
    }
    return out.slice(0, MAX_FAMILY_MEMBERS);
}

/** Pour l'écrire dans project_metadata.family_members. */
export function storeFamilyMembers(members: FamilyMember[]): Record<string, unknown>[] {
    return members.slice(0, MAX_FAMILY_MEMBERS).map((m) => ({ first_name: m.firstName, phone: m.phone, added_by: m.addedBy, added_at: m.addedAt }));
}

/** Tous ceux qui ouvrent l'espace famille de ce livre : l'offreur d'abord, puis les autres proches. */
export function familyAudience(meta: Record<string, unknown> | null | undefined): { firstName: string | null; phone: string; giver: boolean }[] {
    const giver = readGiver(meta);
    const out = giver ? [{ firstName: giver.firstName, phone: giver.phone, giver: true }] : [];
    for (const m of readFamilyMembers(meta)) if (m.phone !== giver?.phone) out.push({ firstName: m.firstName, phone: m.phone, giver: false });
    return out;
}

/** La personne connectée à l'espace famille de ce livre, ou null si ce numéro n'y a pas accès. */
export function familyMemberOf(meta: Record<string, unknown> | null | undefined, phone: string) {
    return familyAudience(meta).find((p) => p.phone === phone) ?? null;
}

const createdAt = (p: Project) => String((p as unknown as { created_at?: string }).created_at ?? '');

/** Les livres que ce numéro suit dans l'espace famille (offerts, ou partagés avec lui), du plus récent au plus ancien. */
export async function findGiftProjects(phone: string): Promise<Project[]> {
    const [asGiver, asMember] = await Promise.all([
        db().from('projects').select('*').eq('project_metadata->giver->>phone', phone).order('created_at', { ascending: false }).limit(10),
        db()
            .from('projects')
            .select('*')
            .filter('project_metadata->family_members', 'cs', JSON.stringify([{ phone }]))
            .order('created_at', { ascending: false })
            .limit(10),
    ]);
    if (asGiver.error) throw new Error(`Lecture des livres offerts impossible : ${asGiver.error.message}`);
    if (asMember.error) throw new Error(`Lecture des livres partagés impossible : ${asMember.error.message}`);
    const byId = new Map<string, Project>();
    for (const p of [...(asGiver.data ?? []), ...(asMember.data ?? [])] as Project[]) byId.set(p.id, p);
    // Le filtre JSON est revérifié ici : seul un proche correctement enregistré ouvre un livre.
    return [...byId.values()]
        .filter((p) => familyMemberOf(p.project_metadata, phone))
        .sort((a, b) => createdAt(b).localeCompare(createdAt(a)))
        .slice(0, 10);
}

/**
 * Les proches ajoutés à la commande voyagent dans les métadonnées Stripe
 * (500 caractères au plus par valeur) : une liste compacte [[prénom, numéro]].
 */
export function encodeFamilyForStripe(list: unknown): string {
    if (!Array.isArray(list)) return '';
    const pairs: [string, string][] = [];
    for (const item of list) {
        if (!item || typeof item !== 'object') continue;
        const m = item as Record<string, unknown>;
        const phone = typeof m.phone === 'string' ? m.phone.trim() : '';
        if (!/^\+\d{8,15}$/.test(phone) || pairs.some((p) => p[1] === phone)) continue;
        const name = typeof m.firstName === 'string' ? m.firstName.trim().slice(0, 30) : '';
        const next = [...pairs, [name, phone] as [string, string]];
        if (JSON.stringify(next).length > 490) break;
        pairs.push([name, phone]);
        if (pairs.length >= MAX_FAMILY_MEMBERS) break;
    }
    return pairs.length ? JSON.stringify(pairs) : '';
}

/** L'inverse, au webhook : sans le narrateur ni celui qui offre, sans doublon. */
export function decodeFamilyFromStripe(raw: string | undefined | null, exclude: (string | null | undefined)[], at: string): FamilyMember[] {
    if (!raw) return [];
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return [];
    }
    if (!Array.isArray(parsed)) return [];
    const skip = new Set(exclude.filter(Boolean) as string[]);
    const out: FamilyMember[] = [];
    for (const pair of parsed) {
        if (!Array.isArray(pair)) continue;
        const [name, phone] = pair;
        if (typeof phone !== 'string' || !/^\+\d{8,15}$/.test(phone) || skip.has(phone)) continue;
        skip.add(phone);
        out.push({ firstName: typeof name === 'string' && name.trim() ? name.trim().slice(0, 60) : null, phone, addedBy: 'order', addedAt: at });
    }
    return out.slice(0, MAX_FAMILY_MEMBERS);
}

/** L'accueil de l'espace famille est vu une fois par chaque proche (`project_metadata.family_welcome_done`). */
export function familyWelcomeDone(meta: Record<string, unknown> | null | undefined, phone: string): boolean {
    const done = meta?.family_welcome_done;
    return !!done && typeof done === 'object' && typeof (done as Record<string, unknown>)[phone] === 'string';
}

export function markFamilyWelcome(meta: Record<string, unknown> | null | undefined, phone: string): Record<string, string> {
    const done = meta?.family_welcome_done && typeof meta.family_welcome_done === 'object' ? (meta.family_welcome_done as Record<string, string>) : {};
    return { ...done, [phone]: new Date().toISOString() };
}
