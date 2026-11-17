import { requireAdmin } from "@/lib/admin/auth";
import { aiCatalog } from "@/lib/admin/prompts";
import { Panel, Fold, PageHeader } from "@/components/admin/ui";
import AIcon, { type AdminIconName } from "@/components/admin/icons";

export const metadata = { title: "Structure et IA" };

const AI_ICONS: Record<string, AdminIconName> = { voix: "phone", demo: "gift", directeur: "route", ecrivain: "pen", editeur: "book", periodes: "layers", photos: "spark", secours: "alert" };

const SERVICES = [
  { name: "Site (Vercel)", what: "Les pages, la commande, l’espace auteur et famille, et tout le traitement après un appel (Directeur, Écrivain, livre). Code : app/, lib/.", where: "www.loomina.eu" },
  { name: "Serveur vocal (Render)", what: "Le cerveau des appels en direct, les rendez-vous d’appel et le rattrapage. Toujours allumé. Code : voice/.", where: "loomina-voice.onrender.com" },
  { name: "Twilio", what: "Le numéro de téléphone, la transcription (Deepgram) et la voix (ElevenLabs) pendant l’appel, les SMS (code de connexion, récit prêt).", where: "console.twilio.com" },
  { name: "OpenAI", what: "Tous les modèles : la voix pendant l’appel, puis le Directeur, l’Écrivain, l’Éditeur du livre, les photos.", where: "platform.openai.com" },
  { name: "Supabase (loomina-v2)", what: "La base de données (clients, livres, appels, récits) et le stockage privé des photos.", where: "supabase.com" },
  { name: "Stripe", what: "Le paiement. Prévient le site quand un paiement réussit, ce qui crée le compte et le livre.", where: "dashboard.stripe.com" },
];

const TABLES = [
  ["profiles", "Le narrateur : prénom, nom, téléphone (la clé pour le reconnaître), e-mail, tu/vous, style, sujets à éviter."],
  ["projects", "Le livre : phase (1 à 4), avancement, mémoire du livre (context), question du prochain appel, réglages de l’espace auteur et infos de commande (project_metadata)."],
  ["call_events", "Chaque rapport de fin d’appel, brut, tel que reçu : file d’attente, anti-doublon et archive rejouable."],
  ["interviews", "Un appel : transcript, durée, phase, résumé et analyse complète du Directeur."],
  ["chapters", "Les récits d’appel écrits par l’Écrivain, un par appel, avec leurs versions corrigées."],
  ["book_editions", "Le livre composé à partir des récits : plan et chapitres, une ligne par composition."],
  ["family_members", "Les proches cités pendant les appels."],
  ["system_prompts", "Ne sert plus qu’à la première phrase des appels suivants, par phase. Le prompt vocal est dans le code."],
  ["contact_messages", "Les messages du formulaire de contact."],
  ["stockage « photos »", "Les photos envoyées depuis l’espace auteur (privé, liens d’une heure)."],
];

const TIMERS = [
  ["Chaque minute", "Serveur vocal", "Appelle les narrateurs dont c’est l’heure de rendez-vous. Renvoie les rapports d’appel restés en attente."],
  ["Toutes les 5 minutes", "Serveur vocal", "Demande au site de retraiter les appels dont l’analyse ou l’écriture a échoué."],
  ["Chaque nuit à 3 h", "Site (cron Vercel)", "Même rattrapage, au cas où le serveur vocal serait arrêté."],
  ["Après chaque récit", "Site", "Recompose le livre (plan puis chapitres, par étapes)."],
];

function Diagram() {
  const box = (x: number, y: number, w: number, h: number, title: string, sub: string, tone: string) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={16} fill={tone} stroke="#d6d4cc" />
      <text x={x + w / 2} y={y + h / 2 - 4} textAnchor="middle" fontSize={17} fontWeight={800} fill="#161616">{title}</text>
      <text x={x + w / 2} y={y + h / 2 + 18} textAnchor="middle" fontSize={13} fill="#4a4a45">{sub}</text>
    </g>
  );
  const label = (x: number, y: number, t: string) => (
    <g>
      <rect x={x - t.length * 3.6 - 8} y={y - 13} width={t.length * 7.2 + 16} height={22} rx={11} fill="#ffffff" stroke="#e7e6e1" />
      <text x={x} y={y + 2} textAnchor="middle" fontSize={12.5} fill="#2b2b28">{t}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 1000 640" role="img" aria-label="Schéma des services de Loomina" className="h-auto w-full min-w-[600px]">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#66665f" />
        </marker>
      </defs>
      <g stroke="#66665f" strokeWidth={1.6} fill="none" markerEnd="url(#arr)">
        <path d="M160 92 V178" markerStart="url(#arr)" />
        <path d="M160 272 V358" markerStart="url(#arr)" />
        <path d="M840 92 V178" markerStart="url(#arr)" />
        <path d="M840 272 V358" markerStart="url(#arr)" />
        <path d="M292 405 H368" markerStart="url(#arr)" />
        <path d="M760 272 L585 358" markerStart="url(#arr)" />
        <path d="M292 372 C 470 330, 560 300, 708 250" />
        <path d="M708 214 H292" />
        <path d="M160 452 C 160 560, 250 575, 368 575" markerStart="url(#arr)" />
        <path d="M972 225 H990 V575 H632" markerStart="url(#arr)" />
      </g>
      {box(30, 20, 260, 72, "Le narrateur", "son téléphone", "#e6eefb")}
      {box(710, 20, 260, 72, "Le client sur le site", "navigateur", "#e6eefb")}
      {box(30, 180, 260, 92, "Twilio", "numéro · oreille · voix · SMS", "#fde8ea")}
      {box(710, 180, 260, 92, "Site (Vercel)", "pages · API · traitement", "#f2f1ec")}
      {box(30, 360, 260, 92, "Serveur vocal", "Render · appels en direct", "#fcebd2")}
      {box(370, 360, 260, 92, "OpenAI", "toutes les IA", "#e3f3f1")}
      {box(710, 360, 260, 92, "Stripe", "paiement", "#ece9fe")}
      {box(370, 530, 260, 92, "Supabase", "base de données · photos", "#e3f0e5")}
      {label(160, 136, "la voix")}
      {label(160, 316, "le texte, en direct")}
      {label(840, 136, "pages, espace auteur")}
      {label(840, 316, "paiement réussi")}
      {label(330, 430, "répliques")}
      {label(690, 330, "Directeur, Écrivain, livre")}
      {label(520, 300, "rapport de fin d’appel")}
      {label(500, 214, "SMS : code, récit prêt")}
      {label(220, 560, "profil, livre, rendez-vous")}
      {label(810, 590, "tout le reste")}
    </svg>
  );
}

export default async function AdminStructure() {
  await requireAdmin();
  const ais = aiCatalog();

  return (
    <div className="grid grid-cols-1 gap-8">
      <PageHeader eyebrow="Structure et IA" title="Comment Loomina fonctionne">
        Qui parle à qui, et les prompts exacts de chaque IA. Les prompts sont lus directement dans le code : ce que vous voyez ici est ce qui tourne en ligne.
      </PageHeader>

      <Panel icon="globe" title="Qui parle à qui">
        <div className="overflow-x-auto"><Diagram /></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.name} className="rounded-[16px] border border-[var(--line)] bg-[#fcfbf8] p-4">
              <p className="font-bold">{s.name}</p>
              <p className="mt-1 text-[15px] text-[var(--ink-2)]">{s.what}</p>
              <p className="mt-1 font-mono text-[12px] text-[var(--ink-3)]">{s.where}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel icon="spark" title={`Les ${ais.length} IA de Loomina`}>
        <div className="mb-5 flex flex-wrap gap-2">
          {ais.map((ai) => (
            <a key={ai.key} href={`#${ai.key}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-[14px] font-semibold hover:border-[var(--ink)]"><AIcon name={AI_ICONS[ai.key] ?? "spark"} size={14} />{ai.name}</a>
          ))}
        </div>
        <div className="grid gap-4">
          {ais.map((ai) => (
            <article key={ai.key} id={ai.key} className="scroll-mt-24 rounded-[20px] border border-[var(--line)] bg-[#fcfbf8] p-4 sm:p-6">
              <div className="flex flex-wrap items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[var(--ink)] text-[var(--amber)]"><AIcon name={AI_ICONS[ai.key] ?? "spark"} size={20} /></span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[20px] font-extrabold tracking-[-0.015em]">{ai.name}</h3>
                  <p className="mt-1 max-w-[75ch] text-[15.5px] leading-relaxed text-[var(--ink-2)]">{ai.role}</p>
                </div>
              </div>
              <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                {([["Modèle", ai.model], ["Où", ai.where], ["Quand", ai.when], ["Lit", ai.reads], ["Écrit", ai.writes]] as const).map(([k, v]) => (
                  <div key={k} className="rounded-[12px] bg-white px-3.5 py-2.5 text-[14.5px] shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">
                    <dt className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">{k}</dt>
                    <dd className="mt-0.5 leading-relaxed">{v}</dd>
                  </div>
                ))}
                <div className="rounded-[12px] bg-white px-3.5 py-2.5 text-[14.5px] shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">
                  <dt className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--ink-3)]">Code</dt>
                  <dd className="mt-0.5 font-mono text-[12.5px] [overflow-wrap:anywhere]">{ai.file}</dd>
                </div>
              </dl>
              <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.1em] text-[var(--ink-3)]">{ai.prompts.length > 1 ? `${ai.prompts.length} prompts` : "Prompt"}</p>
              <div className="mt-2 grid gap-2">
                {ai.prompts.map((p) => (
                  <Fold key={p.title} summary={p.title} meta={`${Math.round(p.text.length / 100) / 10} k car.`} mono>{p.text}</Fold>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel icon="database" title="Ce que contient la base">
          <ul className="grid gap-2 text-[15px]">
            {TABLES.map(([t, d]) => (
              <li key={t}><span className="font-mono text-[13px] font-semibold">{t}</span> <span className="text-[var(--ink-2)]">· {d}</span></li>
            ))}
          </ul>
        </Panel>
        <Panel icon="clock" title="Ce qui tourne tout seul">
          <ul className="grid gap-2 text-[15px]">
            {TIMERS.map(([when, who, what]) => (
              <li key={when}><b>{when}</b> <span className="text-[var(--ink-3)]">({who})</span> · <span className="text-[var(--ink-2)]">{what}</span></li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
