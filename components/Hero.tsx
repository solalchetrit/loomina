import type { CSSProperties } from "react";
import { SITE } from "@/config/site";
import { OFFER } from "@/config/offer";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import VoiceToBook from "@/components/home/VoiceToBook";
import ScrollCue from "@/components/home/ScrollCue";

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
    <section className="page-top flex w-full flex-col pb-8 lg:pb-4 lg:!pt-[7.25rem]">
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center lg:items-stretch px-5 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
        {/* Sur mobile, cette colonne s’efface (contents) pour glisser la scène entre le texte et les boutons (Solal, 23/11/2026). */}
        <div className="flex min-w-0 flex-col max-lg:contents lg:justify-between lg:py-1">
          <div className="max-lg:order-1">
          <h1 className="rise t-hero text-balance" style={{ "--i": 0 } as CSSProperties}>
            Votre livre, sans avoir à écrire
          </h1>
          <p className="rise mt-7 max-w-[35rem] text-[clamp(1.15rem,1.6vw,1.4rem)] font-medium leading-[1.45] tracking-[-0.015em] text-[var(--ink)]" style={{ "--i": 1 } as CSSProperties}>
            Vous racontez au téléphone, Loomina écrit le récit de chaque appel et en compose votre livre. Vous le relisez dans votre espace auteur, et le livre arrive chez vous.
          </p>
          </div>
          <div className="mt-9 max-lg:order-3">
          <div className="rise flex flex-col gap-3 sm:flex-row" style={{ "--i": 3 } as CSSProperties}>
            <Button href="/order" size="lg">
              Commander
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
             : vous recevez votre récit écrit par SMS.
          </p>
          </div>
          <ul
            className="rise mt-9 grid max-w-[41rem] max-lg:order-4 gap-x-5 gap-y-4 border-t border-[var(--line)] pt-7 sm:grid-cols-[auto_auto_auto] sm:justify-between"
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

        <div className="rise mx-auto mt-9 w-full min-w-0 max-w-[460px] self-center max-lg:order-2 lg:mt-0 lg:mr-0 lg:max-w-[clamp(340px,calc((100svh-17.5rem)*0.8),460px)]" style={{ "--i": 2 } as CSSProperties}>
          <VoiceToBook />
        </div>
      </div>
      {/* La flèche, juste sous le haut de page (plus de grand vide : Solal, 19/11/2026), mène aux trois étapes. */}
      <ScrollCue target="parcours" label="Voir les trois étapes" style={{ "--i": 5 } as CSSProperties} />
    </section>
  );
}
