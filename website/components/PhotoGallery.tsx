"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
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
        <section className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-lg">
                        📷
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-widest text-indigo-700 font-semibold">Galerie Photos</p>
                        <h3 className="text-2xl font-serif text-black">Vos souvenirs en images</h3>
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
                        className="text-sm px-4 py-2"
                    >
                        {uploading ? "Envoi..." : "+ Ajouter une photo"}
                    </MagicButton>
                </div>
            </div>

            <p className="text-neutral-600">Ajoutez des photos pour illustrer vos chapitres et enrichir votre biographie.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.length === 0 ? (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-neutral-200 rounded-xl text-neutral-400">
                        <span className="text-2xl block mb-2">🖼️</span>
                        Aucune photo pour le moment
                    </div>
                ) : (
                    photos.map((photo) => (
                        <motion.div
                            key={photo.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative aspect-square rounded-xl overflow-hidden shadow-sm group bg-white"
                        >
                            <img
                                src={photo.image_url}
                                alt="Souvenir"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </motion.div>
                    ))
                )}
            </div>
        </section>
    );
}
