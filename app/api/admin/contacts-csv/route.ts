import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin/auth';
import { contactsCsv, listContacts } from '@/lib/admin/contacts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Les contacts triés (clients, proches, visiteurs), en CSV pour Excel. Admin seulement. */
export async function GET() {
    if (!(await isAdmin())) return new NextResponse('Non autorisé', { status: 401 });
    const csv = contactsCsv(await listContacts());
    const day = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, {
        headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="contacts-loomina-${day}.csv"`, 'Cache-Control': 'no-store' },
    });
}
