import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin/auth';
import { db } from '@/lib/loomina/db';
import { buildPrintPdfs, buildReadingPdf } from '@/lib/loomina/book-pdf';
import { loadPrintBook, pdfFileName } from '@/lib/loomina/book-print';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * Les fichiers pour l'imprimeur, depuis l'admin (page « Relire le livre ») :
 *   ?part=interieur   l'intérieur, A5 avec 3 mm de fonds perdus
 *   ?part=couverture  la couverture à plat (4e, dos, 1re), fonds perdus
 *   ?part=lecture     la version à lire, celle que télécharge l'auteur
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await isAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const { id } = await params;
    const part = request.nextUrl.searchParams.get('part') ?? 'interieur';
    try {
        const { data: projects } = await db().from('projects').select('id').eq('user_id', id).order('created_at', { ascending: false }).limit(1);
        const projectId = projects?.[0]?.id as string | undefined;
        if (!projectId) return NextResponse.json({ error: 'Ce client n’a pas de livre.' }, { status: 404 });
        // Photos comprises même pour la couverture : elles comptent dans le nombre de pages, donc dans l'épaisseur du dos.
        const loaded = await loadPrintBook(projectId);
        if (!loaded) return NextResponse.json({ error: 'Le livre n’est pas encore composé.' }, { status: 404 });
        const { book } = loaded;
        if (part === 'lecture') {
            const pdf = await buildReadingPdf(book);
            return send(pdf.bytes, pdfFileName(book.title));
        }
        const pdfs = await buildPrintPdfs(book);
        if (part === 'couverture') return send(pdfs.cover, pdfFileName(book.title, `couverture-dos-${String(pdfs.spineMm).replace('.', '-')}mm`), pdfs.pages);
        return send(pdfs.interior, pdfFileName(book.title, `interieur-${pdfs.pages}p`), pdfs.pages);
    } catch (err) {
        console.error('[admin/livre-pdf]', err);
        return NextResponse.json({ error: err instanceof Error ? err.message : 'PDF impossible' }, { status: 500 });
    }
}

function send(bytes: Uint8Array, name: string, pages?: number) {
    return new NextResponse(Buffer.from(bytes), {
        headers: {
            'content-type': 'application/pdf',
            'content-disposition': `attachment; filename="${name}"`,
            'cache-control': 'private, no-store',
            ...(pages ? { 'x-loomina-pages': String(pages) } : {}),
        },
    });
}
