import type { CSSProperties } from "react";
import { SITE } from "@/config/site";
import { OFFER } from "@/config/offer";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import VoiceToBook from "@/components/home/VoiceToBook";

const REASSURANCE: { text: string; href?: string }[] = [
  { text: "Votre livre relu par notre équipe avant l’impression" },
  { text: `Satisfait ou remboursé sous ${OFFER.guaranteeDays} jours*`, href: "/cgv#garantie" },
  { text: "Paiement sécurisé par Stripe" },
];

/** Haut de page, en deux colonnes : à gauche le titre, la promesse et les deux actions ; à droite la scène « de la voix au livre », à leur hauteur. */
export default function Hero() {
  return (
    <section className="page-top w-full pb-10 md:pb-14">
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-10 px-5 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
        <div className="min-w-0">
          <h1 className="rise t-hero text-balance" style={{ "--i": 0 } as CSSProperties}>
            Votre livre, sans avoir à écrire
          </h1>
          <p className="rise mt-6 max-w-[34rem] text-[clamp(1.15rem,1.6vw,1.4rem)] font-medium leading-[1.45] tracking-[-0.015em] text-[var(--ink)]" style={{ "--i": 1 } as CSSProperties}>
            Vous racontez au téléphone, Loomina écrit le récit de chaque appel et en compose votre livre. Vous le relisez dans votre espace auteur, et le livre arrive chez vous.
          </p>
          <div className="rise mt-8 flex flex-col gap-3 sm:flex-row" style={{ "--i": 2 } as CSSProperties}>
            <Button href="/order" size="lg">
              Commander · {OFFER.price} €
            </Button>
            <Button href={`tel:${SITE.phone}`} variant="secondary" size="lg">
              Essayer gratuitement
            </Button>
          </div>
          <p className="rise mt-4 text-[16px] text-[var(--ink-2)]" style={{ "--i": 3 } as CSSProperties}>
            Démo de {OFFER.demoMinutes} minutes au{" "}
            <a href={`tel:${SITE.phone}`} className="link whitespace-nowrap">
              {SITE.phoneDisplay}
            </a>
            , rien n’est enregistré.
          </p>
          <ul className="rise mt-7 flex flex-col gap-2.5 text-[16px] text-[var(--ink-2)]" style={{ "--i": 4 } as CSSProperties}>
            {REASSURANCE.map((r) => (
              <li key={r.text} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--amber-soft)] text-[var(--amber-ink)]">
                  <Icon name="check" size={16} />
                </span>
                {r.href ? (
                  <a href={r.href} className="underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--ink)]">
                    {r.text}
                  </a>
                ) : (
                  r.text
                )}
              </li>
            ))}
          </ul>
          <p className="rise mt-3 text-[14px] text-[var(--ink-3)]" style={{ "--i": 4 } as CSSProperties}>
            * Remboursement intégral sur simple demande dans les {OFFER.guaranteeDays} jours qui suivent le premier entretien.{" "}
            <a href="/cgv#garantie" className="link">
              Voir les conditions
            </a>
          </p>
        </div>

        <div className="rise mx-auto w-full min-w-0 max-w-[460px] lg:mr-0" style={{ "--i": 2 } as CSSProperties}>
          <VoiceToBook />
        </div>
      </div>
    </section>
  );
}
