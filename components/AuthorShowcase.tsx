"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { Section, SectionHead } from "@/components/ui/Section";
import SpaceDemo, { type SpaceId } from "@/components/SpaceDemo";

/**
 * Les deux espaces de Loomina dans un seul module (Solal, 26/11/2026) :
 * un petit sélecteur « Espace auteur » / « Espace famille », puis pour chacun
 * une phrase, trois points et l'espace sur un téléphone. Compact exprès
 * (Solal : les versions précédentes prenaient trop de place), et sans carte
 * blanche autour : le contenu est posé directement sur la page. Volontairement léger : la
 * première version, avec quatre onglets par espace, était trop lourde.
 * Le téléphone montre l'espace tout seul, comme une vidéo (SpaceDemo), à partir
 * de vraies captures sur le livre d'exemple de Jeanne (personne fictive).
 */

const SPACES: Record<SpaceId, { label: string; who: string; points: string[]; url: string; alt: string }> = {
  auteur: {
    label: "Espace auteur",
    who: "Pour celui qui raconte",
    points: ["Il lit chaque chapitre, mis en page comme dans le livre.", "Il corrige un passage, ou demande à Loomina de le faire.", "Il choisit le sujet du prochain appel."],
    url: "loomina.eu/espace-auteur",
    alt: "L’espace auteur de Jeanne, parcouru écran par écran : l’aperçu, son livre, sa vie, ses appels et ses réglages",
  },
  famille: {
    label: "Espace famille",
    who: "Pour celui qui offre",
    points: ["Il voit le livre avancer, appel après appel.", "Il pose une question, que Loomina glisse dans un prochain appel.", "Il commande un exemplaire pour chaque membre de la famille."],
    url: "loomina.eu/espace-famille",
    alt: "L’espace famille de Claire : le suivi du livre de Jeanne, la question à poser et les récits à lire",
  },
};

const ORDER: SpaceId[] = ["auteur", "famille"];

export default function AuthorShowcase({
  id = "espace-auteur",
  className = "",
}: {
  id?: string;
  className?: string;
}) {
  const [space, setSpace] = useState<SpaceId>("auteur");
  // Tant que le visiteur n'a rien choisi, le téléphone enchaîne espace auteur puis espace famille.
  const [auto, setAuto] = useState(true);
  const current = SPACES[space];

  return (
    <Section id={id} className={className}>
      {/* Pas de carte : le titre et le sélecteur à gauche, le téléphone à droite sur toute la hauteur. */}
      {/* Les deux modules restent groupés et centrés : sur grand écran, plus de grand vide entre le texte et le téléphone. */}
      <div className="grid items-center gap-y-8 md:grid-cols-[minmax(0,34rem)_auto] md:justify-center md:gap-x-12 lg:gap-x-20" data-reveal>
          <div className="min-w-0">
            <SectionHead
              eyebrow="Inclus avec chaque livre"
              title="Un espace pour l’auteur, un pour sa famille"
              text="L’auteur relit et corrige son livre. Sa famille le suit et y participe."
            />
            <div className="head-gap" />
            {/* Le sélecteur : deux boutons côte à côte. */}
            <div role="tablist" aria-label="Les deux espaces" className="grid w-full max-w-[24rem] grid-cols-2 gap-1 rounded-full bg-[var(--surface-2)] p-1">
              {ORDER.map((key) => {
                const on = key === space;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls={`${id}-espace`}
                    onClick={() => {
                      setAuto(false);
                      setSpace(key);
                    }}
                    className={`press min-h-11 whitespace-nowrap rounded-full px-2 text-[15px] font-bold transition-colors sm:px-4 ${
                      on ? "bg-[var(--ink)] text-white" : "text-[var(--ink-2)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {SPACES[key].label}
                  </button>
                );
              })}
            </div>

            <div id={`${id}-espace`} role="tabpanel">
              <p className="mt-6 text-[15px] font-bold text-[var(--amber-ink)]">{current.who}</p>
              <ul className="mt-3 space-y-2.5">
                {current.points.map((point) => (
                  <li key={point} className="flex gap-3 text-[15px] leading-snug text-[var(--ink-2)]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full gloss">
                      <Icon name="check" size={12} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* L'espace choisi, sur un téléphone : il se parcourt tout seul (components/SpaceDemo.tsx). */}
          <figure className="flex justify-center">
            <SpaceDemo space={space} auto={auto} onAutoNext={setSpace} label={current.alt} />
            <figcaption className="sr-only">{current.label}, sur un livre d’exemple.</figcaption>
          </figure>
      </div>
    </Section>
  );
}
