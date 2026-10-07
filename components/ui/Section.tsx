import type { ReactNode } from "react";

/** Conteneur de section : largeur, gouttières et rythme vertical communs. */
export function Section({
  id,
  children,
  className = "",
  tone = "default",
  size = "md",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: "default" | "alt";
  size?: "sm" | "md" | "lg";
}) {
  const pad = { sm: "py-14 md:py-20", md: "py-20 md:py-28", lg: "py-24 md:py-32" }[size];
  const bg = tone === "alt" ? "bg-[var(--paper-deep)]" : "";
  return (
    <section id={id} className={`relative w-full scroll-mt-24 ${pad} ${bg} ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">{children}</div>
    </section>
  );
}

/**
 * Tête de section « ouverture de chapitre » : surtitre en petites capitales,
 * titre serif aligné à gauche, court filet or. C'est la signature du site.
 */
export function SectionHead({
  eyebrow,
  title,
  text,
  as: Tag = "h2",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  text?: ReactNode;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={`max-w-2xl ${className}`}>
      {eyebrow && <p className="t-eyebrow">{eyebrow}</p>}
      <Tag className={`${eyebrow ? "mt-4" : ""} ${Tag === "h1" ? "t-display" : "t-title"}`}>{title}</Tag>
      <span aria-hidden="true" className="gold-dash mt-6" />
      {text && <p className="t-lead mt-6 max-w-xl">{text}</p>}
    </div>
  );
}

/** En-tête de page, sous le header fixe. Même signature, plus d'air. */
export function PageHeader({
  eyebrow,
  title,
  text,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  text?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative w-full pt-28 pb-10 md:pt-40 md:pb-14">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="rise">
          <SectionHead as="h1" eyebrow={eyebrow} title={title} text={text} />
        </div>
        {children}
      </div>
    </section>
  );
}

/**
 * Liste numérotée éditoriale : numéro serif dans la marge, titre, texte.
 * Remplace les grilles de cartes.
 */
export function Numbered({
  items,
  start = 1,
  className = "",
}: {
  items: { title: ReactNode; text: ReactNode }[];
  start?: number;
  className?: string;
}) {
  return (
    <ol className={`rule-top ${className}`}>
      {items.map((it, i) => (
        <li
          key={i}
          className="grid gap-2 border-b border-[var(--rule)] py-7 sm:grid-cols-[4rem_1fr] sm:gap-6 md:py-9"
        >
          <span className="t-numeral text-[34px] leading-none md:text-[40px]" aria-hidden="true">
            {start + i}
          </span>
          <div>
            <h3 className="t-heading">
              <span className="sr-only">{start + i}. </span>
              {it.title}
            </h3>
            <div className="t-body mt-3 max-w-2xl">{it.text}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Liste à filets : titre en gras, détail dessous. */
export function RuledList({
  items,
  className = "",
}: {
  items: { title: ReactNode; detail?: ReactNode }[];
  className?: string;
}) {
  return (
    <ul className={`rule-top ${className}`}>
      {items.map((it, i) => (
        <li key={i} className="border-b border-[var(--rule)] py-4">
          <span className="block font-sans text-[17px] font-semibold text-[var(--ink)]">{it.title}</span>
          {it.detail && <span className="t-body mt-0.5 block">{it.detail}</span>}
        </li>
      ))}
    </ul>
  );
}
