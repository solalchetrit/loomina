import { PageHeader } from "@/components/ui/Section";
import ContactForm from "@/components/ContactForm";
import Icon from "@/components/ui/Icon";
import Memo from "@/components/brand/Memo";
import { SITE } from "@/config/site";

const EMAIL = "contact@loomina.eu";

/**
 * Nous écrire (Solal, 25/11/2026 : « c'est moche »).
 * Un seul bloc : à gauche le panneau bleu nuit avec Mémo qui écoute et les deux moyens directs,
 * à droite le formulaire sur carte blanche. Même hauteur des deux côtés sur ordinateur.
 */
export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Une question ? On vous répond !"
        text="Un projet de livre, un cadeau à préparer, un doute avant de commander : écrivez-nous, l’équipe Loomina vous répond."
      />

      <section className="section-b mt-10 w-full md:mt-12">
        <div className="mx-auto grid w-full max-w-[1240px] gap-4 px-5 sm:px-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-stretch">
          <aside className="on-night rise order-2 lg:order-none relative flex flex-col overflow-hidden rounded-[var(--radius-card)] p-7 md:p-9">
            {/* Lueur douce derrière Mémo, le seul décor du panneau. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/4 rounded-full bg-[radial-gradient(closest-side,rgba(120,150,210,0.28),transparent)]"
            />
            <div className="relative mx-auto -my-4 w-[220px] md:w-[250px]">
              <Memo age={3} clip="listen" size={250} />
            </div>

            <ul className="relative mt-2 divide-y divide-[var(--line)] border-t border-[var(--line)]">
              <li className="flex gap-4 py-6">
                <span className="chip-icon">
                  <Icon name="mail" />
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-[var(--ink-3)]">Par e-mail</p>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="mt-0.5 inline-block break-all text-[21px] font-extrabold tracking-[-0.02em] text-white underline decoration-white/30 underline-offset-4 hover:decoration-[var(--amber)]"
                  >
                    {EMAIL}
                  </a>
                  <p className="mt-2 text-[16px] leading-relaxed text-[var(--ink-2)]">
                    Vos photos aussi : envoyez-les ici, en précisant le souvenir qu’elles illustrent.
                  </p>
                </div>
              </li>
              <li className="flex gap-4 py-6">
                <span className="chip-icon">
                  <Icon name="phone" />
                </span>
                <div className="min-w-0">
                  <p className="text-[15px] font-bold text-[var(--ink-3)]">Pour essayer Loomina</p>
                  <a
                    href={`tel:${SITE.phone}`}
                    className="mt-0.5 inline-block text-[24px] font-extrabold tracking-[-0.02em] text-[var(--amber-bright)] hover:brightness-110"
                  >
                    {SITE.phoneDisplay}
                  </a>
                  <p className="mt-2 text-[16px] leading-relaxed text-[var(--ink-2)]">
                    C’est le numéro de Loomina, l’intelligence artificielle qui mène les entretiens. Elle répond à toute heure. Pour une
                    question, écrivez-nous plutôt.
                  </p>
                </div>
              </li>
            </ul>
          </aside>

          <ContactForm />
        </div>
      </section>
    </>
  );
}
