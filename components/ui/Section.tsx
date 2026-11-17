import type { ReactNode } from "react";
import Icon, { type IconName } from "@/components/ui/Icon";

/** Conteneur de section : largeur, gouttières et rythme vertical communs. */
export function Section({
  id,
  children,
  className = "",
  size = "md",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const pad = { sm: "py-14 md:py-20", md: "py-20 md:py-32", lg: "py-24 md:py-40" }[size];
  return (
    <section id={id} className={`w-full scroll-mt-28 ${pad} ${className}`}>
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
      {text && <p className={`t-lead mt-5 ${align === "center" ? "mx-auto" : ""} max-w-xl`}>{text}</p>}
    </div>
  );
}

/** En-tête de page, sous le menu flottant. */
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
    <section className="w-full pb-8 pt-32 md:pb-12 md:pt-40">
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-6">
        <SectionHead as="h1" eyebrow={eyebrow} title={title} text={text} className="rise" />
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
