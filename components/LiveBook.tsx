"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import PhotoGallery from "@/components/PhotoGallery";

interface Story {
    id: number;
    title: string;
    content: string;
    created_at: string;
    type?: string;
}

interface Book {
    id: string;
    title: string;
    style: string;
}

interface LiveBookProps {
    // userPhone is no longer needed directly

}

export default function LiveBook({ }: LiveBookProps) {
    const [book, setBook] = useState<Book | null>(null);
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                // Secure: Fetch via API Proxy (Cookie Auth)
                const response = await fetch("/api/user/stories");
                if (!response.ok) {
                    if (response.status === 401) throw new Error("Veuillez vous reconnecter.");
                    throw new Error("Erreur de chargement.");
                }

                const rpcData = await response.json();

                if (!rpcData || rpcData.length === 0) {
                    console.log("LiveBook: No stories or book found via API.");
                    setBook(null);
                    setStories([]);
                    setLoading(false);
                    return;
                }

                const firstRow = rpcData[0];
                const foundBook: Book = {
                    id: firstRow.book_id,
                    title: firstRow.book_title,
                    style: firstRow.book_style
                };

                const foundStories: Story[] = rpcData
                    .filter((row: { story_id: number | null }) => row.story_id !== null)
                    .map((row: { story_id: number; story_title: string; story_content: string; story_date: string }) => ({
                        id: row.story_id,
                        title: row.story_title,
                        content: row.story_content,
                        created_at: row.story_date
                    }));

                setBook(foundBook);
                setStories(foundStories);

            } catch (err: unknown) {
                console.error("Error fetching LiveBook:", err);
                setError(err instanceof Error ? err.message : "Erreur de chargement.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="text-center p-8">
                <div className="inline-flex items-center gap-3 text-[var(--text-secondary)]">
                    <div className="w-5 h-5 border-2 border-[var(--loomina-gold)] border-t-transparent rounded-full animate-spin" />
                    Recherche de votre livre...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8 text-red-400 bg-red-500/10 rounded-2xl border border-red-500/20">
                {error}
            </div>
        );
    }

    const currentStory = stories.length > 0 ? stories[stories.length - 1] : null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-12">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-4 pb-8 relative"
            >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[var(--loomina-mist)] to-transparent" />
                <div>
                    <span className="text-xs uppercase tracking-[0.3em] text-[var(--loomina-gold)] font-semibold">Live Book</span>
                    <h2 className="text-3xl md:text-5xl font-serif text-[var(--text-primary)] mt-2">{book?.title || "Titre en cours de rédaction..."}</h2>
                </div>

                <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--loomina-mist)]/20 border border-[var(--loomina-mist)] text-[var(--text-secondary)] text-xs">
                    Style : {book?.style || "Non défini"}
                </div>
            </motion.div>

            {/* Section 1: Chapitre en Cours */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="glass rounded-2xl p-8 space-y-4"
            >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[var(--loomina-gold)]/10 border border-[var(--loomina-gold)]/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[var(--loomina-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[var(--loomina-gold)] font-semibold">Dernier Récit</p>
                        <h3 className="text-2xl font-serif text-[var(--text-primary)]">{currentStory ? currentStory.title : "En attente du premier récit"}</h3>
                    </div>
                </div>
                {currentStory ? (
                    <div className="space-y-4">
                        <p className="text-sm text-[var(--text-muted)] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Dernière mise à jour le {formatDate(currentStory.created_at)}
                        </p>
                        <div className="p-6 bg-[var(--loomina-mist)]/20 rounded-xl border border-[var(--loomina-mist)] italic text-[var(--text-secondary)] leading-relaxed font-serif relative">
                            <span className="absolute top-2 left-4 text-5xl text-[var(--loomina-gold)]/20 font-serif leading-none">&quot;</span>
                            <p className="relative z-10 whitespace-pre-wrap pl-6">
                                {currentStory.content.length > 320
                                    ? `${currentStory.content.slice(0, 320)}...`
                                    : currentStory.content}
                            </p>
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">Continuez vos entretiens pour enrichir votre livre, récit après récit.</p>
                    </div>
                ) : (
                    <div className="p-6 bg-[var(--loomina-mist)]/20 rounded-xl border border-dashed border-[var(--loomina-mist)]/50 text-center space-y-2">
                        <p className="text-[var(--text-secondary)]">Vos récits apparaîtront ici dès que votre biographe aura commencé la rédaction.</p>
                        <p className="text-xs text-[var(--text-muted)]">Pensez à planifier votre premier entretien !</p>
                    </div>
                )}
            </motion.section>

            {/* Section 2: Photo Gallery */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                {book ? (
                    <PhotoGallery bookId={book.id} />
                ) : (
                    <section className="glass rounded-2xl p-8 space-y-6 opacity-60 cursor-not-allowed">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[var(--loomina-aurora)]/10 border border-[var(--loomina-aurora)]/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-[var(--loomina-aurora)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-[var(--loomina-aurora)] font-semibold">Galerie Photos</p>
                                <h3 className="text-2xl font-serif text-[var(--text-primary)]">Vos souvenirs en images</h3>
                            </div>
                        </div>
                        <p className="text-[var(--text-muted)] italic">La galerie sera disponible une fois votre livre initialisé.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="aspect-square rounded-xl bg-white/5 animate-pulse" />
                            ))}
                        </div>
                    </section>
                )}
            </motion.div>

        </div>
    );
}
