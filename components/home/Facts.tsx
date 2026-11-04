import { OFFER } from "@/config/offer";

/** Quatre repères concrets, tous tirés de l'offre : rien d'inventé. En grand, sur un champ noir. */
const FACTS = [
  { value: `${OFFER.demoMinutes} min`, label: "de démo gratuite, sans inscription" },
  { value: `${OFFER.chapters}`, label: "thèmes pour guider vos souvenirs" },
  { value: OFFER.delay.replace(" semaines", " sem."), label: "du premier appel au livre validé" },
  { value: `${OFFER.price} €`, label: "tout compris, livraison incluse" },
];

export default function Facts() {
  return (
    <section className="w-full px-3 sm:px-4" aria-label="Loomina en quatre chiffres">
      <ul data-reveal className="mx-auto grid max-w-[1272px] grid-cols-2 gap-x-6 gap-y-10 rounded-[32px] bg-[var(--ink)] px-7 py-12 text-white sm:px-12 lg:grid-cols-4 lg:py-16">
        {FACTS.map((f) => (
          <li key={f.label}>
            <b className="block text-[clamp(2.4rem,4.6vw,4rem)] font-extrabold leading-none tracking-[-0.045em] text-[var(--amber)]">{f.value}</b>
            <span className="mt-3 block max-w-[14rem] text-[16px] leading-snug text-[#cfcfc8]">{f.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
