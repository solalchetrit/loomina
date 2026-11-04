import { PageHeader } from "@/components/ui/Section";
import ContactForm from "@/components/ContactForm";
import Icon from "@/components/ui/Icon";
import { SITE } from "@/config/site";

const EMAIL = "contact@loomina.eu";

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Une question ? Une personne vous répond"
        text="Un projet de livre, un cadeau à préparer, un doute avant de commander : écrivez-nous, c’est Solal, le fondateur, qui lit et répond."
      />

      <section className="w-full pb-20 md:pb-28">
        <div className="mx-auto grid w-full max-w-[1240px] gap-4 px-5 sm:px-6 lg:grid-cols-[1fr_1.5fr]">
          <div className="flex flex-col gap-4 lg:sticky lg:top-32 lg:self-start">
            <div className="card p-7">
              <span className="chip-icon">
                <Icon name="mail" />
              </span>
              <p className="mt-5 text-[15px] font-bold text-[var(--ink-3)]">Par e-mail</p>
              <a href={`mailto:${EMAIL}`} className="link mt-1 inline-block text-[22px] font-extrabold tracking-[-0.02em]">
                {EMAIL}
              </a>
              <p className="t-body mt-2">Pour vos photos aussi : envoyez-les ici, en précisant le souvenir qu’elles illustrent.</p>
            </div>
            <div className="card p-7">
              <span className="chip-icon">
                <Icon name="phone" />
              </span>
              <p className="mt-5 text-[15px] font-bold text-[var(--ink-3)]">Pour essayer Loomina</p>
              <a href={`tel:${SITE.phone}`} className="link mt-1 inline-block text-[26px] font-extrabold tracking-[-0.02em]">
                {SITE.phoneDisplay}
              </a>
              <p className="t-body mt-2">
                Ce numéro est celui de Loomina, l’intelligence artificielle qui mène les entretiens. Elle répond à toute heure, pour un
                essai de trois minutes ou pour vos appels après la commande. Ce n’est pas un service client.
              </p>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  );
}
