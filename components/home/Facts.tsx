import { OFFER } from "@/config/offer";
import Icon, { type IconName } from "@/components/ui/Icon";

/** Quatre repères concrets, tous tirés de l'offre : rien d'inventé. */
const FACTS: { icon: IconName; value: string; label: string }[] = [
  { icon: "phone", value: `${OFFER.demoMinutes} min`, label: "de démo gratuite, sans inscription" },
  { icon: "book", value: `${OFFER.chapters} thèmes`, label: "pour guider vos souvenirs" },
  { icon: "clock", value: OFFER.delay, label: "du premier appel au livre validé" },
  { icon: "gift", value: `${OFFER.price} €`, label: "tout compris, livraison incluse" },
];

export default function Facts() {
  return (
    <section className="w-full">
      <ul className="mx-auto grid max-w-[1240px] grid-cols-2 gap-3 px-5 sm:px-6 lg:grid-cols-4 lg:gap-4">
        {FACTS.map((f) => (
          <li key={f.label} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-4 sm:p-6">
            <span className="chip-icon">
              <Icon name={f.icon} />
            </span>
            <span>
              <b className="block text-[22px] font-extrabold leading-tight tracking-[-0.03em] sm:text-[24px]">{f.value}</b>
              <span className="block text-[14px] leading-snug text-[var(--ink-3)] sm:text-[15px]">{f.label}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
