import Link from "next/link";
import { Section, PageHeader } from "@/components/ui/Section";
import Accordion from "@/components/ui/Accordion";
import CtaBand from "@/components/CtaBand";

const FAQ_CATEGORIES = [
  {
    id: "service",
    category: "Le service",
    questions: [
      { q: "Comment fonctionne Loomina ?", a: "Vous racontez votre histoire lors d’appels téléphoniques. Notre IA transforme vos paroles en texte littéraire, vous validez chaque chapitre, puis nous imprimons et livrons votre livre." },
      { q: "Combien de temps dure le processus complet ?", a: "En moyenne 14 semaines, mais nous nous adaptons à votre rythme : certains avancent en 8 à 10 semaines, d’autres prennent jusqu’à 6 mois. Il n’y a aucune pression." },
      { q: "Combien d’appels sont nécessaires ?", a: "Nous recommandons 14 appels thématiques, un par chapitre, mais c’est flexible. Les appels sont illimités : plus de temps sur un sujet, moins sur un autre." },
      { q: "Quelle est la durée d’un appel ?", a: "Entre 30 minutes et 1 heure en moyenne. Certains chapitres sont plus courts, d’autres plus longs. Vous décidez quand un sujet est terminé." },
    ],
  },
  {
    id: "livre",
    category: "Le livre",
    questions: [
      { q: "Combien de pages fait le livre final ?", a: "Entre 150 et 250 pages en moyenne. Nous nous adaptons à la richesse de votre récit, sans minimum ni maximum." },
      { q: "Puis-je ajouter des photos ?", a: "Oui. Envoyez-nous vos photos au format numérique, nous les intégrons au livre et vous aidons à choisir les meilleurs emplacements." },
      { q: "Quel est le format du livre ?", a: "Format 15 × 23 cm (proche du roman), couverture rigide personnalisée, papier ivoire 90 g, reliure cousue. Un objet conçu pour durer." },
      { q: "Puis-je relire et modifier le texte ?", a: "Oui, c’est même la règle : vous validez chaque chapitre avant de passer au suivant. Les modifications sont illimitées." },
      { q: "Recevrai-je une version numérique ?", a: "Oui, un ebook (PDF et EPUB) en plus du livre physique, idéal pour partager avec la famille, même à distance." },
    ],
  },
  {
    id: "tarifs",
    category: "Tarifs & paiement",
    questions: [
      { q: "Quel est le prix exact ?", a: "219 € tout compris : appels, rédaction, corrections, photos, mise en page, impression, version numérique et livraison. Aucun frais caché." },
      { q: "Y a-t-il des frais supplémentaires ?", a: "Non. Le prix couvre l’intégralité du service, du premier appel à la livraison." },
      { q: "Puis-je payer en plusieurs fois ?", a: "Pour l’instant, le paiement se fait en une fois par carte bancaire via Stripe. Le paiement en plusieurs fois arrive bientôt." },
      { q: "Y a-t-il une garantie ?", a: "Oui. Si après le premier appel vous n’êtes pas satisfait, nous vous remboursons intégralement, sans question." },
    ],
  },
  {
    id: "confidentialite",
    category: "Confidentialité & sécurité",
    questions: [
      { q: "Mes données sont-elles sécurisées ?", a: "Vos enregistrements et textes sont chiffrés (AES-256), stockés sur des serveurs en Europe (RGPD) et jamais partagés avec des tiers. Vous pouvez demander leur suppression à tout moment." },
      { q: "Qui a accès à mon histoire ?", a: "Uniquement vous et notre équipe, pour la rédaction et la mise en page, sous accord de confidentialité strict." },
      { q: "Que deviennent mes données après la livraison ?", a: "Nous les conservons 1 an après livraison, pour d’éventuelles modifications ou réimpressions. Passé ce délai, elles sont supprimées, sauf demande contraire." },
    ],
  },
  {
    id: "cadeau",
    category: "Cadeau & livraison",
    questions: [
      { q: "Puis-je offrir Loomina en cadeau ?", a: "Oui. Après commande, vous recevez un bon cadeau élégant à imprimer. La personne nous contacte ensuite pour démarrer son livre." },
      { q: "Combien de temps pour la livraison ?", a: "Une fois le livre validé, comptez 2 à 3 semaines pour l’impression et la livraison en France métropolitaine, via Colissimo avec suivi." },
      { q: "Livrez-vous à l’international ?", a: "En France métropolitaine et en Europe (frais de port selon le pays). Contactez-nous pour les autres destinations." },
      { q: "Puis-je commander plusieurs exemplaires ?", a: "Oui, après réception, à tarif réduit. Idéal pour offrir à toute la famille." },
    ],
  },
  {
    id: "technique",
    category: "Technique",
    questions: [
      { q: "Ai-je besoin d’un ordinateur ou d’un smartphone ?", a: "Non. Tout se passe par téléphone : nous vous appelons aux horaires convenus. Pour les photos, un e-mail suffit, et nous pouvons vous aider." },
      { q: "Que se passe-t-il si je rate un appel ?", a: "Aucun problème : nous reprogrammons simplement, sans pénalité ni frais." },
      { q: "L’IA remplace-t-elle un vrai biographe ?", a: "L’IA transforme vos paroles en texte, mais c’est vous qui racontez, et des rédacteurs humains relisent chaque chapitre. Le meilleur des deux mondes." },
    ],
  },
];

export default function FAQPage() {
  return (
    <main className="w-full">
      <PageHeader
        eyebrow="FAQ"
        title="Questions"
        accent="fréquentes."
        text={
          <>
            Toutes les réponses sur Loomina. Vous ne trouvez pas la vôtre ?{" "}
            <Link href="/contact" className="text-[var(--ink)] underline decoration-[var(--loomina-gold)]/50 underline-offset-4">
              Écrivez-nous
            </Link>
            .
          </>
        }
      />

      <Section size="sm">
        <div className="grid gap-12 lg:grid-cols-[260px_1fr] lg:gap-16">
          {/* Sommaire */}
          <nav aria-label="Thèmes" className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">Thèmes</p>
            <ol className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:gap-0 lg:divide-y lg:divide-[var(--hairline)]">
              {FAQ_CATEGORIES.map((c) => (
                <li key={c.id}>
                  <a
                    href={`#${c.id}`}
                    className="press inline-flex items-center rounded-full bg-[var(--paper)] px-4 py-2 font-sans text-[14px] font-medium text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--hairline)] hover:text-[var(--gold-ink)] lg:w-full lg:rounded-none lg:bg-transparent lg:px-0 lg:py-3 lg:shadow-none"
                  >
                    {c.category}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Questions */}
          <div className="space-y-16">
            {FAQ_CATEGORIES.map((c) => (
              <section key={c.id} id={c.id} className="scroll-mt-28">
                <h2 className="reveal font-serif text-[30px] leading-tight tracking-[-0.02em] text-[var(--ink)] md:text-[34px]">{c.category}</h2>
                <Accordion items={c.questions} className="reveal mt-6" />
              </section>
            ))}
          </div>
        </div>
      </Section>

      <div className="pt-8">
        <CtaBand title="D’autres" accent="questions ?" text="Notre équipe est là pour vous répondre et vous accompagner." primary={{ href: "/contact", label: "Nous contacter" }} secondary={{ href: "/offre", label: "Découvrir l’offre" }} />
      </div>
    </main>
  );
}
