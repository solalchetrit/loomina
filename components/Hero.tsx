import type { CSSProperties } from "react";
import { SITE } from "@/config/site";
import { OFFER } from "@/config/offer";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import VoiceToBook from "@/components/home/VoiceToBook";

/** Les trois garanties, sous les boutons et la ligne de la démo : un titre court, puis la précision. */
const REASSURANCE: { title: string; detail: string; href?: string }[] = [
  { title: "Relu par notre équipe", detail: "avant l’impression" },
  {
    title: "Satisfait ou remboursé",
    detail: `pendant ${OFFER.guaranteeDays} jours`,
    href: "/cgv#garantie",
  },
  { title: "Paiement sécurisé", detail: "par Stripe" },
];

/** Haut de page, en deux colonnes : à gauche le titre, la promesse et les deux actions ; à droite la scène « de la voix au livre », à leur hauteur. */
export default function Hero() {
  return (
    <section className="page-top flex w-full flex-col pb-8 lg:min-h-[100svh] lg:pb-6 lg:!pt-[7.25rem]">
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center lg:my-auto gap-10 px-5 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
        <div className="min-w-0">
          <h1 className="rise t-hero text-balance" style={{ "--i": 0 } as CSSProperties}>
            Votre livre, sans avoir à écrire
          </h1>
          <p className="rise mt-6 max-w-[34rem] text-[clamp(1.15rem,1.6vw,1.4rem)] font-medium leading-[1.45] tracking-[-0.015em] text-[var(--ink)]" style={{ "--i": 1 } as CSSProperties}>
            Vous racontez au téléphone, Loomina écrit le récit de chaque appel et en compose votre livre. Vous le relisez dans votre espace auteur, et le livre arrive chez vous.
          </p>
          <div className="rise mt-8 flex flex-col gap-3 sm:flex-row" style={{ "--i": 3 } as CSSProperties}>
            <Button href="/order" size="lg">
              Commander · {OFFER.price} €
            </Button>
            <Button href={`tel:${SITE.phone}`} variant="secondary" size="lg">
              Essayer gratuitement
            </Button>
          </div>
          <p className="rise mt-4 text-[16px] text-[var(--ink-2)]" style={{ "--i": 4 } as CSSProperties}>
            Démo de {OFFER.demoMinutes} minutes au{" "}
            <a href={`tel:${SITE.phone}`} className="link whitespace-nowrap">
              {SITE.phoneDisplay}
            </a>
            , rien n’est enregistré.
          </p>
          <ul
            className="rise mt-7 grid max-w-[41rem] gap-x-5 gap-y-4 border-t border-[var(--line)] pt-6 sm:grid-cols-[auto_auto_auto] sm:justify-between"
            style={{ "--i": 4 } as CSSProperties}
          >
            {REASSURANCE.map((r) => (
              <li key={r.title} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--amber-soft)] text-[var(--amber-ink)]">
                  <Icon name="check" size={14} />
                </span>
                <p className="text-[15px] leading-snug text-[var(--ink-2)]">
                  <b className="block whitespace-nowrap text-[16px] text-[var(--ink)]">{r.title}</b>
                  {r.href ? (
                    <a href={r.href} className="link">
                      {r.detail}
                    </a>
                  ) : (
                    r.detail
                  )}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rise mx-auto w-full min-w-0 max-w-[460px] lg:mr-0 lg:max-w-[clamp(340px,calc((100svh-17.5rem)*0.8),460px)]" style={{ "--i": 2 } as CSSProperties}>
          <VoiceToBook />
        </div>
      </div>
      {/* Le haut de page occupe tout l'écran : cette invitation, en bas au milieu, donne la suite. */}
      <a
        href="#parcours"
        className="rise mx-auto mt-6 hidden items-center gap-2.5 rounded-full px-4 py-2 text-[15px] font-bold text-[var(--ink)] lg:flex"
        style={{ "--i": 5 } as CSSProperties}
      >
        Comment ça marche
        <span className="scroll-cue flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] bg-white">
          <Icon name="arrow" size={16} className="rotate-90" />
        </span>
      </a>
    </section>
  );
}
