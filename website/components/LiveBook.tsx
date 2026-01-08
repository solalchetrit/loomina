"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import PhotoGallery from "@/components/PhotoGallery";
import { formatToE164 } from "@/lib/phone";

interface Story {
    id: number;
    title: string;
    content: string;
    created_at: string;
    type?: string;
}

interface Book {
    id: string; // Changed to string for UUID
    title: string;
    style: string;
}

interface LiveBookProps {
    userPhone: string; // Used to identify the client
}

export default function LiveBook({ userPhone }: LiveBookProps) {
    const [book, setBook] = useState<Book | null>(null);
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                // 1. Fetch Everything via Secure RPC
                const { data: rpcData, error: rpcError } = await supabase
                    .rpc('get_client_stories', { phone_input: userPhone });

                if (rpcError) throw rpcError;

                if (!rpcData || rpcData.length === 0) {
                    // Check if client exists at least? (Optional, but RPC returns empty if no client OR no book)
                    // For now we assume empty means no book/stories found.
                    console.log("LiveBook: No stories or book found via RPC.");
                    setBook(null);
                    setStories([]);
                    setLoading(false);
                    return;
                }

                // Map RPC result to local state
                // All rows have the same book info
                const firstRow = rpcData[0];
                const foundBook: Book = {
                    id: firstRow.book_id,
                    title: firstRow.book_title,
                    style: firstRow.book_style
                };

                // Map stories
                const foundStories: Story[] = rpcData.map((row: any) => ({
                    id: row.story_id,
                    title: row.story_title,
                    content: row.story_content,
                    created_at: row.story_date
                }));

                setBook(foundBook);
                setStories(foundStories);

            } catch (err: any) {
                console.error("Error fetching LiveBook:", err);
                setError(err.message || "Erreur de chargement.");
            } finally {
                setLoading(false);
            }
        }

        if (userPhone) {
            fetchData();
        }
    }, [userPhone]);

    if (loading) return <div className="text-center p-8 text-neutral-500 animate-pulse">Recherche de votre livre...</div>;
    if (error) return <div className="text-center p-8 text-red-500 bg-red-50 rounded-lg">{error}</div>;

    // REMOVED EARLY RETURN: if (!book) ...

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
                className="text-center space-y-4 border-b border-neutral-100 pb-8"
            >
                <div>
                    <span className="text-xs uppercase tracking-widest text-amber-600 font-semibold">Live Book</span>
                    <h2 className="text-3xl md:text-5xl font-serif text-black mt-2">{book?.title || "Titre en cours de rédaction..."}</h2>
                </div>

                <div className="inline-block px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs">
                    Style : {book?.style || "Non défini"}
                </div>
            </motion.div>

            {/* Section 1: Chapitre en Cours ONLY */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 space-y-4 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-semibold text-lg">
                        📖
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-widest text-amber-700 font-semibold">Dernier Récit</p>
                        <h3 className="text-2xl font-serif text-black">{currentStory ? currentStory.title : "En attente du premier récit"}</h3>
                    </div>
                </div>
                {currentStory ? (
                    <div className="space-y-4 text-neutral-700">
                        <p className="text-sm text-neutral-500 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Dernière mise à jour le {formatDate(currentStory.created_at)}
                        </p>
                        <div className="p-6 bg-white rounded-xl border border-neutral-100 italic text-neutral-600 leading-relaxed font-serif relative">
                            <span className="absolute top-2 left-2 text-4xl text-neutral-200 font-serif leading-none">“</span>
                            <p className="relative z-10 whitespace-pre-wrap">
                                {currentStory.content.length > 320
                                    ? `${currentStory.content.slice(0, 320)}...`
                                    : currentStory.content}
                            </p>
                        </div>
                        <p className="text-sm text-neutral-600">Continuez vos entretiens pour enrichir votre livre, récit après récit.</p>
                    </div>
                ) : (
                    <div className="p-6 bg-white rounded-xl border border-dashed border-neutral-300 text-center space-y-2">
                        <p className="text-neutral-500">Vos récits apparaîtront ici dès que votre biographe aura commencé la rédaction.</p>
                        <p className="text-xs text-neutral-400">Pensez à planifier votre premier entretien !</p>
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
                    <section className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 space-y-6 opacity-60 grayscale cursor-not-allowed">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-lg">
                                📷
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-widest text-indigo-700 font-semibold">Galerie Photos</p>
                                <h3 className="text-2xl font-serif text-black">Vos souvenirs en images</h3>
                            </div>
                        </div>
                        <p className="text-neutral-500 italic">La galerie sera disponible une fois votre livre initialisé.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="aspect-square rounded-xl bg-neutral-200 animate-pulse"></div>
                            ))}
                        </div>
                    </section>
                )}
            </motion.div>

        </div>
    );
}
