import { PageHeader } from "@/components/ui/Section";
import ContactForm from "@/components/ContactForm";
import { LOOMINA_CONFIG } from "@/config/loomina";

const EMAIL = "contact@loomina.eu";

export default function ContactPage() {
  return (
    <main className="w-full min-h-[85svh]">
      <PageHeader
        eyebrow="Nous écrire"
        title="Une question ? Une personne vous répond."
        text="Un projet de livre, un cadeau à préparer, un doute avant de commander : écrivez-nous, c’est Solal, le fondateur, qui lit et répond."
      />

      <section className="w-full pb-24 md:pb-32">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <div className="rule-top pt-6 lg:sticky lg:top-28 lg:self-start">
            <p className="t-eyebrow">Par e-mail</p>
            <a href={`mailto:${EMAIL}`} className="link mt-2 inline-block font-serif text-[clamp(1.4rem,2.6vw,1.9rem)] leading-tight text-[var(--ink)]">
              {EMAIL}
            </a>
            <p className="t-body mt-2">Pour vos photos aussi : envoyez-les ici, en précisant le souvenir qu’elles illustrent.</p>

            <p className="t-eyebrow mt-10">Pour essayer Loomina</p>
            <a href={`tel:${LOOMINA_CONFIG.PHONE_NUMBER}`} className="link mt-2 inline-block font-serif text-[clamp(1.6rem,3vw,2.2rem)] leading-tight text-[var(--ink)]">
              {LOOMINA_CONFIG.PHONE_NUMBER_DISPLAY}
            </a>
            <p className="t-body mt-2">
              Ce numéro est celui de Loomina, l’intelligence artificielle qui mène les entretiens. Elle répond à toute heure,
              pour un essai de trois minutes ou pour vos appels après la commande. Ce n’est pas un service client.
            </p>
          </div>

          <ContactForm />
        </div>
      </section>
    </main>
  );
}
