import LoominaFAQ from "@/components/LoominaFAQ";

export default function Page() {
    return (
        <div className="min-h-screen bg-white pt-24 pb-12">
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl font-serif text-[var(--loomina-black)]">Foire aux Questions</h1>
                <p className="text-neutral-500 max-w-2xl mx-auto px-4">
                    Tout ce que vous devez savoir pour commencer votre livre autobiographique.
                </p>
            </div>
            {/* Intégration du composant existant */}
            <LoominaFAQ />
        </div>
    );
}
