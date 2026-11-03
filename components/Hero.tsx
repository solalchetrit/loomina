import type { CSSProperties } from "react";
import { SITE } from "@/config/site";
import { OFFER } from "@/config/offer";
import Button from "@/components/ui/Button";
import Icon, { type IconName } from "@/components/ui/Icon";

type FeedItem = { icon: IconName; title: string; detail: string; badge?: { label: string; tone: "amber" | "green" }; highlight?: boolean };

/** Une semaine type dans l'espace auteur. Exemple, présenté comme tel. */
const FEED: FeedItem[] = [
  { icon: "phone", title: "Appel terminé, 32 minutes", detail: "Les dimanches à la mer", highlight: true },
  { icon: "pen", title: "Chapitre 4 écrit", detail: "« L’été de mes seize ans »", badge: { label: "À relire", tone: "amber" } },
  { icon: "check", title: "Chapitre 3 relu par l’équipe", detail: "Deux corrections, prêt pour le livre", badge: { label: "Validé", tone: "green" } },
  { icon: "image", title: "3 photos ajoutées", detail: "Envoyées par sa fille" },
];

function ActivityCard() {
  return (
    <figure className="card card-float w-full min-w-0 p-5 sm:p-6" aria-label="Exemple : une semaine dans l’espace auteur">
      <figcaption className="flex items-center justify-between gap-3 border-b border-[var(--line-soft)] px-1 pb-4">
        <span className="text-[17px] font-bold">
          Le livre de Jeanne <span className="font-medium text-[var(--ink-3)]">· cette semaine</span>
        </span>
        <span className="pill pill-neutral">Exemple</span>
      </figcaption>

      <ul className="mt-4 flex flex-col gap-2.5">
        {FEED.map((item, i) => (
          <li
            key={item.title}
            className={`feed-in flex items-center gap-3.5 rounded-[18px] border px-3.5 py-3 sm:px-4 ${
              item.highlight ? "border-[var(--amber-line)] bg-[#fdf3e4]" : "border-[var(--line-soft)]"
            }`}
            style={{ "--i": i } as CSSProperties}
          >
            <span className={`chip-icon !h-10 !w-10 !rounded-[12px] ${item.highlight ? "!bg-white" : "chip-icon-neutral"}`}>
              <Icon name={item.icon} size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block text-[16px] leading-snug">{item.title}</b>
              <span className="block truncate text-[14px] text-[var(--ink-3)]">{item.detail}</span>
            </span>
            {item.badge && <span className={`pill pill-${item.badge.tone}`}>{item.badge.label}</span>}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex gap-8 border-t border-[var(--line-soft)] px-1 pt-4">
        <p className="leading-tight">
          <b className="text-[28px] font-extrabold tracking-[-0.03em]">4</b> <span className="text-[14px] text-[var(--ink-3)]">chapitres écrits</span>
        </p>
        <p className="leading-tight">
          <b className="text-[28px] font-extrabold tracking-[-0.03em]">0</b> <span className="text-[14px] text-[var(--ink-3)]">ligne écrite par Jeanne</span>
        </p>
      </div>
    </figure>
  );
}

const REASSURANCE = ["Relecture humaine de chaque page", `Remboursé sous ${OFFER.guaranteeDays} jours`, "Paiement sécurisé par Stripe"];

export default function Hero() {
  return (
    <section className="w-full">
      <div className="mx-auto grid w-full max-w-[1240px] items-center gap-12 px-5 pb-12 pt-32 sm:px-6 md:pt-40 lg:grid-cols-[1.08fr_1fr] lg:gap-14 lg:pb-20">
        <div className="min-w-0">
          <h1 className="rise t-display" style={{ "--i": 0 } as CSSProperties}>
            Racontez votre vie au téléphone <span className="t-accent">et recevez‑la en livre</span>
          </h1>
          <p className="rise t-lead mt-6 max-w-[33rem]" style={{ "--i": 1 } as CSSProperties}>
            Loomina mène l’entretien avec vous, écrit un chapitre après chaque appel, et notre équipe relit chaque page. Vous
            n’écrivez rien : vous parlez.
          </p>
          <div className="rise mt-9 flex flex-col gap-3 sm:flex-row" style={{ "--i": 2 } as CSSProperties}>
            <Button href="/order" size="lg">
              Commander le livre
            </Button>
            <Button href={`tel:${SITE.phone}`} variant="secondary" size="lg">
              Appeler la démo · {SITE.phoneDisplay}
            </Button>
          </div>
          <ul className="rise mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-[var(--ink-3)]" style={{ "--i": 3 } as CSSProperties}>
            {REASSURANCE.map((r) => (
              <li key={r} className="flex items-center gap-2">
                <Icon name="check" size={18} className="text-[var(--amber-ink)]" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        <ActivityCard />
      </div>
    </section>
  );
}
