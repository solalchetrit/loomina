import { NextRequest } from 'next/server';
import { adminAction } from '@/lib/admin/action-route';
import { createPromo, parsePromoForm, stopPromo } from '@/lib/admin/promo';

export const runtime = 'nodejs';

/** Créer ou couper un code promo depuis l'admin (page /admin/codes). */
export async function POST(request: NextRequest) {
    return adminAction(request, '/admin/codes', async (form) => {
        const stop = String(form.get('couper') ?? '');
        if (stop) {
            const code = await stopPromo(stop);
            return { ok: true, message: `Le code ${code} est coupé : plus personne ne peut s’en servir.` };
        }
        const input = parsePromoForm(form);
        if (typeof input === 'string') return { ok: false, message: input };
        const code = await createPromo(input);
        return { ok: true, message: `Code créé : ${code}` };
    });
}
