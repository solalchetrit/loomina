"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

interface Chapter {
    id: number;
    title: string;
    content: string;
    created_at: string;
}

interface Book {
    id: number;
    title: string;
    style: string;
}

interface LiveBookProps {
    userPhone: string; // Used to identify the client
}

export default function LiveBook({ userPhone }: LiveBookProps) {
    const [book, setBook] = useState<Book | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                // 1. Find Client by Phone
                const { data: client, error: clientError } = await supabase
                    .from('Client')
                    .select('id, name')
                    .eq('phone_number', userPhone)
                    .single();

                if (clientError || !client) {
                    throw new Error("Client introuvable pour ce numéro.");
                }

                // 2. Find Book by Client ID
                const { data: bookData, error: bookError } = await supabase
                    .from('Books')
                    .select('id, title, style')
                    .eq('client_id', client.id)
                    .single();

                if (bookError || !bookData) {
                    // It's possible the client exists but no book allows specific error handling
                    console.log("No book found yet for client.");
                    setLoading(false);
                    return;
                }

                setBook(bookData);

                // 3. Fetch Chapters
                const { data: chaptersData, error: chaptersError } = await supabase
                    .from('Chapters')
                    .select('*')
                    .eq('book_id', bookData.id)
                    .order('created_at', { ascending: true });

                if (chaptersError) throw chaptersError;

                setChapters(chaptersData || []);

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
    if (!book) return <div className="text-center p-8 text-neutral-500">Aucun livre en cours pour le moment. L'interview n'a peut-être pas encore commencé.</div>;

    const currentChapter = chapters[chapters.length - 1];

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
                <span className="text-xs uppercase tracking-widest text-amber-600 font-semibold">Live Book</span>
                <h2 className="text-3xl md:text-5xl font-serif text-black">{book.title || "Titre en cours de rédaction..."}</h2>
                <div className="inline-block px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs">
                    Style : {book.style || "Non défini"}
                </div>
            </motion.div>

            {/* Section 1: Chapitre en Cours */}
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
                        <p className="text-xs uppercase tracking-widest text-amber-700 font-semibold">Chapitre en cours</p>
                        <h3 className="text-2xl font-serif text-black">{currentChapter ? currentChapter.title : "En attente du premier chapitre"}</h3>
                    </div>
                </div>
                {currentChapter ? (
                    <div className="space-y-4 text-neutral-700">
                        <p className="text-sm text-neutral-500 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Dernière mise à jour le {formatDate(currentChapter.created_at)}
                        </p>
                        <div className="p-6 bg-white rounded-xl border border-neutral-100 italic text-neutral-600 leading-relaxed font-serif relative">
                            <span className="absolute top-2 left-2 text-4xl text-neutral-200 font-serif leading-none">“</span>
                            <p className="relative z-10 whitespace-pre-wrap">
                                {currentChapter.content.length > 320
                                    ? `${currentChapter.content.slice(0, 320)}...`
                                    : currentChapter.content}
                            </p>
                        </div>
                        <p className="text-sm text-neutral-600">Continuez vos entretiens pour enrichir ce chapitre et avancer dans votre histoire.</p>
                    </div>
                ) : (
                    <div className="p-6 bg-white rounded-xl border border-dashed border-neutral-300 text-center space-y-2">
                        <p className="text-neutral-500">Vos chapitres apparaîtront ici dès que votre biographe aura commencé la rédaction.</p>
                        <p className="text-xs text-neutral-400">Pensez à planifier votre premier entretien !</p>
                    </div>
                )}
            </motion.section>

            {/* Section 2: Votre Biographie */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
            >
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Votre Biographie</p>
                    <h3 className="text-3xl font-serif text-black">Tous vos chapitres</h3>
                    <p className="text-neutral-500">Retrouvez l'intégralité des chapitres déjà rédigés.</p>
                </div>

                <div className="space-y-12">
                    {chapters.length === 0 ? (
                        <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 flex flex-col items-center justify-center gap-4">
                            <div className="text-4xl opacity-20">📚</div>
                            <p className="text-neutral-400 italic">Votre livre est encore vide. L'histoire commence bientôt.</p>
                        </div>
                    ) : (
                        chapters.map((chapter, index) => (
                            <motion.div
                                key={chapter.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="prose prose-lg max-w-none group"
                            >
                                <div className="flex items-baseline gap-4 mb-6">
                                    <span className="text-6xl font-serif text-neutral-200 font-bold group-hover:text-amber-100 transition-colors duration-300">{index + 1}</span>
                                    <h4 className="text-2xl font-serif text-black m-0">
                                        {chapter.title}
                                    </h4>
                                </div>
                                <div className="text-neutral-600 leading-relaxed font-serif whitespace-pre-wrap pl-4 md:pl-16 border-l-2 border-transparent group-hover:border-amber-200 transition-all duration-300">
                                    {chapter.content}
                                </div>
                                <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent my-12 mx-auto max-w-sm"></div>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.section>
        </div>
    );
}
