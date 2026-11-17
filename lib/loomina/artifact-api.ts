/**
 * Copie du site sur l'hébergeur Claude (ARTIFACT=1) : il n'y a pas de serveur,
 * donc les appels /api/* de l'espace auteur sont servis ici, dans le navigateur,
 * avec le livre d'exemple de Jeanne (lib/loomina/demo.ts). L'espace auteur
 * s'ouvre directement, sans SMS. Ce fichier n'est chargé que dans cette copie.
 *
 * Si la page porte un instantané d'un vrai auteur (window.__LOOMINA_SNAPSHOT__,
 * glissé par scripts/artifact/assembler.py), c'est lui qui est servi à la
 * place de Jeanne. Les modifications faites sur la page restent dans la page.
 */
import { demoAddPerson, demoAddQuestion, demoEdition, demoOverview, demoPlan, demoSavePrefs, demoStories, personTopic } from './demo';

type Body = Record<string, unknown>;

/** Photos envoyées pendant la visite : gardées dans la page, perdues au rechargement. */
const photos: { id: string; caption: string | null; question: string; chapter: string | null; url: string }[] = [];

function dataUrl(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(r.error);
        r.readAsDataURL(file);
    });
}

async function addPhoto(init?: RequestInit): Promise<Response> {
    const form = init?.body instanceof FormData ? init.body : null;
    const file = form?.get('photo');
    if (!(file instanceof Blob)) return reply({ error: 'Aucune photo reçue.' }, 400);
    const text = (k: string) => (typeof form?.get(k) === 'string' ? (form!.get(k) as string).trim() || null : null);
    photos.push({
        id: String(photos.length + 1),
        caption: text('caption'),
        chapter: text('chapter'),
        question: 'Qui est sur cette photo, et où a-t-elle été prise ?',
        url: await dataUrl(file),
    });
    return reply({ photos });
}

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

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type Snapshot = { overview: Json; stories: Json[]; book: Json; 'book-plan'?: Json; photos?: Json };

/** Le rangement par périodes, tiré des parties du livre composé de l'instantané. */
function snapshotPlan(snap: Snapshot) {
    const partOf = new Map<number, string>();
    for (const c of snap.book?.edition?.chapters ?? []) for (const n of c.sources ?? []) if (!partOf.has(n)) partOf.set(n, c.part);
    const parts: { title: string; chapters: number[] }[] = [];
    for (const s of snap.stories) {
        const title = partOf.get(s.story_id) ?? 'Vos récits';
        const part = parts.find((p) => p.title === title);
        if (part) part.chapters.push(s.story_id);
        else parts.push({ title, chapters: [s.story_id] });
    }
    return { parts, chapter_count: snap.stories.length, at: new Date().toISOString() };
}

function answerSnapshot(snap: Snapshot, path: string, method: string, init?: RequestInit): Promise<Response> | null {
    const project = snap.overview.project ?? {};
    if (path === '/api/user/overview') return reply(snap.overview);
    if (path === '/api/user/stories') return reply(snap.stories);
    if (path === '/api/user/book') return method === 'POST' ? reply({ error: 'La composition se fait sur le site en ligne.' }, 409) : reply(snap.book);
    if (path === '/api/user/book-plan') return method === 'POST' ? reply({ plan: snapshotPlan(snap) }) : reply(snap['book-plan'] ?? { plan: null });
    if (path === '/api/user/photos') return method === 'POST' ? addPhoto(init) : reply({ photos: [...(snap.photos?.photos ?? []), ...photos] });
    if (path === '/api/user/preferences') {
        snap.overview.prefs = { ...snap.overview.prefs, ...bodyOf(init) };
        return reply({ saved: true });
    }
    if (path === '/api/user/questions') {
        const q = String(bodyOf(init).question ?? '').trim().slice(0, 280);
        if (q.length < 5) return reply({ error: 'Question trop courte' }, 400);
        project.openQuestions = [...(project.openQuestions ?? []), q];
        return reply({ openQuestions: project.openQuestions });
    }
    if (path === '/api/user/people') {
        const b = bodyOf(init);
        const name = String(b.name ?? '').trim().slice(0, 60);
        const relation = String(b.relation ?? '').trim().slice(0, 80);
        if (name.length < 2 || relation.length < 2) return reply({ error: 'Indiquez un prénom et qui est cette personne pour vous.' }, 400);
        project.family = [{ name, relation }, ...(project.family ?? [])];
        project.openQuestions = [...(project.openQuestions ?? []), personTopic(name, relation)];
        return reply({ family: project.family, openQuestions: project.openQuestions });
    }
    return null;
}

function answer(path: string, method: string, init?: RequestInit): Promise<Response> | null {
    const snap = (window as unknown as { __LOOMINA_SNAPSHOT__?: Snapshot }).__LOOMINA_SNAPSHOT__;
    if (snap && path.startsWith('/api/user/')) {
        const res = answerSnapshot(snap, path, method, init);
        if (res) return res;
    }
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
    if (path === '/api/user/book-plan') return method === 'POST' ? reply({ plan: demoPlan() }) : reply({ plan: null });
    if (path === '/api/user/photos') return method === 'POST' ? addPhoto(init) : reply({ photos });
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
