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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "Qu'est-ce que Loomina ?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Loomina est un service de biographie hybride. Nous utilisons Loomina pour capturer votre histoire de vive voix et la transformer en un livre physique haut de gamme et un jumeau mémoriel interactif."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Comment se déroulent les entretiens ?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Il n'y a aucune limite de temps. Les échanges avec Loomina durent aussi longtemps que vous le souhaitez. Vous pouvez réaliser autant de sessions que nécessaire, à votre propre rythme, pour raconter toute votre histoire."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Quel est le prix ?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Une seule offre Loomina : 219€ en lancement. Elle inclut les interviews guidés, la rédaction, la maquette, 5 exemplaires imprimés et la version numérique sécurisée."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Qui relit et corrige les textes ?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Chaque transcription est vérifiée par un éditeur Loomina : cohérence des faits fournis, reformulation douce, suppression des hésitations pour préserver la voix originale."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Mes données sont-elles privées ?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Absolument. Vos souvenirs sont cryptés et stockés dans un coffre-fort numérique sécurisé. Vous seul décidez avec qui les partager."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Combien d'exemplaires puis-je commander ?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Autant que nécessaire : nous imprimons à la demande et fournissons systématiquement une version numérique et audio pour partager facilement."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Et si mon proche n'est pas à l'aise avec la technologie ?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "C'est justement la force de Loomina : il n'y a aucune application à installer ni interface à maîtriser. Il suffit de composer un numéro de téléphone ordinaire. Loomina décroche, écoute et se charge de tout rédiger."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Sous combien de temps recevrai-je le livre ?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Après votre validation de la maquette finale, l'impression et l'envoi prennent en moyenne trois jours ouvrés."
                                }
                            }
                        ]
                    })
                }}
            />
        </div>
    );
}
