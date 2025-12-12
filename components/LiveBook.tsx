"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

            <div className="text-center space-y-4 border-b border-neutral-100 pb-8">
                <span className="text-xs uppercase tracking-widest text-amber-600 font-semibold">Live Book</span>
                <h2 className="text-3xl md:text-5xl font-serif text-black">{book.title || "Titre en cours de rédaction..."}</h2>
                <div className="inline-block px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs">
                    Style : {book.style || "Non défini"}
                </div>
            </div>

            <section className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-semibold">
                        📖
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-widest text-amber-700 font-semibold">Chapitre en cours</p>
                        <h3 className="text-2xl font-serif text-black">{currentChapter ? currentChapter.title : "En attente du premier chapitre"}</h3>
                    </div>
                </div>
                {currentChapter ? (
                    <div className="space-y-3 text-neutral-700">
                        <p className="text-sm text-neutral-500">Mis à jour le {formatDate(currentChapter.created_at)}</p>
                        <p className="leading-relaxed font-serif whitespace-pre-wrap">
                            {currentChapter.content.length > 320
                                ? `${currentChapter.content.slice(0, 320)}...`
                                : currentChapter.content}
                        </p>
                        <p className="text-sm text-neutral-600">Continuez vos entretiens pour enrichir ce chapitre.</p>
                    </div>
                ) : (
                    <p className="text-neutral-500">Vos chapitres apparaîtront ici dès que votre biographe aura commencé la rédaction.</p>
                )}
            </section>

            <section className="space-y-6">
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Votre Biographie</p>
                    <h3 className="text-3xl font-serif text-black">Tous vos chapitres</h3>
                    <p className="text-neutral-500">Retrouvez l'intégralité des chapitres rédigés à partir de vos échanges.</p>
                </div>

                <div className="space-y-12">
                    {chapters.length === 0 ? (
                        <div className="text-center py-12 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                            <p className="text-neutral-400 italic">Les premiers chapitres apparaîtront ici après vos entretiens...</p>
                        </div>
                    ) : (
                        chapters.map((chapter, index) => (
                            <div key={chapter.id} className="prose prose-lg max-w-none">
                                <h4 className="text-2xl font-serif text-black mb-6">
                                    Chapitre {index + 1} : {chapter.title}
                                </h4>
                                <div className="text-neutral-600 leading-relaxed font-serif whitespace-pre-wrap">
                                    {chapter.content}
                                </div>
                                <div className="w-full h-px bg-neutral-100 my-12 mx-auto max-w-xs"></div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
