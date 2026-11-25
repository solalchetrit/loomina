/**
 * Les contacts collectés (e-mail et téléphone), triés en trois groupes
 * (demande de Solal, 25/11/2026) :
 *  - Clients : les auteurs qui écrivent leur livre (compte avec un livre payé) ;
 *  - Proches : ceux qui ont offert un livre, et les proches ajoutés à l'espace famille ;
 *  - Visiteurs : ceux qui ont essayé la démo ou écrit par le formulaire, sans être client.
 *
 * Une personne n'apparaît qu'une fois, dans le groupe le plus proche de
 * Loomina (client, puis proche, puis visiteur), rapprochée par téléphone ou
 * par e-mail. Les livres de test sont écartés. « Désinscrit » = a cliqué le
 * lien en bas de nos e-mails (lib/loomina/optout.ts).
 */
import { db } from '../loomina/db';
import { isTestMeta } from '../loomina/test-flag';
import { readFamilyMembers, readGiver } from '../loomina/giver';
import { optOutToken } from '../loomina/optout';

export type ContactGroup = 'client' | 'proche' | 'visiteur';

export interface Contact {
    group: ContactGroup;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    /** D'où vient le contact, en clair : « Livre de Jeanne », « Démo du 19/11 », « Formulaire »… */
    source: string;
    /** Première trace, ISO. */
    since: string;
    optedOut: boolean;
}

export const GROUP_LABELS: Record<ContactGroup, string> = { client: 'Clients', proche: 'Proches', visiteur: 'Visiteurs' };

const RANK: Record<ContactGroup, number> = { client: 0, proche: 1, visiteur: 2 };
const lower = (e: unknown) => (typeof e === 'string' && e.includes('@') ? e.trim().toLowerCase() : null);
const phoneOf = (p: unknown) => (typeof p === 'string' && /^\+\d{8,15}$/.test(p.trim()) ? p.trim() : null);
const day = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric', timeZone: 'Europe/Paris' });

export async function listContacts(): Promise<Contact[]> {
    const supabase = db();
    const [projects, profiles, demos, messages, optouts] = await Promise.all([
        supabase.from('projects').select('id, user_id, project_metadata, created_at'),
        supabase.from('profiles').select('id, first_name, last_name, email, phone_number, created_at'),
        supabase.from('demo_stories').select('phone, email, first_name, created_at').order('created_at', { ascending: true }),
        supabase.from('contact_messages').select('name, email, created_at').order('created_at', { ascending: true }),
        supabase.from('email_optouts').select('email_hash'),
    ]);
    for (const r of [projects, profiles, demos, messages, optouts]) if (r.error) throw new Error(r.error.message);
    const hashes = new Set((optouts.data ?? []).map((o) => o.email_hash as string));
    const profileById = new Map((profiles.data ?? []).map((p) => [p.id as string, p]));

    const out: Contact[] = [];
    const byPhone = new Map<string, Contact>();
    const byEmail = new Map<string, Contact>();
    /** Ajoute, ou complète la fiche déjà là (et la fait monter de groupe si besoin). */
    const add = (c: Omit<Contact, 'optedOut'>) => {
        const phone = phoneOf(c.phone);
        const email = lower(c.email);
        if (!phone && !email) return;
        const known = (phone && byPhone.get(phone)) || (email && byEmail.get(email)) || null;
        if (known) {
            if (RANK[c.group] < RANK[known.group]) {
                known.group = c.group;
                known.source = c.source;
            }
            known.phone ??= phone;
            known.email ??= email;
            known.firstName ??= c.firstName;
            known.lastName ??= c.lastName;
            if (c.since < known.since) known.since = c.since;
            if (phone) byPhone.set(phone, known);
            if (email) byEmail.set(email, known);
            return;
        }
        const row: Contact = { ...c, phone, email, optedOut: false };
        out.push(row);
        if (phone) byPhone.set(phone, row);
        if (email) byEmail.set(email, row);
    };

    // 1. Clients et proches, à partir des livres (hors livres de test).
    for (const pr of projects.data ?? []) {
        const meta = (pr.project_metadata ?? {}) as Record<string, unknown>;
        if (isTestMeta(meta)) continue;
        const author = profileById.get(pr.user_id as string);
        const name = (author?.first_name as string | null) ?? 'l’auteur';
        const gift = meta.is_gift === true;
        if (author) {
            add({
                group: 'client',
                firstName: (author.first_name as string | null) ?? null,
                lastName: (author.last_name as string | null) ?? null,
                // Livre offert : l'adresse du compte est celle de la personne qui a offert.
                email: gift ? null : (author.email as string | null),
                phone: author.phone_number as string | null,
                source: gift ? 'Auteur (livre offert)' : 'Auteur',
                since: pr.created_at as string,
            });
        }
        const giver = readGiver(meta);
        if (gift || giver) {
            add({ group: 'proche', firstName: giver?.firstName ?? null, lastName: null, email: gift ? (meta.buyer_email as string | null) : null, phone: giver?.phone ?? null, source: `A offert le livre de ${name}`, since: pr.created_at as string });
        }
        for (const m of readFamilyMembers(meta)) {
            add({ group: 'proche', firstName: m.firstName, lastName: null, email: null, phone: m.phone, source: `Proche de ${name}`, since: m.addedAt ?? (pr.created_at as string) });
        }
    }
    // 2. Visiteurs : démos et formulaire de contact.
    for (const d of demos.data ?? []) {
        add({ group: 'visiteur', firstName: (d.first_name as string | null) ?? null, lastName: null, email: d.email as string | null, phone: d.phone as string | null, source: `Démo du ${day(d.created_at as string)}`, since: d.created_at as string });
    }
    for (const m of messages.data ?? []) {
        add({ group: 'visiteur', firstName: (m.name as string | null) ?? null, lastName: null, email: m.email as string | null, phone: null, source: `Formulaire du ${day(m.created_at as string)}`, since: m.created_at as string });
    }

    for (const c of out) c.optedOut = !!c.email && hashes.has(optOutToken(c.email) ?? '');
    return out.sort((a, b) => RANK[a.group] - RANK[b.group] || b.since.localeCompare(a.since));
}

/** Les contacts en CSV (séparateur « ; », lu tel quel par Excel en français). */
export function contactsCsv(rows: Contact[]): string {
    const cell = (v: string | null | boolean) => {
        const s = v === true ? 'oui' : v === false ? 'non' : (v ?? '');
        return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const head = ['Groupe', 'Prénom', 'Nom', 'E-mail', 'Téléphone', 'Origine', 'Depuis', 'Désinscrit'];
    const lines = rows.map((c) => [GROUP_LABELS[c.group], c.firstName, c.lastName, c.email, c.phone, c.source, c.since.slice(0, 10), c.optedOut].map(cell).join(';'));
    return '﻿' + [head.join(';'), ...lines].join('\n');
}
