import { NextRequest } from 'next/server';
import { adminAction } from '@/lib/admin/action-route';
import { db } from '@/lib/loomina/db';
import { readFulfillment, nextTeamStep, previousTeamStep, parseTracking, STEP_KEY, STAGE_ADMIN, type TeamStep } from '@/lib/loomina/fulfillment';
import { readShipping } from '@/lib/loomina/shipping';
import { notifyBookStage, type AnnouncedStep } from '@/lib/loomina/notify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACK: Record<string, (id: string) => string> = {
    livre: (id) => `/admin/clients/${id}/livre`,
    fiche: (id) => `/admin/clients/${id}`,
    livres: () => '/admin/livres',
};

/**
 * Fait avancer le livre d'une étape (relu → à l'impression → expédié → reçu),
 * ou annule la dernière. Une étape franchie pour la première fois est
 * annoncée au client (et à la personne qui l'a offert) ; refaire une étape
 * annulée ne renvoie pas de message.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const back = (BACK[request.nextUrl.searchParams.get('retour') ?? ''] ?? BACK.livre)(id);
    return adminAction(request, back, async (form) => {
        // Le livre terminé le plus récent (un client qui recommande a un second livre en attente).
        const { data: projects, error } = await db()
            .from('projects')
            .select('id, status, project_metadata')
            .eq('user_id', id)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(1);
        if (error) return { ok: false, message: `Lecture impossible : ${error.message}` };
        const project = projects?.[0];
        if (!project) return { ok: false, message: 'Ce client n’a pas de livre terminé.' };
        const meta = (project.project_metadata ?? {}) as Record<string, unknown>;
        const f = readFulfillment(project.status as string, meta);

        if (form.get('annuler') === '1') {
            const last = previousTeamStep(f.stage);
            if (!last) return { ok: false, message: 'Rien à annuler.' };
            const next: Record<string, unknown> = { ...meta, [STEP_KEY[last]]: null };
            if (last === 'shipped') next.tracking = null;
            const { error: e } = await db().from('projects').update({ project_metadata: next }).eq('id', project.id);
            if (e) return { ok: false, message: `Enregistrement impossible : ${e.message}` };
            return { ok: true, message: `Étape « ${STAGE_ADMIN[last].label} » annulée. Le client n’a rien reçu de plus.` };
        }

        const step = nextTeamStep(f.stage);
        const asked = String(form.get('etape') ?? '') as TeamStep;
        if (!step) return { ok: false, message: 'Ce livre est déjà arrivé chez le client.' };
        // Deux clics, ou une page restée ouverte : on ne saute pas d'étape.
        if (asked && asked !== step) return { ok: false, message: 'La page n’était plus à jour : rechargée, vérifiez l’étape.' };
        if (step === 'printing' && !readShipping(meta)) {
            return { ok: false, message: 'L’auteur n’a pas encore donné l’adresse d’envoi. Relancez-le avant l’impression.' };
        }
        const tracking = step === 'shipped' ? parseTracking(form.get('suivi'), form.get('lien')) : null;

        const notified = Array.isArray(meta.fulfillment_notified) ? (meta.fulfillment_notified as string[]) : [];
        const announce = step !== 'delivered' && !notified.includes(step);
        const next: Record<string, unknown> = {
            ...meta,
            [STEP_KEY[step]]: new Date().toISOString(),
            ...(step === 'shipped' ? { tracking } : {}),
            ...(announce ? { fulfillment_notified: [...notified, step] } : {}),
        };
        const { error: e } = await db().from('projects').update({ project_metadata: next }).eq('id', project.id);
        if (e) return { ok: false, message: `Enregistrement impossible : ${e.message}` };

        if (announce) {
            const { data: profile } = await db().from('profiles').select('first_name, politeness_preference, phone_number, email').eq('id', id).maybeSingle();
            if (profile) {
                await notifyBookStage({ step: step as AnnouncedStep, author: profile, projectMetadata: meta, tracking });
            }
        }
        const label = STAGE_ADMIN[step].label;
        return { ok: true, message: announce ? `Livre passé à « ${label} ». Le client est prévenu par SMS et par e-mail.` : `Livre passé à « ${label} ».` };
    });
}
