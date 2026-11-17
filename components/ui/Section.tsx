import type { ReactNode } from "react";
import Icon, { type IconName } from "@/components/ui/Icon";
import Photo from "@/components/ui/Photo";

/** Conteneur de section : largeur, gouttières et rythme vertical communs (voir « Rythme vertical » dans globals.css). */
export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`section-y w-full scroll-mt-28 ${className}`}>
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-6">{children}</div>
    </section>
  );
}

/** Tête de section : titre gras, texte d'introduction, petit titre optionnel. */
export function SectionHead({
  eyebrow,
  title,
  text,
  as: Tag = "h2",
  align = "left",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  text?: ReactNode;
  as?: "h1" | "h2";
  align?: "left" | "center";
  className?: string;
}) {
  const center = align === "center" ? "mx-auto text-center" : "";
  return (
    <div className={`max-w-2xl ${center} ${className}`} data-reveal={Tag === "h2" ? "" : undefined}>
      {eyebrow && <p className="t-eyebrow">{eyebrow}</p>}
      <Tag className={`${eyebrow ? "mt-3" : ""} ${Tag === "h1" ? "t-display" : "t-title"}`}>{title}</Tag>
      {text && <p className={`t-lead mt-4 md:mt-5 ${align === "center" ? "mx-auto" : ""} max-w-xl`}>{text}</p>}
    </div>
  );
}

/**
 * En-tête de page, sous le menu flottant.
 * Avec une photo : le titre à gauche, la photo entière à droite, dans son format d'origine.
 * L'ensemble reste assez bas pour que la section suivante se devine sans défiler.
 */
export function PageHeader({
  eyebrow,
  title,
  text,
  photo,
  actions,
  badge,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  text?: ReactNode;
  /** `ratio` : le format de la photo elle-même, pour ne pas la recadrer (par défaut 3/2). */
  photo?: { name: string; alt: string; focus?: string; ratio?: string };
  /** Boutons et repères sous le texte d'introduction. */
  actions?: ReactNode;
  /** Vignette posée sur le coin de la photo : elle relie l'image au service. */
  badge?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="page-top w-full">
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-6">
        {photo ? (
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-16">
            <div className="min-w-0">
              <SectionHead as="h1" eyebrow={eyebrow} title={title} text={text} className="rise text-balance" />
              {actions && <div className="rise mt-8">{actions}</div>}
            </div>
            <div className="rise relative min-w-0 pb-6 sm:pl-6">
              <Photo
                name={photo.name}
                alt={photo.alt}
                focus={photo.focus}
                priority
                ratio={photo.ratio ?? "aspect-[3/2]"}
                sizes="(min-width: 1024px) 540px, 100vw"
                className="w-full"
              />
              {badge && <div className="absolute bottom-0 left-3 sm:left-0">{badge}</div>}
            </div>
          </div>
        ) : (
          <SectionHead as="h1" eyebrow={eyebrow} title={title} text={text} className="rise !max-w-4xl" />
        )}
        {children}
      </div>
    </section>
  );
}

/** Étapes d'un parcours, en cartes numérotées : le contenu est une vraie suite. */
export function Steps({
  items,
  className = "",
}: {
  items: { icon: IconName; title: ReactNode; text: ReactNode; preview?: ReactNode }[];
  className?: string;
}) {
  return (
    <ol className={`grid gap-8 md:grid-cols-3 md:gap-4 ${className}`} data-reveal>
      {items.map((it, i) => (
        <li key={i} className="flex flex-col">
          {/* Le numéro d'étape au-dessus de la carte, relié aux suivantes par un trait. */}
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-[18px] font-extrabold text-white">
              {i + 1}
            </span>
            <span className="text-[17px] font-bold text-[var(--ink)]">Étape {i + 1}</span>
            {i < items.length - 1 && <span aria-hidden="true" className="ml-2 hidden h-[2px] flex-1 rounded bg-[var(--line)] md:block" />}
          </div>
          <div className="card flex flex-1 flex-col p-3">
            {it.preview && (
              <div aria-hidden="true" className="flex h-40 items-center justify-center overflow-hidden rounded-[18px] bg-[var(--canvas)] px-5">
                {it.preview}
              </div>
            )}
            <div className="p-4 pt-5 md:p-5">
              <span className="chip-icon">
                <Icon name={it.icon} />
              </span>
              <h3 className="t-heading mt-5">{it.title}</h3>
              <div className="t-body mt-2">{it.text}</div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Liste cochée : titre en gras, détail à la suite. */
export function CheckList({
  items,
  className = "",
}: {
  items: { title: ReactNode; detail?: ReactNode }[];
  className?: string;
}) {
  return (
    <ul className={`divide-y divide-[var(--line-soft)] ${className}`}>
      {items.map((it, i) => (
        <li key={i} className="flex gap-3 py-3.5">
          <Icon name="check" className="mt-[3px] shrink-0 text-[var(--amber-ink)]" />
          <span className="text-[17px] leading-snug text-[var(--ink-2)]">
            <b className="font-bold text-[var(--ink)]">{it.title}</b>
            {it.detail && <>, {it.detail}</>}
          </span>
        </li>
      ))}
    </ul>
  );
}
