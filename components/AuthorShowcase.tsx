"use client";

import { useState } from "react";
import Image from "next/image";
import Icon, { type IconName } from "@/components/ui/Icon";
import { Section, SectionHead } from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import { SITE } from "@/config/site";
import { EXTRA_COPY, extraCopiesLabel } from "@/config/offer";

/**
 * Les deux espaces de Loomina dans un seul module (Solal, 26/11/2026) :
 * deux boutons en haut, « Espace auteur » et « Espace famille », puis pour
 * chacun ce qu'il permet, avec l'écran correspondant.
 * Espace auteur : de vraies captures, prises sur le livre d'exemple de Jeanne
 * (personne fictive, présentée comme telle). Espace famille : les cartes de
 * l'espace (components/author/FamilySpace.tsx), redessinées sur le même exemple.
 */
type Feature = {
  id: string;
  icon: IconName;
  title: string;
  text: string;
  alt: string;
  image?: { src: string; w: number; h: number };
};

type SpaceId = "auteur" | "famille";

const SPACES: Record<SpaceId, { label: string; who: string; intro: string; url: string; features: Feature[] }> = {
  auteur: {
    label: "Espace auteur",
    who: "Pour celui qui raconte",
    intro: "Après chaque appel, l’auteur retrouve son livre en ligne. Il lit, il corrige, il oriente la suite. Loomina écrit, il garde la main.",
    url: "loomina.eu/espace-auteur",
    features: [
      {
        id: "chapitre",
        icon: "book",
        title: "Lire chaque chapitre, comme dans le livre",
        text: "Après chaque appel, le récit est écrit et le livre se recompose, mis en page. On corrige un passage soi-même, ou on demande à Loomina de le faire.",
        alt: "Un chapitre dans l’espace auteur, mis en page comme un livre, avec le bouton « Corriger ce chapitre »",
      },
      {
        id: "style",
        icon: "pen",
        title: "Choisir le ton de l’écriture",
        text: "Naturel et sobre, chaleureux, littéraire, ou simple comme on parle. Le titre du livre, le « tu » ou le « vous » : c’est l’auteur qui décide.",
        alt: "Les réglages du livre : titre et ton de l’écriture",
        image: { src: "/espace-auteur/style.webp", w: 1036, h: 1118 },
      },
      {
        id: "sujet",
        icon: "phone",
        title: "Préparer le prochain appel",
        text: "On voit par quoi Loomina compte commencer, et on peut lui souffler un souvenir à ne pas oublier.",
        alt: "La carte « Suggérer un sujet » et les questions que Loomina garde en tête",
        image: { src: "/espace-auteur/sujet.webp", w: 1132, h: 1236 },
      },
      {
        id: "frise",
        icon: "user",
        title: "Voir sa vie prendre forme",
        text: "Les dates, les lieux et les personnes évoqués se rangent dans une frise. Une erreur ? Elle se corrige au prochain appel.",
        alt: "La frise de vie : les grandes dates retenues par Loomina",
        image: { src: "/espace-auteur/frise.webp", w: 1200, h: 1113 },
      },
    ],
  },
  famille: {
    label: "Espace famille",
    who: "Pour ses proches",
    intro: "Celui qui offre le livre a son propre espace. Il suit l’avancée, pose ses questions et prépare les exemplaires de la famille, sans déranger l’auteur.",
    url: "loomina.eu/espace-famille",
    features: [
      {
        id: "suivi",
        icon: "clock",
        title: "Suivre le livre, appel après appel",
        text: "Le nombre d’appels, les récits déjà écrits, la date du dernier appel : vous savez où en est le livre sans avoir à demander.",
        alt: "La carte de suivi de l’espace famille : 6 appels, 5 récits, dernier appel le 18 novembre",
      },
      {
        id: "question",
        icon: "heart",
        title: "Poser une question, souffler un souvenir",
        text: "Une histoire que vous aimeriez lire, une question jamais posée : Loomina en parle à votre proche au bon moment du récit.",
        alt: "La carte « Poser une question ou souffler un souvenir », avec une question en attente",
      },
      {
        id: "recits",
        icon: "book",
        title: "Lire les récits, s’il le veut bien",
        text: "Les récits restent entre l’auteur et Loomina. C’est lui qui choisit, depuis son espace, de les partager avec vous.",
        alt: "La liste des récits partagés par l’auteur, avec leurs titres et leurs dates",
      },
      {
        id: "exemplaires",
        icon: "gift",
        title: "Prévoir un livre pour chacun",
        text: "Ajoutez des exemplaires pour les enfants et les petits-enfants. Ils sont imprimés et envoyés avec le livre de l’auteur.",
        alt: "La carte « Les livres prévus » : 3 livres, dont 2 exemplaires en plus",
      },
    ],
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
  const [active, setActive] = useState(0);
  const current = SPACES[space];
  const feature = current.features[active];

  const choose = (next: SpaceId) => {
    setSpace(next);
    setActive(0);
  };

  return (
    <Section id={id} className={className}>
      <SectionHead
        eyebrow="Inclus avec chaque livre"
        title={"Deux espaces en ligne\u00a0: un pour l’auteur, un pour sa famille"}
        text="Le livre se construit sous vos yeux. Celui qui raconte relit et corrige. Ses proches suivent et participent."
      />

      {/* Les deux boutons : on choisit l'espace à regarder. */}
      <div className="head-gap" data-reveal>
        <div role="tablist" aria-label="Les deux espaces" className="grid grid-cols-2 gap-2 rounded-[26px] bg-[var(--surface-2)] p-2">
          {ORDER.map((key) => {
            const on = key === space;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls={`${id}-espace`}
                onClick={() => choose(key)}
                className={`press flex items-center gap-3 rounded-[20px] px-3 py-3 text-left sm:gap-4 sm:px-5 sm:py-4 transition-colors ${
                  on ? "bg-[var(--ink)] text-white shadow-[var(--shadow-bar)]" : "text-[var(--ink)] hover:bg-white"
                }`}
              >
                <span className={`hidden h-11 w-11 shrink-0 items-center min-[420px]:flex justify-center rounded-[14px] ${on ? "bg-[var(--amber)] text-[var(--ink)]" : "bg-white text-[var(--ink)]"}`}>
                  <Icon name={key === "auteur" ? "pen" : "heart"} />
                </span>
                <span>
                  <span className="block text-[17px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[19px]">{SPACES[key].label}</span>
                  <span className={`mt-0.5 block text-[14px] leading-snug sm:text-[15px] ${on ? "text-[#cfcfc8]" : "text-[var(--ink-2)]"}`}>{SPACES[key].who}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div id={`${id}-espace`} role="tabpanel" className="mt-6">
          <p className="max-w-2xl text-[17px] leading-relaxed text-[var(--ink-2)]">{current.intro}</p>

          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_1.25fr] lg:gap-10">
            <ul className="flex flex-col gap-3" aria-label={`Ce que permet l’${current.label.toLowerCase()}`}>
              {current.features.map((f, i) => {
                const on = i === active;
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setActive(i)}
                      className={`press flex w-full gap-4 rounded-[var(--radius-card)] border p-5 text-left transition-colors md:p-6 ${
                        on
                          ? "border-[var(--ink)] bg-white shadow-[var(--shadow-bar)]"
                          : "border-[var(--line)] bg-transparent hover:border-[var(--ink-3)]"
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
                    {/* Sur téléphone, l'écran s'affiche sous la ligne ouverte. */}
                    {on && (
                      <div className="mt-3 lg:hidden">
                        <Screen feature={f} url={current.url} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="hidden lg:sticky lg:top-32 lg:block">
              <Screen feature={feature} url={current.url} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="t-small">Écrans des deux espaces, sur un livre d’exemple.</p>
        <Button href={`tel:${SITE.phone}`} variant="secondary" className="shrink-0">
          Essayer Loomina gratuitement
        </Button>
      </div>
    </Section>
  );
}

/** Un écran dans un cadre de navigateur, pour qu'on comprenne qu'il s'agit d'un espace en ligne. */
function Screen({ feature, url }: { feature: Feature; url: string }) {
  return (
    <figure className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--canvas)] shadow-[var(--shadow-bar)]">
      <div className="flex items-center gap-2 border-b border-[var(--line)] bg-white px-4 py-3" aria-hidden="true">
        <span className="h-3 w-3 rounded-full bg-[var(--line)]" />
        <span className="h-3 w-3 rounded-full bg-[var(--line)]" />
        <span className="h-3 w-3 rounded-full bg-[var(--line)]" />
        <span className="ml-3 truncate rounded-full bg-[var(--canvas)] px-3 py-1 text-[13px] text-[var(--ink-3)]">{url}</span>
      </div>
      <div className="flex max-h-[560px] min-h-[320px] items-start justify-center overflow-hidden p-4 sm:p-6">
        {feature.image ? (
          <Image src={feature.image.src} alt={feature.alt} width={feature.image.w} height={feature.image.h} className="h-auto w-full max-w-[560px] rounded-[18px]" />
        ) : (
          <div role="img" aria-label={feature.alt} className="w-full max-w-[560px]">
            {feature.id === "chapitre" && <ChapterScreen />}
            {feature.id === "suivi" && <FollowScreen />}
            {feature.id === "question" && <QuestionScreen />}
            {feature.id === "recits" && <StoriesScreen />}
            {feature.id === "exemplaires" && <CopiesScreen />}
          </div>
        )}
      </div>
      <figcaption className="sr-only">{feature.title}</figcaption>
    </figure>
  );
}

/** Une carte de l'espace famille, comme dans l'espace réel. */
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[18px] bg-white p-5 sm:p-6" aria-hidden="true">
      <p className="text-[19px] font-extrabold leading-snug tracking-[-0.02em] text-[var(--ink)]">{title}</p>
      {children}
    </div>
  );
}

function Hello() {
  return (
    <div className="mb-3 px-1" aria-hidden="true">
      <p className="text-[22px] font-extrabold tracking-[-0.03em] text-[var(--ink)]">Bonjour Claire</p>
      <p className="text-[15px] text-[var(--ink-2)]">Le livre de Jeanne</p>
    </div>
  );
}

/** Suivi : la phase en cours, les appels, les récits, le prochain appel. */
function FollowScreen() {
  return (
    <>
      <Hello />
      <Panel title="La jeunesse">
        <div className="mt-4 grid grid-cols-3 gap-4">
          {[
            ["Appels", "6"],
            ["Récits", "5"],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-[14px] text-[var(--ink-3)]">{k}</p>
              <p className="mt-1 text-[28px] font-extrabold leading-none tracking-[-0.03em] tabular-nums">{v}</p>
            </div>
          ))}
          <div>
            <p className="text-[14px] text-[var(--ink-3)]">Dernier appel</p>
            <p className="mt-1 text-[16px] font-bold leading-snug">18 novembre</p>
          </div>
        </div>
        <p className="mt-5 text-[16px] leading-relaxed text-[var(--ink-2)]">Loomina appelle Jeanne le lundi et le jeudi à 10 h.</p>
      </Panel>
      <div className="mt-3 rounded-[18px] bg-white p-5 sm:p-6" aria-hidden="true">
        <p className="text-[14px] font-bold text-[var(--ink-3)]">Les étapes du livre</p>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {["Terminé", "Relu", "À l’impression", "Expédié", "Reçu"].map((label) => (
            <div key={label} className="min-w-0">
              <span className="block h-1.5 rounded-full bg-[var(--line)]" />
              <span className="mt-2 block truncate text-[13px] text-[var(--ink-3)]">{label}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink-2)]">Quand le récit est complet, vous êtes prévenu par SMS à chaque étape.</p>
      </div>
    </>
  );
}

/** La question de la famille, et ce que Loomina garde en tête. */
function QuestionScreen() {
  return (
    <>
      <Hello />
      <Panel title="Poser une question ou souffler un souvenir">
        <p className="mt-1 text-[16px] leading-relaxed text-[var(--ink-2)]">Loomina en parlera à Jeanne au moment du récit où il a sa place.</p>
        <div className="mt-4 rounded-[14px] border border-[var(--line)] bg-[var(--canvas)] px-4 py-3 text-[16px] text-[var(--ink)]">
          Comment as-tu rencontré papa ?
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="inline-flex min-h-11 items-center rounded-full bg-[var(--ink)] px-5 text-[16px] font-bold text-white">Envoyer à Loomina</span>
        </div>
        <div className="mt-5 border-t border-[var(--line-soft)] pt-4">
          <p className="text-[15px] font-bold text-[var(--ink-3)]">Ce que Loomina garde en tête</p>
          <ul className="mt-2 space-y-2 text-[16px] text-[var(--ink)]">
            <li className="flex gap-2.5">
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--amber)]" />
              Le bal du 14 juillet à Rennes
            </li>
            <li className="flex gap-2.5">
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--amber)]" />
              Le premier voyage en Espagne, en 2 CV
            </li>
          </ul>
        </div>
      </Panel>
    </>
  );
}

/** Les récits, quand l'auteur a choisi de les partager. */
function StoriesScreen() {
  const stories: [string, string][] = [
    ["La maison de la rue des Tilleuls", "4 novembre"],
    ["Les trains du dimanche", "7 novembre"],
    ["L’école des filles", "11 novembre"],
    ["Le bal du 14 juillet", "14 novembre"],
  ];
  return (
    <>
      <Hello />
      <Panel title="Les récits">
        <p className="mt-1 text-[16px] leading-relaxed text-[var(--ink-2)]">Jeanne a choisi de vous laisser lire ses récits.</p>
        <ul className="mt-4 divide-y divide-[var(--line-soft)]">
          {stories.map(([title, date], i) => (
            <li key={title} className="py-3.5">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-serif text-[19px] italic text-[var(--ink)]">{title}</span>
                <span className="shrink-0 text-[14px] text-[var(--ink-3)]">{date}</span>
              </div>
              {i === 0 && (
                <p className="mt-2.5 text-[15.5px] leading-[1.5] text-[var(--ink-2)]" style={{ fontFamily: '"Times New Roman", Times, "Liberation Serif", serif' }}>
                  Je suis née en 1948 à Rennes, dans une maison étroite de la rue des Tilleuls, la troisième d’une fratrie de quatre.
                </p>
              )}
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}

/** Les exemplaires de la famille. */
function CopiesScreen() {
  return (
    <>
      <Hello />
      <Panel title="Les livres prévus">
        <p className="mt-2 flex items-baseline gap-2">
          <span className="text-[40px] font-extrabold leading-none tracking-[-0.03em] tabular-nums">3</span>
          <span className="text-[16px] text-[var(--ink-2)]">livres imprimés</span>
        </p>
        <ul className="mt-4 divide-y divide-[var(--line-soft)] text-[16px]">
          <li className="flex items-center justify-between gap-4 py-3">
            <span className="font-semibold">Le livre de Jeanne</span>
            <span className="text-[var(--ink-3)]">Compris</span>
          </li>
          <li className="flex items-center justify-between gap-4 py-3">
            <span className="font-semibold">{extraCopiesLabel(2)}</span>
            <span className="tabular-nums text-[var(--ink-3)]">{2 * EXTRA_COPY.price} €</span>
          </li>
        </ul>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 items-center gap-4 rounded-full px-4 text-[17px] font-bold shadow-[inset_0_0_0_1px_var(--line)]">
            <span>−</span>
            <span className="tabular-nums">1</span>
            <span>+</span>
          </span>
          <span className="inline-flex min-h-11 items-center rounded-full bg-[var(--ink)] px-5 text-[16px] font-bold text-white">Commander</span>
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink-2)]">{EXTRA_COPY.price} € l’exemplaire. Même livre, imprimé et envoyé avec celui de Jeanne.</p>
      </Panel>
    </>
  );
}

/** Le chapitre tel qu'on le lit dans l'espace auteur : la mise en page du livre imprimé. */
function ChapterScreen() {
  return (
    <div className="w-full max-w-[560px] rounded-[18px] bg-white px-6 pb-6 pt-9 sm:px-10" aria-hidden="true">
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
