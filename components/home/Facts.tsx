import { OFFER } from "@/config/offer";

/** Quatre repères concrets, tous tirés de l'offre : rien d'inventé. En grand, sur un champ noir. */
const FACTS: { value: string; label: string }[] = [
  { value: "0", label: "ligne à écrire vous-même" },
  { value: `${OFFER.chapters}`, label: "thèmes pour guider vos souvenirs" },
  { value: OFFER.delay.replace(" à ", "–").replace(" semaines", " sem."), label: "du premier appel au livre validé" },
  { value: `${OFFER.price} €`, label: "à partir de, tout compris et livré chez vous" },
];

export default function Facts() {
  return (
    <section className="w-full px-3 sm:px-4" aria-label="Loomina en quatre chiffres">
      <ul
        data-reveal
        className="mx-auto grid max-w-[1272px] grid-cols-2 rounded-[32px] bg-[var(--ink)] px-4 py-10 text-white sm:px-8 lg:grid-cols-4 lg:py-14"
      >
        {FACTS.map((f, i) => (
          <li
            key={f.label}
            className={`flex flex-col items-center px-3 py-5 text-center lg:py-2 ${i % 2 === 1 ? "border-l border-white/15" : ""} ${
              i >= 2 ? "border-t border-white/15 lg:border-t-0" : ""
            } ${i === 2 ? "lg:border-l" : ""}`}
          >
            <span className="whitespace-nowrap text-[clamp(2rem,4.6vw,4rem)] font-extrabold leading-none tracking-[-0.045em] text-[var(--amber)]">
              {f.value}
            </span>
            <span className="mt-3 block max-w-[13rem] text-[16px] leading-snug text-[#cfcfc8]">{f.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
