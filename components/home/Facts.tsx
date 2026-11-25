import { OFFER, SHOW_PRICE } from "@/config/offer";

/** Quatre repères concrets, tous tirés de l'offre : rien d'inventé. En grand, sur une carte blanche (le bleu nuit est gardé pour moins de blocs). */
const FACTS: { value: string; label: string }[] = [
  { value: "0", label: "ligne à écrire vous-même" },
  { value: `${OFFER.chapters}`, label: "thèmes pour guider vos souvenirs" },
  { value: OFFER.delay.replace(" à ", "–").replace(" semaines", " sem."), label: "du premier appel au livre validé" },
  SHOW_PRICE
    ? { value: `${OFFER.price} €`, label: "tout compris et livré chez vous" }
    : { value: "1", label: "livre imprimé, livré chez vous" },
];

export default function Facts() {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-5 sm:px-6" aria-label="Loomina en quatre chiffres">
      <ul
        data-reveal
        className="card grid grid-cols-2 px-4 py-10 sm:px-8 lg:grid-cols-4 lg:py-14"
      >
        {FACTS.map((f, i) => (
          <li
            key={f.label}
            className={`flex flex-col items-center px-3 py-5 text-center lg:py-2 ${i % 2 === 1 ? "border-l border-[var(--line)]" : ""} ${
              i >= 2 ? "border-t border-[var(--line)] lg:border-t-0" : ""
            } ${i === 2 ? "lg:border-l" : ""}`}
          >
            <span className="whitespace-nowrap text-[clamp(2rem,4.6vw,4rem)] font-extrabold leading-none tracking-[-0.045em] text-[var(--ink)]">
              {f.value}
            </span>
            <span className="mt-3 block max-w-[13rem] text-[16px] leading-snug text-[var(--ink-2)]">{f.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
