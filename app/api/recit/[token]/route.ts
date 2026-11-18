import { NextRequest, NextResponse } from 'next/server';
import { getDemoStory, isExpired, emailDemoStory, EMAIL_RE } from '@/lib/loomina/demo-story';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Envoie le récit d'une démonstration, en PDF, à l'adresse donnée sur /recit/<token>. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const body = (await request.json().catch(() => ({}))) as { email?: unknown };
    const email = typeof body.email === 'string' ? body.email.trim().slice(0, 200) : '';
    if (!EMAIL_RE.test(email)) return NextResponse.json({ message: 'Cette adresse e-mail semble incomplète.' }, { status: 400 });

    const story = await getDemoStory(token).catch(() => null);
    if (!story || story.status !== 'written' || !story.content || isExpired(story.created_at)) {
        return NextResponse.json({ message: 'Ce lien n’est plus valable.' }, { status: 404 });
    }
    const outcome = await emailDemoStory(story, email);
    if (outcome === 'limit') return NextResponse.json({ message: 'Ce récit a déjà été envoyé plusieurs fois. Écrivez-nous à contact@loomina.eu.' }, { status: 429 });
    if (outcome === 'failed') return NextResponse.json({ message: 'L’envoi n’a pas abouti. Réessayez dans un instant.' }, { status: 502 });
    return NextResponse.json({ sent: true });
}
