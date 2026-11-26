"use client";

import { useState } from "react";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import { Section, SectionHead } from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import { SITE } from "@/config/site";

/**
 * Les deux espaces de Loomina dans un seul module (Solal, 26/11/2026) :
 * un petit sélecteur « Espace auteur » / « Espace famille », puis pour chacun
 * une phrase, trois points et une seule image, en grand. Volontairement léger : la
 * première version, avec quatre onglets par espace, était trop lourde.
 * Une vraie capture de chaque espace (public/espace-auteur/apercu-*.webp),
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
      <SectionHead
        eyebrow="Inclus avec chaque livre"
        title="Un espace pour l’auteur, un pour sa famille"
        text="Le livre se construit en ligne, sous vos yeux."
      />

      <div className="head-gap card overflow-hidden p-3" data-reveal>
        <div className="p-3 pb-6 sm:p-6 sm:pb-8 lg:p-8">
          {/* Le sélecteur : deux boutons côte à côte. */}
          <div role="tablist" aria-label="Les deux espaces" className="grid w-full max-w-[26rem] grid-cols-2 gap-1 rounded-full bg-[var(--surface-2)] p-1">
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
                  className={`press min-h-12 whitespace-nowrap rounded-full px-2 text-[15px] font-bold transition-colors sm:px-4 sm:text-[16px] ${
                    on ? "bg-[var(--ink)] text-white" : "text-[var(--ink-2)] hover:text-[var(--ink)]"
                  }`}
                >
                  {SPACES[key].label}
                </button>
              );
            })}
          </div>

          <div id={`${id}-espace`} role="tabpanel" className="mt-7 grid gap-x-12 gap-y-5 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <p className="text-[15px] font-bold text-[var(--amber-ink)]">{current.who}</p>
              <p className="mt-1.5 text-[clamp(1.4rem,2.2vw,1.75rem)] font-extrabold leading-[1.2] tracking-[-0.025em] text-[var(--ink)]">{current.lead}</p>
            </div>
            <ul className="space-y-2.5">
              {current.points.map((point) => (
                <li key={point} className="flex gap-3 text-[17px] leading-snug text-[var(--ink-2)]">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--amber)] text-[var(--ink)]">
                    <Icon name="check" size={14} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Une seule image : la vraie page de l'espace choisi. */}
        <figure className="overflow-hidden rounded-[18px] border border-[var(--line)] bg-[var(--canvas)]">
          <div className="overflow-hidden">
            <Image
              key={space}
              src={`/espace-auteur/apercu-${space}.webp`}
              alt={current.alt}
              width={1770}
              height={860}
              sizes="(min-width: 1240px) 1170px, (min-width: 640px) 100vw, 170vw"
              className="h-auto w-[170%] max-w-none sm:w-full"
            />
          </div>
          <figcaption className="border-t border-[var(--line)] bg-white px-4 py-2.5 text-[13.5px] text-[var(--ink-3)]">{current.label}, sur un livre d’exemple.</figcaption>
        </figure>
      </div>

      <div className="mt-6 flex justify-end">
        <Button href={`tel:${SITE.phone}`} variant="secondary">
          Essayer Loomina gratuitement
        </Button>
      </div>
    </Section>
  );
}
