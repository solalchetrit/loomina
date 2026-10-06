import { LOOMINA_CONFIG } from "@/config/loomina";
import { OFFER } from "@/config/offer";

const STEPS = [
  {
    title: "Vous appelez, quand vous voulez",
    text: `Après la commande, vous appelez le ${LOOMINA_CONFIG.PHONE_NUMBER_DISPLAY} depuis le numéro donné à l’inscription. Loomina vous reconnaît et reprend là où vous vous étiez arrêté. Un appel dure le temps qu’il vous faut.`,
  },
  {
    title: "Un chapitre arrive après chaque appel",
    text: `Loomina l’écrit dans vos mots, sans rien inventer, et vous le retrouvez dans votre espace. Au prochain appel, vous dites ce qu’il faut changer. ${OFFER.chapters} thèmes vous guident, de l’enfance à aujourd’hui, et vous pouvez en sauter ou en ajouter.`,
  },
  {
    title: "Nous relisons, mettons en page, imprimons",
    text: `Notre équipe relit chaque page, place vos photos et compose le livre. Il arrive relié chez vous, en général ${OFFER.delay} après le premier appel, avec sa version numérique à partager.`,
  },
];

export default function HowItWorks() {
  return (
    <section id="parcours" className="relative w-full scroll-mt-24 py-24 md:py-32">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <div className="reveal lg:sticky lg:top-32 lg:self-start">
          <h2 className="font-serif text-[clamp(2.1rem,4vw,3.25rem)] leading-[1.08] tracking-[-0.02em] text-[var(--ink)]">
            Comment ça se passe
          </h2>
          <p className="mt-5 max-w-sm font-sans text-[17px] leading-relaxed text-[var(--text-secondary)]">
            Rien à installer, rien à écrire. Un téléphone suffit, fixe ou portable.
          </p>
        </div>

        <ol className="border-t border-[var(--ink)]/80">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="reveal grid gap-3 border-b border-[var(--hairline-strong)] py-8 sm:grid-cols-[4.5rem_1fr] sm:gap-6 md:py-10"
            >
              <span className="font-serif text-[40px] leading-none text-[var(--gold-ink)] md:text-[48px]" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3 className="font-serif text-[24px] leading-tight tracking-[-0.01em] text-[var(--ink)] md:text-[28px]">
                  <span className="sr-only">Étape {i + 1} : </span>
                  {step.title}
                </h3>
                <p className="mt-3 max-w-2xl font-sans text-[17px] leading-[1.7] text-[var(--text-secondary)]">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
