export default function Page() {
    return (
        <div className="min-h-screen bg-white text-[var(--loomina-black)] pt-24 pb-16 px-6 font-[family-name:var(--font-sans)]">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-serif mb-12 text-center">Politique de Confidentialité</h1>

                <div className="space-y-8 leading-relaxed text-justify text-neutral-800">
                    <section>
                        <h2 className="text-xl font-bold mb-3 text-[var(--loomina-black)]">1. Données collectées</h2>
                        <p>
                            Dans le cadre de la création de votre livre autobiographique, Loomina collecte et traite les données suivantes :
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Enregistrements vocaux des entretiens.</li>
                                <li>Transcriptions textuelles de ces entretiens.</li>
                                <li>Photographies personnelles fournies pour l'illustration de l'ouvrage.</li>
                                <li>Coordonnées (nom, adresse, email, téléphone) pour la livraison et la facturation.</li>
                            </ul>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-[var(--loomina-black)]">2. Utilisation des données et IA</h2>
                        <p>
                            Vos données personnelles et souvenirs ne sont utilisés <strong>que dans l'unique but de créer votre livre</strong>. Loomina garantit que vos enregistrements vocaux ne sont pas utilisés pour entraîner des modèles d'intelligence artificielle publics. L'IA est utilisée comme un outil d'assistance à la transcription et à la rédaction, sous supervision humaine.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-[var(--loomina-black)]">3. Sécurité</h2>
                        <p>
                            Loomina attache une importance capitale à la sécurité de vos mémoires. Toutes les données (audio, texte, images) sont stockées dans un coffre-fort numérique sécurisé et crypté. L'accès est strictement limité au personnel chargé de la production de votre ouvrage.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-[var(--loomina-black)]">4. Vos droits</h2>
                        <p>
                            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez à tout moment demander la suppression définitive de vos souvenirs numériques de nos serveurs une fois le livre livré, en nous contactant à contact@loomina.eu.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
