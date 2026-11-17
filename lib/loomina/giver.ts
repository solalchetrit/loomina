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

/** Les livres offerts par ce numéro, du plus récent au plus ancien. */
export async function findGiftProjects(giverPhone: string): Promise<Project[]> {
    const { data, error } = await db()
        .from('projects')
        .select('*')
        .eq('project_metadata->giver->>phone', giverPhone)
        .order('created_at', { ascending: false })
        .limit(10);
    if (error) throw new Error(`Lecture des livres offerts impossible : ${error.message}`);
    // Le filtre JSON est revérifié ici : seul un offreur correctement enregistré ouvre un livre.
    return ((data ?? []) as Project[]).filter((p) => readGiver(p.project_metadata)?.phone === giverPhone);
}
