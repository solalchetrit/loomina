import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin/auth';

/**
 * Enveloppe commune aux actions de l'admin : vérifie le cookie, exécute,
 * puis revient sur la page d'où l'on vient avec le résultat à afficher.
 */
export async function adminAction(request: NextRequest, back: string, run: (form: FormData) => Promise<{ ok: boolean; message: string }>): Promise<NextResponse> {
    if (!(await isAdmin())) return NextResponse.redirect(new URL('/admin/connexion', request.url), 303);
    let result: { ok: boolean; message: string };
    try {
        result = await run(await request.formData());
    } catch (err) {
        console.error('[admin] action en échec :', err);
        result = { ok: false, message: err instanceof Error ? err.message : 'Erreur inattendue.' };
    }
    const url = new URL(back, request.url);
    url.searchParams.set(result.ok ? 'fait' : 'erreur', result.message.slice(0, 300));
    return NextResponse.redirect(url, 303);
}
