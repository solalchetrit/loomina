/**
 * Copie du site sur l'hébergeur Claude (ARTIFACT=1) : il n'y a pas de serveur,
 * donc les appels /api/* de l'espace auteur sont servis ici, dans le navigateur,
 * avec le livre d'exemple de Jeanne (lib/loomina/demo.ts). L'espace auteur
 * s'ouvre directement, sans SMS. Ce fichier n'est chargé que dans cette copie.
 */
import { demoAddPerson, demoAddQuestion, demoEdition, demoOverview, demoSavePrefs, demoStories } from './demo';

type Body = Record<string, unknown>;

function reply(data: unknown, status = 200) {
    return Promise.resolve(new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }));
}

function bodyOf(init?: RequestInit): Body {
    try {
        return typeof init?.body === 'string' ? (JSON.parse(init.body) as Body) : {};
    } catch {
        return {};
    }
}

function answer(path: string, method: string, init?: RequestInit): Promise<Response> | null {
    if (path === '/api/auth/dev') return reply({ phone: '+33600000000' });
    if (path === '/api/auth/logout') return reply({ ok: true });
    if (path === '/api/auth/verify') return reply({ message: 'Connexion par SMS indisponible dans cette copie.' }, 501);
    if (path === '/api/user/overview') return reply(demoOverview());
    if (path === '/api/user/stories') return reply(demoStories());
    if (path === '/api/user/preferences') {
        demoSavePrefs(bodyOf(init));
        return reply({ saved: true });
    }
    if (path === '/api/user/questions') {
        const q = String(bodyOf(init).question ?? '').trim();
        if (!q) return reply({ error: 'Question trop courte' }, 400);
        return reply({ openQuestions: demoAddQuestion(q.slice(0, 280)) });
    }
    if (path === '/api/user/people') {
        const b = bodyOf(init);
        const name = String(b.name ?? '').trim().slice(0, 60);
        const relation = String(b.relation ?? '').trim().slice(0, 80);
        if (name.length < 2 || relation.length < 2) return reply({ error: 'Indiquez un prénom et qui est cette personne pour vous.' }, 400);
        return reply(demoAddPerson(name, relation));
    }
    if (path === '/api/user/book') {
        return method === 'POST' ? reply({ error: 'La composition n’est pas disponible en démonstration.' }, 409) : reply(demoEdition());
    }
    if (path === '/api/user/book-plan') return method === 'POST' ? reply({ error: 'Indisponible en démonstration.' }, 409) : reply({ plan: null });
    if (path === '/api/user/photos') return method === 'POST' ? reply({ error: 'Indisponible en démonstration.' }, 501) : reply({ photos: [] });
    if (/^\/api\/user\/chapters\/\d+\/correction$/.test(path)) return reply({ content: String(bodyOf(init).content ?? ''), demo: true });
    if (/^\/api\/user\/chapters\/\d+$/.test(path)) return reply({ saved: true, demo: true });
    if (path.startsWith('/api/famille/')) return reply({ error: 'Aucun livre offert' }, 404);
    return null;
}

if (typeof window !== 'undefined') {
    const realFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
        const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        const url = new URL(raw, window.location.href);
        const at = url.pathname.indexOf('/api/');
        if (url.origin === window.location.origin && at !== -1) {
            const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
            const res = answer(url.pathname.slice(at), method, init);
            if (res) return res;
        }
        return realFetch(input, init);
    };
}
