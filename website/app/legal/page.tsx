export default function Page() {
    return (
        <div className="min-h-screen bg-white text-[var(--loomina-black)] pt-24 pb-16 px-6 font-[family-name:var(--font-sans)]">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-serif mb-12 text-center">Mentions Légales</h1>

                <div className="space-y-8 leading-relaxed text-justify text-neutral-800">
                    <section>
                        <h2 className="text-xl font-bold mb-3 text-[var(--loomina-black)]">1. Éditeur du site</h2>
                        <p>
                            Le site Loomina est édité par la société <strong>SAS Loomina</strong>.<br />
                            Capital social : 1 000 €<br />
                            Siège social : 10 Rue de la Paix, 75002 Paris, France.<br />
                            Immatriculée au RCS de Paris sous le numéro : 123 456 789 (SIRET : 123 456 789 00012).<br />
                            Numéro de TVA Intracommunautaire : FR 12 123456789.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-[var(--loomina-black)]">2. Contact</h2>
                        <p>
                            Email : contact@loomina.fr<br />
                            Téléphone : +33 1 59 16 93 57
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-[var(--loomina-black)]">3. Hébergement</h2>
                        <p>
                            Le site est hébergé par la société <strong>Vercel Inc.</strong><br />
                            Adresse : 340 S Lemon Ave #4133 Walnut, CA 91789, USA.<br />
                            Site web : https://vercel.com
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-3 text-[var(--loomina-black)]">4. Propriété intellectuelle</h2>
                        <p>
                            L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
