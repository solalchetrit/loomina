"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import MagicButton from "@/components/ui/MagicButton";

interface PhotoUploadProps {
    bookId: number;
    currentCoverUrl?: string | null;
    onUploadComplete: (url: string) => void;
}

export default function PhotoUpload({ bookId, currentCoverUrl, onUploadComplete }: PhotoUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentCoverUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${bookId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        try {
            setUploading(true);

            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('book-covers')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('book-covers')
                .getPublicUrl(filePath);

            // 3. Update Book record
            const { error: dbError } = await supabase
                .from('Books')
                .update({ cover_image_url: publicUrl })
                .eq('id', bookId);

            if (dbError) {
                throw dbError;
            }

            onUploadComplete(publicUrl);

        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Erreur lors du téléchargement de l\'image.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-48 h-64 bg-neutral-100 rounded-lg overflow-hidden shadow-inner flex items-center justify-center border-2 border-dashed border-neutral-300 group">
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt="Couverture du livre"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="text-neutral-400 text-center p-4">
                        <span className="text-2xl block mb-2">📷</span>
                        <span className="text-xs">Aucune photo</span>
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-medium">
                        Chargement...
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-sm text-neutral-600 hover:text-black underline underline-offset-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {previewUrl ? "Changer la photo" : "Ajouter une photo"}
            </button>
        </div>
    );
}
