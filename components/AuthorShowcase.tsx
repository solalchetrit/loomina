"use client";

import { useState } from "react";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import { Section, SectionHead } from "@/components/ui/Section";

/**
 * Les deux espaces de Loomina dans un seul module (Solal, 26/11/2026) :
 * un petit sélecteur « Espace auteur » / « Espace famille », puis pour chacun
 * une phrase, trois points et l'espace sur un téléphone. Compact exprès
 * (Solal : les versions précédentes prenaient trop de place), et sans carte
 * blanche autour : le contenu est posé directement sur la page. Volontairement léger : la
 * première version, avec quatre onglets par espace, était trop lourde.
 * Une vraie capture de chaque espace (public/espace-auteur/mobile-*.webp),
 * prise sur le livre d'exemple de Jeanne (personne fictive, présentée comme telle).
 */
type SpaceId = "auteur" | "famille";

const SPACES: Record<SpaceId, { label: string; who: string; lead: string; points: string[]; url: string; alt: string }> = {
  auteur: {
    label: "Espace auteur",
    who: "Pour celui qui raconte",
    lead: "Après chaque appel, il retrouve son livre en ligne.",
    points: ["Il lit chaque chapitre, mis en page comme dans le livre.", "Il corrige un passage, ou demande à Loomina de le faire.", "Il choisit le sujet du prochain appel."],
    url: "loomina.eu/espace-auteur",
    alt: "L’espace auteur de Jeanne : Mémo, le sujet du prochain appel et la carte « Suggérer un sujet »",
  },
  famille: {
    label: "Espace famille",
    who: "Pour celui qui offre",
    lead: "Il suit le livre et y participe, sans déranger l’auteur.",
    points: ["Il voit le livre avancer, appel après appel.", "Il pose une question, que Loomina glisse dans un prochain appel.", "Il commande un exemplaire pour chaque membre de la famille."],
    url: "loomina.eu/espace-famille",
    alt: "L’espace famille de Claire : Mémo, le suivi du livre de Jeanne et la carte pour poser une question",
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
  const current = SPACES[space];

  return (
    <Section id={id} className={className}>
      {/* Pas de carte : le titre et le sélecteur à gauche, le téléphone à droite sur toute la hauteur. */}
      <div className="grid items-center gap-y-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-12 lg:gap-x-24" data-reveal>
          <div className="min-w-0">
            <SectionHead
              eyebrow="Inclus avec chaque livre"
              title="Un espace pour l’auteur, un pour sa famille"
              text="Le livre se construit en ligne, sous vos yeux."
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
                    onClick={() => setSpace(key)}
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
              <p className="mt-5 text-[15px] font-bold text-[var(--amber-ink)]">{current.who}</p>
              <p className="mt-1.5 max-w-md text-[clamp(1.2rem,1.8vw,1.4rem)] font-extrabold leading-[1.2] tracking-[-0.025em] text-[var(--ink)]">{current.lead}</p>
              <ul className="mt-4 space-y-2">
                {current.points.map((point) => (
                  <li key={point} className="flex gap-3 text-[15px] leading-snug text-[var(--ink-2)]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--amber)] text-[var(--ink)]">
                      <Icon name="check" size={12} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* L'espace choisi, sur un téléphone : une vraie capture, sur un livre d'exemple. */}
          <figure className="flex h-[260px] justify-center overflow-hidden px-8 pt-2 [mask-image:linear-gradient(to_bottom,#000_78%,transparent)] md:h-[470px] md:px-6 lg:pr-16">
            <div className="h-fit w-[190px] shrink-0 rounded-[30px] md:w-[250px] md:rounded-[38px] bg-[var(--ink)] p-[7px] shadow-[0_24px_50px_-24px_rgba(20,24,34,0.55)]">
              <Image
                key={space}
                src={`/espace-auteur/mobile-${space}.webp`}
                alt={current.alt}
                width={780}
                height={1520}
                sizes="(min-width: 768px) 250px, 190px"
                className="h-auto w-full rounded-[24px] md:rounded-[31px]"
              />
            </div>
            <figcaption className="sr-only">{current.label}, sur un livre d’exemple.</figcaption>
          </figure>
      </div>
    </Section>
  );
}
