/**
 * Ce que l'admin surveille tout seul, sans qu'on ouvre la page.
 *
 * Appelé par /api/jobs/process, que le serveur vocal réveille toutes les
 * 5 minutes :
 *  - l'avis de l'IA sur un livre qui vient d'être terminé, avant la relecture
 *    par l'équipe (demande de Solal, 17/11/2026) ;
 *  - l'alerte « client à relancer » : un client qui n'a pas appelé depuis trop
 *    longtemps est signalé une fois, par e-mail et par SMS.
 * Rien ici ne lève.
 */

import { db } from '@/lib/loomina/db';
import { readEditions } from '@/lib/loomina/book-edition';
import { beginReview, runReview, readReview } from '@/lib/loomina/book-review';
import { alertTeam } from '@/lib/loomina/notify';
import { getCrm } from '@/lib/admin/data';
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
 * Prévient l'équipe quand un client devient « à relancer » (pas de vrai appel
 * 3 jours après la commande) ou « inactif » (pas d'appel depuis 14 jours).
 * Une seule alerte par client et par état, entre 9 h et 20 h.
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
            const already = meta.relance_alert as { health?: string } | undefined;
            if (already?.health === c.health) continue;
            const { error } = await db()
                .from('projects')
                .update({ project_metadata: { ...meta, relance_alert: { health: c.health, at: now.toISOString() } } })
                .eq('id', project.id);
            if (error) continue;
            fresh.push({
                name: c.name,
                why: c.health === 'relancer' ? `a commandé il y a ${c.daysSinceOrder} jours et n'a pas encore fait de vrai appel` : `n'a pas appelé depuis ${c.daysSinceLastCall} jours`,
            });
        }
        if (!fresh.length) return 0;
        await alertTeam({
            subject: fresh.length === 1 ? `Client à relancer : ${fresh[0].name}` : `${fresh.length} clients à relancer`,
            text: `${fresh.map((f) => `- ${f.name} ${f.why}.`).join('\n')}\n\nLe bouton « Relancer » est dans Clients : ${SITE.url}/admin/clients`,
            sms: fresh.length === 1 ? `${fresh[0].name} ${fresh[0].why}. À relancer.` : `${fresh.length} clients à relancer : ${fresh.map((f) => f.name).join(', ')}.`,
        });
        return fresh.length;
    } catch (err) {
        console.error('[veille] alerte de relance impossible :', err instanceof Error ? err.message : String(err));
        return 0;
    }
}
