import { NextRequest, NextResponse } from 'next/server';
import { currentAuthor } from '@/lib/loomina/author';
import { buildReadingPdf } from '@/lib/loomina/book-pdf';
import { loadPrintBook, pdfFileName } from '@/lib/loomina/book-print';
import { DEMO_DATA, demoEdition } from '@/lib/loomina/demo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * « Télécharger mon livre » : le livre composé, mis en page comme le livre
 * imprimé (A5, couverture en première page), avec les photos.
 */
export async function GET(request: NextRequest) {
    try {
        if (DEMO_DATA) {
            const { edition } = demoEdition();
            const pdf = await buildReadingPdf({ title: 'Les saisons de Jeanne', author: 'Jeanne', chapters: edition.chapters });
            return send(pdf.bytes, pdfFileName('Les saisons de Jeanne'));
        }
        const author = await currentAuthor(request);
        if (author instanceof NextResponse) return author;
        if (!author.project) return NextResponse.json({ error: 'Votre livre n’est pas encore composé.' }, { status: 404 });
        const loaded = await loadPrintBook(author.project.id);
        if (!loaded) return NextResponse.json({ error: 'Votre livre n’est pas encore composé.' }, { status: 404 });
        const pdf = await buildReadingPdf(loaded.book);
        return send(pdf.bytes, pdfFileName(loaded.book.title));
    } catch (err) {
        console.error('[user/book/pdf]', err);
        return NextResponse.json({ error: 'Le PDF n’a pas pu être préparé. Réessayez dans un instant.' }, { status: 500 });
    }
}

function send(bytes: Uint8Array, name: string) {
    return new NextResponse(Buffer.from(bytes), {
        headers: {
            'content-type': 'application/pdf',
            'content-disposition': `attachment; filename="${name}"`,
            'cache-control': 'private, no-store',
        },
    });
}
