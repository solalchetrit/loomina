import LoominaFAQ from "@/components/LoominaFAQ";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "FAQ - Questions fréquentes sur Loomina",
    description: "Comment fonctionne la biographie par téléphone ? Combien de temps cela prend-il ? Réponses à toutes vos questions.",
};

const faqList = [
    {
        question: "Qu'est-ce que Loomina ?",
        answer:
            "Loomina est un service de biographie hybride. Nous utilisons Loomina pour capturer votre histoire de vive voix et la transformer en un livre physique haut de gamme et un jumeau mémoriel interactif.",
    },
    {
        question: "Comment se déroulent les entretiens ?",
        answer:
            "Il n'y a aucune limite de temps. Les échanges avec Loomina durent aussi longtemps que vous le souhaitez. Vous pouvez réaliser autant de sessions que nécessaire, à votre propre rythme, pour raconter toute votre histoire.",
    },
    {
        question: "Quel est le prix ?",
        answer:
            "Une seule offre Loomina : 219€ en lancement. Elle inclut les interviews guidés, la rédaction, la maquette, 5 exemplaires imprimés et la version numérique sécurisée.",
    },
    {
        question: "Qui relit et corrige les textes ?",
        answer:
            "Chaque transcription est vérifiée par un éditeur Loomina : cohérence des faits fournis, reformulation douce, suppression des hésitations pour préserver la voix originale.",
    },
    {
        question: "Mes données sont-elles privées ?",
        answer:
            "Absolument. Vos souvenirs sont cryptés et stockés dans un coffre-fort numérique sécurisé. Vous seul décidez avec qui les partager.",
    },
    {
        question: "Combien d'exemplaires puis-je commander ?",
        answer:
            "Autant que nécessaire : nous imprimons à la demande et fournissons systématiquement une version numérique et audio pour partager facilement.",
    },
    {
        question: "Et si mon proche n'est pas à l'aise avec la technologie ?",
        answer:
            "C'est justement la force de Loomina : il n'y a aucune application à installer ni interface à maîtriser. Il suffit de composer un numéro de téléphone ordinaire. Loomina décroche, écoute et se charge de tout rédiger.",
    },
    {
        question: "Sous combien de temps recevrai-je le livre ?",
        answer: "Après votre validation de la maquette finale, l'impression et l'envoi prennent en moyenne trois jours ouvrés.",
    },
];

export default function Page() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqList.map(item => ({
            '@type': 'Question',
            'name': item.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': item.answer
            }
        }))
    };

    return (
        <div className="min-h-screen bg-white pt-24 pb-12">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
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
