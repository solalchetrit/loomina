import Button from "@/components/ui/Button";
import { Section, SectionHead } from "@/components/ui/Section";
import { OFFER, THEMES } from "@/config/offer";

/**
 * Les thèmes proposés au fil des appels, présentés comme le sommaire du futur livre :
 * on se projette dans l'objet plutôt que dans un questionnaire.
 */
export function Contents({ className = "", details = true }: { className?: string; details?: boolean }) {
  const half = Math.ceil(THEMES.length / 2);
  const columns = [THEMES.slice(0, half), THEMES.slice(half)];
  return (
    <div className={`card card-float relative overflow-hidden px-6 py-10 sm:px-12 sm:py-14 ${className}`}>
      <span className="pill pill-neutral absolute right-5 top-5">Exemple</span>
      <p className="text-center font-serif text-[32px] italic leading-none">Sommaire</p>
      <p className="mt-3 text-center text-[14px] font-bold text-[var(--amber-ink)]">Les {OFFER.chapters} thèmes proposés</p>
      <div className="mt-10 grid gap-x-12 md:grid-cols-2">
        {columns.map((col, c) => (
          <ol key={c} start={c * half + 1} className="divide-y divide-[var(--line-soft)]">
            {col.map((t, i) => (
              <li key={t.title} className={`flex items-baseline gap-4 ${details ? "py-3.5" : "py-3"}`}>
                <span className="w-7 shrink-0 font-serif text-[20px] text-[var(--amber-ink)]" aria-hidden="true">
                  {c * half + i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-serif text-[21px] leading-snug text-[var(--ink)]">{t.title}</span>
                  {details && <span className="mt-0.5 block text-[15px] leading-snug text-[var(--ink-3)]">{t.desc}</span>}
                </span>
              </li>
            ))}
          </ol>
        ))}
      </div>
    </div>
  );
}

export default function Themes() {
  return (
    <Section id="themes">
      <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div>
          <SectionHead
            title="Le sommaire de votre livre est déjà là"
            text="Loomina vous guide d’un thème à l’autre, de l’enfance à ce que vous voulez transmettre. Vous en sautez, vous vous attardez, vous en ajoutez : c’est votre récit, dans votre ordre."
          />
          <ul className="mt-8 space-y-3 text-[17px]">
            <li className="flex gap-3">
              <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--amber)]" />
              Aucune préparation : Loomina pose la première question.
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--amber)]" />
              Un souvenir en appelle un autre, au rythme de la conversation.
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--amber)]" />
              Vous pouvez revenir sur un thème à n’importe quel appel.
            </li>
          </ul>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href="/order" size="lg">
              Commencer mon livre
            </Button>
            <Button href="/experience" variant="secondary" size="lg">
              Le déroulé des appels
            </Button>
          </div>
        </div>
        <Contents details={false} />
      </div>
    </Section>
  );
}
