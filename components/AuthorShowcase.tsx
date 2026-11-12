"use client";

import { useState } from "react";
import Image from "next/image";
import Icon, { type IconName } from "@/components/ui/Icon";
import { Section, SectionHead } from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import { SITE } from "@/config/site";

/**
 * L'espace auteur, montré tel qu'il est : de vraies captures de l'espace,
 * prises sur le livre d'exemple de Jeanne (personne fictive, présentée comme telle).
 */
const FEATURES: { id: string; icon: IconName; title: string; text: string; image: string; alt: string; w: number; h: number }[] = [
  {
    id: "chapitre",
    icon: "book",
    title: "Lire chaque chapitre, comme dans le livre",
    text: "Quelques minutes après l’appel, le chapitre est là, mis en page. Vous pouvez le corriger vous-même, ou demander à Loomina de le faire.",
    image: "/espace-auteur/chapitre.webp",
    alt: "Un chapitre dans l’espace auteur, mis en page comme un livre, avec le bouton « Corriger ce chapitre »",
    w: 1200,
    h: 1216,
  },
  {
    id: "style",
    icon: "pen",
    title: "Choisir le ton de l’écriture",
    text: "Naturel et sobre, chaleureux, littéraire, ou simple comme vous parlez. Le titre du livre, le « tu » ou le « vous » : c’est vous qui décidez.",
    image: "/espace-auteur/style.webp",
    alt: "Les réglages du livre : titre et ton de l’écriture",
    w: 1036,
    h: 1118,
  },
  {
    id: "sujet",
    icon: "phone",
    title: "Préparer le prochain appel",
    text: "Vous voyez par quoi Loomina compte commencer, et vous pouvez lui souffler un souvenir à ne pas oublier, ou une question de la famille.",
    image: "/espace-auteur/sujet.webp",
    alt: "La carte « Suggérer un sujet » et les questions que Loomina garde en tête",
    w: 1132,
    h: 1236,
  },
  {
    id: "frise",
    icon: "user",
    title: "Voir votre vie prendre forme",
    text: "Les dates, les lieux et les personnes que vous avez évoqués se rangent dans une frise. Une erreur ? Vous la corrigez au prochain appel.",
    image: "/espace-auteur/frise.webp",
    alt: "La frise de vie : les grandes dates retenues par Loomina",
    w: 1200,
    h: 1113,
  },
];

export default function AuthorShowcase({ id = "espace-auteur", className = "" }: { id?: string; className?: string }) {
  const [active, setActive] = useState(0);
  const current = FEATURES[active];

  return (
    <Section id={id} className={className}>
      <SectionHead
        eyebrow="Inclus avec chaque livre"
        title={"Votre espace auteur\u00a0: le livre se construit sous vos yeux"}
        text="Après chaque appel, vous retrouvez votre livre en ligne. Vous lisez, vous corrigez, vous orientez la suite. Loomina écrit, vous gardez la main."
      />

      <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1fr_1.25fr] lg:gap-10" data-reveal>
        <ul className="flex flex-col gap-3" role="tablist" aria-label="Ce que permet l’espace auteur">
          {FEATURES.map((f, i) => {
            const on = i === active;
            return (
              <li key={f.id} role="presentation">
                <button
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls={`${id}-apercu`}
                  onClick={() => setActive(i)}
                  className={`press flex w-full gap-4 rounded-[var(--radius-card)] border p-5 text-left transition-colors md:p-6 ${
                    on ? "border-[var(--ink)] bg-white shadow-[var(--shadow-bar)]" : "border-[var(--line)] bg-transparent hover:border-[var(--ink-3)]"
                  }`}
                >
                  <span className={`chip-icon shrink-0 ${on ? "!bg-[var(--amber)] !text-[var(--ink)]" : ""}`}>
                    <Icon name={f.icon} />
                  </span>
                  <span>
                    <span className="block text-[18px] font-bold leading-snug text-[var(--ink)]">{f.title}</span>
                    <span className={`mt-1.5 block text-[16px] leading-relaxed text-[var(--ink-2)] ${on ? "" : "hidden md:block"}`}>{f.text}</span>
                  </span>
                </button>
                {/* Sur téléphone, la capture s'affiche sous l'onglet ouvert. */}
                {on && (
                  <div className="mt-3 lg:hidden">
                    <Screen feature={f} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div id={`${id}-apercu`} role="tabpanel" className="hidden lg:sticky lg:top-32 lg:block">
          <Screen feature={current} />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="t-small">Captures de l’espace auteur, sur le livre d’exemple de Jeanne, une personne fictive.</p>
        <Button href={`tel:${SITE.phone}`} variant="secondary" className="shrink-0">
          Essayer Loomina gratuitement
        </Button>
      </div>
    </Section>
  );
}

/** Une capture dans un cadre de navigateur, pour qu'on comprenne qu'il s'agit d'un écran. */
function Screen({ feature }: { feature: (typeof FEATURES)[number] }) {
  return (
    <figure className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--canvas)] shadow-[var(--shadow-bar)]">
      <div className="flex items-center gap-2 border-b border-[var(--line)] bg-white px-4 py-3" aria-hidden="true">
        <span className="h-3 w-3 rounded-full bg-[var(--line)]" />
        <span className="h-3 w-3 rounded-full bg-[var(--line)]" />
        <span className="h-3 w-3 rounded-full bg-[var(--line)]" />
        <span className="ml-3 truncate rounded-full bg-[var(--canvas)] px-3 py-1 text-[13px] text-[var(--ink-3)]">loomina.eu/espace-auteur</span>
      </div>
      <div className="flex max-h-[560px] items-start justify-center overflow-hidden p-4 sm:p-6">
        <Image src={feature.image} alt={feature.alt} width={feature.w} height={feature.h} className="h-auto w-full max-w-[560px] rounded-[18px]" />
      </div>
      <figcaption className="sr-only">{feature.title}</figcaption>
    </figure>
  );
}
