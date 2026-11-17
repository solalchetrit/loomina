import { NextRequest } from 'next/server';
import { adminAction } from '@/lib/admin/action-route';
import { editablePrompts } from '@/lib/admin/prompts';
import { missingFromEdit, savePrompt, resetPrompt } from '@/lib/loomina/prompt-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Enregistrer un prompt réécrit dans l'admin, ou revenir au texte d'origine. */
export async function POST(request: NextRequest) {
    return adminAction(request, '/admin/ia', async (form) => {
        const key = String(form.get('key') ?? '');
        const prompt = editablePrompts().find((p) => p.key === key);
        if (!prompt) return { ok: false, message: 'Prompt inconnu.' };

        if (form.get('action') === 'origine') {
            await resetPrompt(key);
            return { ok: true, message: `« ${prompt.title} » : retour au texte d’origine.` };
        }

        const content = String(form.get('content') ?? '').replace(/\r\n/g, '\n').trim();
        if (content.length < 40) return { ok: false, message: 'Texte trop court : rien n’a été changé.' };
        if (content.length > 40_000) return { ok: false, message: 'Texte trop long (40 000 caractères au plus) : rien n’a été changé.' };
        if (content === prompt.original.trim()) {
            await resetPrompt(key);
            return { ok: true, message: `« ${prompt.title} » : identique au texte d’origine.` };
        }
        // Garde-fou : une variable ou un marqueur technique oublié casserait les appels.
        const missing = missingFromEdit(prompt.original, content);
        if (missing.length) return { ok: false, message: `Refusé, rien n’a été changé. Il manque dans votre texte : ${missing.join(', ')}.` };

        await savePrompt(key, content);
        return { ok: true, message: `« ${prompt.title} » enregistré. Pris en compte dans la minute.` };
    });
}
