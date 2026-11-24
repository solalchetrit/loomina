import { NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { adminAction } from '@/lib/admin/action-route';
import { FIGURES_TAG } from '@/lib/admin/cached';

export const runtime = 'nodejs';

/**
 * Le bouton « Actualiser » de l'admin : oublie les chiffres gardés (Stripe,
 * Twilio, OpenAI, Google, serveur vocal) pour les relire tout de suite.
 */
export async function POST(request: NextRequest) {
    const form = await request.clone().formData().catch(() => null);
    const asked = String(form?.get('retour') ?? '');
    // On ne revient que sur une page de l'admin.
    const back = /^\/admin(\/[\w\-/]*)?$/.test(asked) ? asked : '/admin';
    return adminAction(request, back, async () => {
        revalidateTag(FIGURES_TAG, { expire: 0 });
        return { ok: true, message: 'Chiffres relus à l’instant chez Stripe, Twilio, OpenAI et Google.' };
    });
}
