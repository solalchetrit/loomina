import Link from "next/link";
import { Section, SectionHead } from "@/components/ui/Section";
import { OFFER, THEMES } from "@/config/offer";

/** Les thèmes proposés au fil des appels, en pastilles : on voit d'un coup d'œil de quoi on parlera. */
export default function Themes() {
  return (
    <Section id="themes">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHead
          eyebrow={`${OFFER.chapters} thèmes`}
          title="De l’enfance à ce que vous voulez transmettre"
          text="Des points de départ, pas un questionnaire. Vous en sautez, vous en ajoutez : c’est votre récit."
        />
        <Link href="/experience#chapitres" className="link shrink-0 text-[16px]">
          Voir les thèmes en détail
        </Link>
      </div>
      <ul className="mt-10 flex flex-wrap gap-2.5">
        {THEMES.map((t, i) => (
          <li
            key={t.title}
            className={`rounded-full border px-5 py-2.5 text-[16px] font-semibold ${
              i % 5 === 0 ? "border-[var(--amber-line)] bg-[var(--amber-soft)] text-[var(--amber-deep)]" : "border-[var(--line)] bg-white"
            }`}
          >
            {t.title}
          </li>
        ))}
      </ul>
    </Section>
  );
}
