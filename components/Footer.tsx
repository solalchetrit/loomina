import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-[var(--loomina-burgundy)] text-[var(--loomina-cream)] py-12">
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-center md:text-left">
                    <h3 className="text-2xl font-serif font-bold mb-2">Loomina</h3>
                    <p className="text-[var(--loomina-gold)] italic max-w-xs">
                        "Pour garder la lumière de chacun allumée."
                    </p>
                </div>

                <div className="flex gap-8 text-sm opacity-80">
                    <Link href="/mission" className="hover:text-[var(--loomina-gold)] transition-colors">
                        À propos
                    </Link>
                    <Link href="/offres" className="hover:text-[var(--loomina-gold)] transition-colors">
                        Nos Offres
                    </Link>
                    <Link href="/accompagnement" className="hover:text-[var(--loomina-gold)] transition-colors">
                        Accompagnement
                    </Link>
                </div>

                <div className="text-xs opacity-50">
                    © {new Date().getFullYear()} Loomina via Gemini.
                </div>
            </div>
        </footer>
    );
}
