import Button from "@/components/ui/Button";
import { LOOMINA_CONFIG } from "@/config/loomina";
import { OFFER } from "@/config/offer";

/**
 * Fin de page : la même invitation partout, sur papier, sans bandeau sombre.
 * Le numéro de démo est l'action la plus simple, il est donc le plus gros.
 */
export default function Closing({
  title = "Le plus simple, c’est d’essayer.",
  text = `Appelez Loomina ${OFFER.demoMinutes} minutes et racontez-lui un souvenir. Rien n’est enregistré, c’est le prix d’un appel normal.`,
  secondary = { href: "/order", label: `Commander · ${OFFER.price} €` },
}: {
  title?: string;
  text?: string;
  secondary?: { href: string; label: string } | null;
}) {
  return (
    <section className="w-full px-5 pb-24 sm:px-8 md:pb-32">
      <div className="mx-auto max-w-6xl border-t border-[var(--ink)] pt-12 md:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <h2 className="t-title">{title}</h2>
            <p className="t-lead mt-5 max-w-md">{text}</p>
          </div>
          <div className="lg:justify-self-end lg:text-right">
            <p className="t-eyebrow">Démo gratuite, {OFFER.demoMinutes} minutes</p>
            <a
              href={`tel:${LOOMINA_CONFIG.PHONE_NUMBER}`}
              className="link mt-3 inline-block font-serif text-[clamp(2.4rem,6vw,4.25rem)] leading-none tracking-[-0.02em] text-[var(--ink)]"
            >
              {LOOMINA_CONFIG.PHONE_NUMBER_DISPLAY}
            </a>
            {secondary && (
              <div className="mt-8">
                <Button href={secondary.href} variant="secondary" size="lg">
                  {secondary.label}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
