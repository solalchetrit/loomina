import Button from "@/components/ui/Button";
import { SITE } from "@/config/site";
import { OFFER } from "@/config/offer";

/**
 * Bandeau de démo, en fin de page : le même partout.
 * Le numéro est l'action la plus simple, il est donc le plus visible.
 */
export default function Closing({
  title = `${OFFER.demoMinutes} minutes au téléphone, gratuitement`,
  text = "Racontez un souvenir et écoutez comment Loomina mène l’entretien. Rien n’est enregistré, prix d’un appel normal.",
  secondary = { href: "/order", label: `Commander · ${OFFER.price} €` },
}: {
  title?: string;
  text?: string;
  secondary?: { href: string; label: string } | null;
}) {
  return (
    <section className="w-full px-5 pb-20 pt-4 sm:px-6 md:pb-28">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-10 rounded-[32px] bg-[var(--ink)] px-7 py-12 text-white sm:px-12 md:py-14 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="text-[15px] font-bold text-[var(--amber)]">Essayez avant d’acheter</p>
          <h2 className="mt-3 text-[clamp(1.9rem,3.4vw,2.6rem)] leading-[1.1] text-white">{title}</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-[#cfcfc8]">{text}</p>
        </div>
        <div className="flex flex-col gap-4 lg:items-end">
          <a
            href={`tel:${SITE.phone}`}
            className="press inline-flex items-center justify-center rounded-[22px] bg-[var(--amber)] px-8 py-5 text-[clamp(1.9rem,3.6vw,2.75rem)] font-extrabold tracking-[-0.03em] text-[var(--ink)] hover:bg-[#f4ac4b]"
          >
            {SITE.phoneDisplay}
          </a>
          {secondary && (
            <Button href={secondary.href} variant="ghost" className="!text-white !decoration-white/40 hover:!decoration-white">
              {secondary.label}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
