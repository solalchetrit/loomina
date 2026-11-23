/**
 * Ce que l'admin surveille tout seul, sans qu'on ouvre la page.
 *
 * Appelé par /api/jobs/process, que le serveur vocal réveille toutes les
 * 5 minutes :
 *  - l'avis de l'IA sur un livre qui vient d'être terminé, avant la relecture
 *    par l'équipe (demande de Solal, 17/11/2026) ;
 *  - l'alerte « client à relancer » : un client qui n'a pas appelé depuis trop
 *    longtemps est signalé une fois, par e-mail et par SMS ;
 *  - la relance automatique du client après 14 jours sans appel (23/11/2026).
 * Rien ici ne lève.
 */

import { db } from '@/lib/loomina/db';
import { readEditions } from '@/lib/loomina/book-edition';
import { beginReview, runReview, readReview } from '@/lib/loomina/book-review';
import { alertTeam } from '@/lib/loomina/notify';
import { getCrm, INACTIVE_AFTER_DAYS } from '@/lib/admin/data';
import { relanceClient } from '@/lib/admin/actions';
import { SITE } from '@/config/site';

type Meta = Record<string, unknown>;

/** Un livre terminé, composé, et pas encore lu par l'IA : on demande l'avis. Un seul par passage. */
export async function sweepReviews(): Promise<number> {
    try {
        const { data, error } = await db().from('projects').select('id, user_id, project_metadata').eq('status', 'completed').limit(100);
        if (error) throw new Error(error.message);
        for (const project of data ?? []) {
            const meta = (project.project_metadata ?? {}) as Meta;
            if (readReview(meta) || typeof meta.refunded_at === 'string' || meta.banc === true) continue;
            const editions = await readEditions(project.id as string);
            // Composition en cours : on attend la version à jour du livre.
            if (!editions.ready || editions.running) continue;
            const begun = await beginReview(project.id as string);
            if (!begun.ok) continue;
            const { data: profile } = await db().from('profiles').select('first_name').eq('id', project.user_id).maybeSingle();
            const name = (profile?.first_name as string | null) ?? '';
            await runReview(project.id as string, begun.editionId, begun.chapters, name);
            await alertTeam({
                subject: `Avis de l'IA prêt : livre de ${name || 'un auteur'}`,
                text: `Le livre de ${name || 'un auteur'} est terminé et l'IA vient de le lire en entier. Son avis vous attend avant votre relecture :\n${SITE.url}/admin/clients/${project.user_id}/livre`,
                sms: `l'avis de l'IA sur le livre de ${name || 'un auteur'} est prêt.`,
            });
            return 1;
        }
    } catch (err) {
        console.error('[veille] avis automatique impossible :', err instanceof Error ? err.message : String(err));
    }
    return 0;
}

/** Heure de Paris (0-23), pour ne prévenir personne la nuit. */
function parisHour(now = new Date()): number {
    return Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', hour12: false }).format(now));
}

/**
 * Quand la relance automatique est due : 14 jours sans appel, comptés depuis
 * le dernier vrai appel, ou depuis la commande s'il n'y en a jamais eu
 * (demande de Solal, 23/11/2026 ; avant, il fallait appuyer sur « Relancer »).
 * Une seule fois par silence : `since` est la date à partir de laquelle on compte.
 */
export function autoRelanceDue(
    c: { health: string; test: boolean; lastCallAt: string | null; orderedAt: string; daysSinceLastCall: number | null; daysSinceOrder: number },
    meta: Meta
): string | null {
    if (c.test || meta.banc === true || typeof meta.refunded_at === 'string') return null;
    if (c.health !== 'relancer' && c.health !== 'inactif') return null;
    const quiet = c.daysSinceLastCall ?? c.daysSinceOrder;
    if (quiet <= INACTIVE_AFTER_DAYS) return null;
    const since = c.lastCallAt ?? c.orderedAt;
    const done = meta.auto_relance as { since?: string } | undefined;
    return done?.since === since ? null : since;
}

/**
 * Prévient l'équipe quand un client devient « à relancer » (pas de vrai appel
 * 3 jours après la commande) ou « inactif » (pas d'appel depuis 14 jours).
 * Une seule alerte par client, par état et par silence, entre 9 h et 20 h.
 * Après 14 jours sans appel, la relance part aussi toute seule au client
 * (entre 10 h et 19 h), et l'alerte le dit.
 */
export async function sweepRelanceAlerts(now = new Date()): Promise<number> {
    try {
        const hour = parisHour(now);
        // Une fois par heure suffit (le passage a lieu toutes les 5 minutes).
        if (hour < 9 || hour >= 20 || now.getMinutes() >= 5) return 0;
        const { clients } = await getCrm(now.getTime());
        const due = clients.filter((c) => c.health === 'relancer' || c.health === 'inactif');
        if (!due.length) return 0;

        const fresh: Array<{ name: string; why: string }> = [];
        for (const c of due) {
            const { data: rows } = await db().from('projects').select('id, project_metadata').eq('user_id', c.id).order('created_at', { ascending: false }).limit(1);
            const project = rows?.[0];
            if (!project) continue;
            const meta = (project.project_metadata ?? {}) as Meta;
            if (meta.banc === true || typeof meta.refunded_at === 'string') continue;
            const since = c.lastCallAt ?? c.orderedAt;
            const why = c.health === 'relancer' ? `a commandé il y a ${c.daysSinceOrder} jours et n'a pas encore fait de vrai appel` : `n'a pas appelé depuis ${c.daysSinceLastCall} jours`;

            // L'alerte d'abord (elle écrit la fiche), la relance ensuite (elle relit la fiche).
            const already = meta.relance_alert as { health?: string; since?: string } | undefined;
            // Alerte d'avant le 23/11/2026, sans `since` : tenue pour celle de ce silence.
            const alerted = already?.health === c.health && (already.since ?? since) === since;
            if (!alerted) {
                const { error } = await db()
                    .from('projects')
                    .update({ project_metadata: { ...meta, relance_alert: { health: c.health, since, at: now.toISOString() } } })
                    .eq('id', project.id);
                if (!error) fresh.push({ name: c.name, why });
            }

            const auto = hour >= 10 && hour < 19 ? autoRelanceDue(c, meta) : null;
            if (auto) {
                const r = await relanceClient(c.id, { auto });
                if (!r.ok) {
                    // Rien n'est parti (numéro manquant…) : noté, pour ne pas réessayer toutes les heures.
                    const { data: again } = await db().from('projects').select('project_metadata').eq('id', project.id).maybeSingle();
                    await db()
                        .from('projects')
                        .update({ project_metadata: { ...((again?.project_metadata ?? {}) as Meta), auto_relance: { since: auto, at: now.toISOString(), failed: r.message } } })
                        .eq('id', project.id);
                }
                const said = r.ok ? `relance envoyée automatiquement ${r.message.replace(/^Relance envoyée /, '').replace(/\.$/, '')}` : `relance automatique impossible : ${r.message}`;
                const mine = fresh.find((f) => f.name === c.name && f.why === why);
                if (mine) mine.why = `${why} ; ${said}`;
                else fresh.push({ name: c.name, why: `${why} ; ${said}` });
            }
        }
        if (!fresh.length) return 0;
        await alertTeam({
            subject: fresh.length === 1 ? `Client à relancer : ${fresh[0].name}` : `${fresh.length} clients à relancer`,
            text: `${fresh.map((f) => `- ${f.name} ${f.why}.`).join('\n')}\n\nLe bouton « Relancer » est dans Clients : ${SITE.url}/admin/clients`,
            sms: fresh.length === 1 ? `${fresh[0].name} ${fresh[0].why}.` : `${fresh.length} clients à relancer : ${fresh.map((f) => f.name).join(', ')}.`,
        });
        return fresh.length;
    } catch (err) {
        console.error('[veille] alerte de relance impossible :', err instanceof Error ? err.message : String(err));
        return 0;
    }
}
