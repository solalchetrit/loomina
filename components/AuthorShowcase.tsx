"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { Section, SectionHead } from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import { SITE } from "@/config/site";

/**
 * Les deux espaces de Loomina dans un seul module (Solal, 26/11/2026) :
 * un petit sélecteur « Espace auteur » / « Espace famille », puis pour chacun
 * une phrase, trois points et un seul écran. Volontairement léger : la
 * première version, avec quatre onglets par espace, était trop lourde.
 * Les écrans reprennent l'espace réel, sur le livre d'exemple de Jeanne
 * (personne fictive, présentée comme telle).
 */
type SpaceId = "auteur" | "famille";

const SPACES: Record<SpaceId, { label: string; who: string; lead: string; points: string[]; url: string; alt: string }> = {
  auteur: {
    label: "Espace auteur",
    who: "Pour celui qui raconte",
    lead: "Après chaque appel, il retrouve son livre en ligne.",
    points: ["Il lit chaque chapitre, mis en page comme dans le livre.", "Il corrige un passage, ou demande à Loomina de le faire.", "Il choisit le sujet du prochain appel."],
    url: "loomina.eu/espace-auteur",
    alt: "Un chapitre dans l’espace auteur, mis en page comme un livre, avec le bouton « Corriger ce chapitre »",
  },
  famille: {
    label: "Espace famille",
    who: "Pour celui qui offre",
    lead: "Il suit le livre et y participe, sans déranger l’auteur.",
    points: ["Il voit le livre avancer, appel après appel.", "Il pose une question, que Loomina glisse dans un prochain appel.", "Il commande un exemplaire pour chaque membre de la famille."],
    url: "loomina.eu/espace-famille",
    alt: "L’espace famille : le suivi du livre de Jeanne et la carte pour poser une question",
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

      <div className="head-gap card overflow-hidden" data-reveal>
        <div className="grid lg:grid-cols-[1fr_1.1fr]">
          <div className="p-6 sm:p-9 lg:p-11">
            {/* Le sélecteur : deux boutons côte à côte. */}
            <div role="tablist" aria-label="Les deux espaces" className="inline-grid w-full max-w-[26rem] grid-cols-2 gap-1 rounded-full bg-[var(--surface-2)] p-1">
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

            <div id={`${id}-espace`} role="tabpanel">
              <p className="mt-8 text-[15px] font-bold text-[var(--amber-ink)]">{current.who}</p>
              <p className="mt-2 text-[clamp(1.4rem,2.2vw,1.75rem)] font-extrabold leading-[1.2] tracking-[-0.025em] text-[var(--ink)]">{current.lead}</p>
              <ul className="mt-6 space-y-3.5">
                {current.points.map((point) => (
                  <li key={point} className="flex gap-3 text-[17px] leading-snug text-[var(--ink-2)]">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--amber)] text-[var(--ink)]">
                      <Icon name="check" size={14} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <Button href={`tel:${SITE.phone}`} variant="secondary" className="mt-8">
                Essayer Loomina gratuitement
              </Button>
            </div>
          </div>

          {/* L'écran de l'espace choisi, dans un cadre de navigateur. */}
          <figure className="flex flex-col bg-[var(--canvas)] p-3 lg:m-3 lg:rounded-[20px] lg:p-0">
            <div className="flex items-center gap-2 rounded-t-[18px] border-b border-[var(--line)] bg-white px-4 py-3 lg:rounded-t-[20px]" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--line)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--line)]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--line)]" />
              <span className="ml-3 truncate rounded-full bg-[var(--canvas)] px-3 py-1 text-[13px] text-[var(--ink-3)]">{current.url}</span>
            </div>
            <div role="img" aria-label={current.alt} className="flex h-[400px] items-start justify-center overflow-hidden px-4 pt-5 sm:h-[440px] sm:px-8 sm:pt-7 [mask-image:linear-gradient(to_bottom,#000_82%,transparent)]">
              <div className="w-full max-w-[520px]">{space === "auteur" ? <ChapterScreen /> : <FamilyScreen />}</div>
            </div>
            <figcaption className="px-4 pb-3 pt-1 text-[13.5px] text-[var(--ink-3)] lg:px-6 lg:pb-4">Sur un livre d’exemple.</figcaption>
          </figure>
        </div>
      </div>
    </Section>
  );
}

/** L'espace famille, comme dans l'espace réel (components/author/FamilySpace.tsx) : le suivi, puis la question. */
function FamilyScreen() {
  return (
    <div aria-hidden="true">
      <p className="px-1 text-[21px] font-extrabold tracking-[-0.03em] text-[var(--ink)]">Bonjour Claire</p>
      <p className="px-1 text-[15px] text-[var(--ink-2)]">Le livre de Jeanne</p>
      <div className="mt-3 rounded-[18px] bg-white p-5">
        <p className="text-[18px] font-extrabold tracking-[-0.02em]">La jeunesse</p>
        <div className="mt-3 grid grid-cols-3 gap-4">
          <div>
            <p className="text-[14px] text-[var(--ink-3)]">Appels</p>
            <p className="mt-1 text-[26px] font-extrabold leading-none tracking-[-0.03em] tabular-nums">6</p>
          </div>
          <div>
            <p className="text-[14px] text-[var(--ink-3)]">Récits</p>
            <p className="mt-1 text-[26px] font-extrabold leading-none tracking-[-0.03em] tabular-nums">5</p>
          </div>
          <div>
            <p className="text-[14px] text-[var(--ink-3)]">Dernier appel</p>
            <p className="mt-1 text-[15px] font-bold leading-snug">18 novembre</p>
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-[18px] bg-white p-5">
        <p className="text-[18px] font-extrabold leading-snug tracking-[-0.02em]">Poser une question ou souffler un souvenir</p>
        <div className="mt-3 rounded-[14px] border border-[var(--line)] bg-[var(--canvas)] px-4 py-3 text-[16px] text-[var(--ink)]">Comment as-tu rencontré papa ?</div>
        <span className="mt-3 inline-flex min-h-11 items-center rounded-full bg-[var(--ink)] px-5 text-[16px] font-bold text-white">Envoyer à Loomina</span>
      </div>
    </div>
  );
}

/** Le chapitre tel qu'on le lit dans l'espace auteur : la mise en page du livre imprimé. */
function ChapterScreen() {
  return (
    <div className="w-full rounded-[18px] bg-white px-6 pb-6 pt-8 sm:px-9" aria-hidden="true">
      <div
        className="text-[#1d1b19]"
        style={{
          fontFamily: '"Times New Roman", Times, "Liberation Serif", serif',
        }}
        lang="fr"
      >
        <p className="text-center text-[16px]">Chapitre 1</p>
        <p className="mt-1.5 text-center text-[18px] italic">
          La maison de la rue des Tilleuls
        </p>
        <div className="mt-7 space-y-3 hyphens-auto text-justify text-[16px] leading-[1.4]">
          <p>
            Je suis née en 1948 à Rennes, dans une maison étroite de la rue des
            Tilleuls, la troisième d’une fratrie de quatre. On y entrait par la
            cuisine, toujours chaude, où ma mère faisait chanter la radio en
            épluchant les légumes.
          </p>
          <p className="!mt-4 font-bold">Les trains du dimanche</p>
          <p>
            Mon père était cheminot. Il partait avant le jour et rentrait avec
            l’odeur du charbon sur sa veste. Le dimanche, il nous emmenait voir
            passer les trains depuis le pont de la gare, et il connaissait
            chacun par son heure.
          </p>
          <p>
            De cette maison, je garde surtout le bruit : les pas dans l’escalier
            de bois, les disputes de mes frères, le poste de radio.
          </p>
        </div>
        <p className="mt-6 text-right text-[14px]">9</p>
      </div>
      <div className="mt-5 border-t border-[var(--line-soft)] pt-5">
        <span className="inline-flex min-h-11 items-center rounded-full px-5 text-[16px] font-bold shadow-[inset_0_0_0_1px_var(--line)]">
          Corriger ce chapitre
        </span>
      </div>
    </div>
  );
}
