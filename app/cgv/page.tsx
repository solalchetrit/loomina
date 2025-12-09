export default function Page() {
    return (
        <div className="min-h-screen bg-white text-[var(--loomina-black)] pt-24 pb-16 px-6 font-[family-name:var(--font-sans)]">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-serif mb-2 text-center">Conditions Générales de Vente</h1>
                <p className="text-sm text-neutral-500 text-center mb-12">Dernière mise à jour : Décembre 2025</p>

                <div className="space-y-8 leading-relaxed text-justify text-neutral-800">
                    <section>
                        <h2 className="text-xl font-bold mb-3 text-[var(--loomina-black)]">1. Objet</h2>
                        <p>
                            Les présentes conditions régissent les ventes par la société Loomina de services de création de livres autobiographiques assistés par IA. Le service comprend des entretiens téléphoniques, la transcription, la rédaction, la mise en page et l'impression d'ouvrages personnalisés.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-[var(--loomina-black)]">2. Prix</h2>
                        <p>
                            Le service est proposé au tarif de lancement de 222€ TTC. Loomina se réserve le droit de modifier ses prix à tout moment, mais le produit sera facturé sur la base du tarif en vigueur au moment de la validation de la commande.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-[var(--loomina-black)]">3. Livraison</h2>
                        <p>
                            Après la validation définitive de la maquette numérique par le Client, l'impression et l'expédition sont effectuées sous un délai moyen de 3 jours ouvrés. Les délais de livraison peuvent varier selon le transporteur.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-[var(--loomina-black)]">4. Droit de rétractation</h2>
                        <p>
                            Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les contrats de fourniture de biens confectionnés selon les spécifications du consommateur ou nettement personnalisés. Le livre Loomina étant un ouvrage unique réalisé sur mesure, aucune annulation ni remboursement ne pourra être effectué une fois le processus de rédaction entamé.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-[var(--loomina-black)]">5. Validation</h2>
                        <p>
                            Le Client est tenu de vérifier attentivement la maquette numérique avant de donner son "Bon à Tirer" (BAT). Loomina ne pourra être tenue responsable des erreurs non corrigées par le Client avant la validation pour impression.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
