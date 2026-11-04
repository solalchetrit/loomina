import type { CSSProperties } from "react";
import { SITE } from "@/config/site";
import { OFFER } from "@/config/offer";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import LiveFeed from "@/components/home/LiveFeed";

const REASSURANCE = ["Chaque page relue par une personne", `Remboursé sous ${OFFER.guaranteeDays} jours`, "Paiement sécurisé par Stripe"];

/** Haut de page : le titre en très grand, puis la promesse, les deux actions et la carte vivante. */
export default function Hero() {
  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-[1240px] px-5 pb-16 pt-32 sm:px-6 md:pt-40 lg:pb-24">
        <h1 className="rise t-hero max-w-[16ch]" style={{ "--i": 0 } as CSSProperties}>
          Votre vie, racontée au téléphone
        </h1>

        <div className="mt-10 grid items-start gap-12 lg:mt-14 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div className="min-w-0 lg:pt-4">
            <p className="rise max-w-[30rem] text-[clamp(1.25rem,1.9vw,1.6rem)] font-medium leading-[1.45] tracking-[-0.015em] text-[var(--ink)]" style={{ "--i": 1 } as CSSProperties}>
              Vous parlez, Loomina écrit un chapitre après chaque appel, et vous recevez le livre relié chez vous.
            </p>
            <div className="rise mt-9 flex flex-col gap-3 sm:flex-row" style={{ "--i": 2 } as CSSProperties}>
              <Button href="/order" size="lg">
                Commander · {OFFER.price} €
              </Button>
              <Button href={`tel:${SITE.phone}`} variant="secondary" size="lg">
                Essayer gratuitement
              </Button>
            </div>
            <p className="rise mt-5 text-[16px] text-[var(--ink-2)]" style={{ "--i": 3 } as CSSProperties}>
              Démo de {OFFER.demoMinutes} minutes au{" "}
              <a href={`tel:${SITE.phone}`} className="link whitespace-nowrap">
                {SITE.phoneDisplay}
              </a>
              , rien n’est enregistré.
            </p>
            <ul className="rise mt-10 flex flex-col gap-3 text-[16px] text-[var(--ink-2)]" style={{ "--i": 4 } as CSSProperties}>
              {REASSURANCE.map((r) => (
                <li key={r} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--amber-soft)] text-[var(--amber-ink)]">
                    <Icon name="check" size={16} />
                  </span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="rise min-w-0" style={{ "--i": 2 } as CSSProperties}>
            <LiveFeed />
          </div>
        </div>
      </div>
    </section>
  );
}
