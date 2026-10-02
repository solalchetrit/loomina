"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import MagicButton from "@/components/ui/MagicButton";

interface Photo {
    id: number;
    image_url: string;
    created_at: string;
}

interface PhotoGalleryProps {
    bookId: string;
}

export default function PhotoGallery({ bookId }: PhotoGalleryProps) {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch initial photos
    useEffect(() => {
        async function fetchPhotos() {
            try {
                const { data, error } = await supabase
                    .from('BookPhotos')
                    .select('*')
                    .eq('book_id', bookId)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setPhotos(data || []);
            } catch (err) {
                console.error("Error fetching photos:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchPhotos();
    }, [bookId]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${bookId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            setUploading(true);

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('book-photos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('book-photos')
                .getPublicUrl(filePath);

            // 3. Insert record into BookPhotos table
            const { data: newPhoto, error: dbError } = await supabase
                .from('BookPhotos')
                .insert([
                    { book_id: bookId, image_url: publicUrl }
                ])
                .select()
                .single();

            if (dbError) throw dbError;

            // 4. Update UI
            setPhotos(prev => [newPhoto, ...prev]);

        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Erreur lors du téléchargement de l\'image.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    if (loading) return null;

    return (
        <section className="card rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--loomina-night)] text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--hairline)]">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                        </svg>
                    </div>
                    <div>
                        <p className="eyebrow">Galerie photos</p>
                        <h3 className="text-2xl font-serif text-[var(--ink)]">Vos souvenirs en images</h3>
                    </div>
                </div>

                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <MagicButton
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        variant="secondary"
                        size="sm"
                    >
                        {uploading ? "Envoi…" : "Ajouter une photo"}
                    </MagicButton>
                </div>
            </div>

            <p className="font-sans text-[15px] text-[var(--text-secondary)]">Ajoutez des photos pour illustrer vos chapitres et enrichir votre biographie.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.length === 0 ? (
                    <div className="col-span-full rounded-2xl border border-dashed border-[var(--hairline-strong)] py-12 text-center font-sans text-[14px] text-[var(--text-muted)]">
                        Aucune photo pour le moment
                    </div>
                ) : (
                    photos.map((photo) => (
                        <div
                            key={photo.id}
                            className="rise relative aspect-square overflow-hidden rounded-2xl bg-[var(--loomina-night)] shadow-[inset_0_0_0_1px_var(--hairline)]"
                        >
                            <img
                                src={photo.image_url}
                                alt="Souvenir"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
