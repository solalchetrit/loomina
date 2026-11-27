import Button from "@/components/ui/Button";
import Icon, { type IconName } from "@/components/ui/Icon";
import { Section, SectionHead } from "@/components/ui/Section";
import { OFFER } from "@/config/offer";
import Photo from "@/components/ui/Photo";

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  { icon: "book", title: "Un vrai livre", text: `${OFFER.format}, imprimé et livré chez vous.` },
  { icon: "image", title: "Vos photos dedans", text: "Ajoutez-les dans votre espace auteur ou envoyez-les par e-mail." },
  { icon: "check", title: "Relu par notre équipe", text: "Votre livre est relu avant l’impression." },
  { icon: "heart", title: "À partager en famille", text: `La version ${OFFER.digital}, pour ceux qui sont loin.` },
];

/** Couverture du livre, dessinée en CSS : noir, titre clair, l'étoile du logo. Décorative. */
export function BookCover({ className = "max-w-[340px]", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div aria-hidden="true" className={`relative mx-auto w-full select-none py-6 ${className}`}>
      <div className="absolute inset-x-6 bottom-0 h-8 rounded-[50%] bg-black/15 blur-xl" />
      <div className="relative aspect-[3/4.2] -rotate-2 rounded-[6px_14px_14px_6px] bg-[var(--ink)] shadow-[0_40px_60px_-30px_rgba(0,0,0,0.6)]">
        <div className="absolute inset-y-0 left-0 w-[8%] rounded-l-[6px] bg-gradient-to-r from-black/50 to-white/5" />
        <div className="absolute -right-[3%] inset-y-[2%] -z-10 w-[6%] rounded-r-[4px] bg-[repeating-linear-gradient(90deg,#f2f1ec_0_1px,#dedcd4_1px_2px)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-between px-[14%] py-[16%] text-center">
          <svg width={compact ? 14 : 26} height={compact ? 14 : 26} viewBox="0 0 24 24" className="text-[#f1a843]">
            <path fill="currentColor" d="M12 0c.9 6.4 5.6 11.1 12 12-6.4.9-11.1 5.6-12 12-.9-6.4-5.6-11.1-12-12C6.4 11.1 11.1 6.4 12 0z" />
          </svg>
          <p className={`font-serif italic leading-[1.1] text-white ${compact ? "text-[17px]" : "text-[30px] sm:text-[34px]"}`}>
            Les saisons
            <br />
            de Jeanne
          </p>
          <p className={`font-bold tracking-[0.2em] text-white/60 ${compact ? "text-[7px]" : "text-[11px]"}`}>LOOMINA</p>
        </div>
      </div>
      {!compact && <span className="pill pill-neutral absolute right-0 top-0 shadow-sm">Exemple</span>}
    </div>
  );
}

export default function WhatYouGet({
  showDetailLink = true,
  photo = "collection",
  title = "Votre histoire, en livre et pour longtemps",
  features = FEATURES,
}: {
  showDetailLink?: boolean;
  photo?: "collection" | "mains";
  title?: string;
  /** Quatre points, pas plus : la grille est faite pour ça. */
  features?: { icon: IconName; title: string; text: string }[];
}) {
  return (
    <Section id="le-livre">
      <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        {photo === "collection" ? (
          <Photo
            name="collection-de-livres"
            alt="Quatre livres Loomina, aux couvertures en toile beige, bleue, verte et bordeaux."
            ratio="aspect-[4/3]"
            sizes="(min-width: 1024px) 640px, 100vw"
          />
        ) : (
          <Photo
            name="livre-bleu-dans-les-mains"
            alt="Deux mains tiennent un livre Loomina, à la couverture en toile bleu nuit."
            ratio="aspect-[4/5]"
            sizes="(min-width: 1024px) 480px, 100vw"
            className="mx-auto w-full max-w-[480px]"
          />
        )}
        <div>
          <SectionHead title={title} />
          <ul className="mt-8 grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" data-reveal>
            {features.map((f) => (
              <li key={f.title} className="flex gap-4">
                <span className="chip-icon">
                  <Icon name={f.icon} />
                </span>
                <span>
                  <b className="block text-[17px] leading-snug">{f.title}</b>
                  <span className="mt-1 block text-[15px] leading-snug text-[var(--ink-3)]">{f.text}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/order" size="lg">
              Commander
            </Button>
            {showDetailLink && (
              <Button href="/offre" variant="secondary" size="lg">
                Voir le livre en détail
              </Button>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
