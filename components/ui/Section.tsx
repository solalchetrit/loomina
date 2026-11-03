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
  const pad = { sm: "py-12 md:py-16", md: "py-16 md:py-24", lg: "py-20 md:py-28" }[size];
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
    <div className={`max-w-2xl ${center} ${className}`}>
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
  items: { icon: IconName; title: ReactNode; text: ReactNode }[];
  className?: string;
}) {
  return (
    <ol className={`grid gap-4 md:grid-cols-3 ${className}`}>
      {items.map((it, i) => (
        <li key={i} className="card p-7 md:p-8">
          <div className="flex items-center justify-between">
            <span className="chip-icon">
              <Icon name={it.icon} />
            </span>
            <span className="text-[15px] font-bold text-[var(--ink-3)]">
              <span className="sr-only">Étape </span>
              {i + 1}
            </span>
          </div>
          <h3 className="t-heading mt-6">{it.title}</h3>
          <div className="t-body mt-2">{it.text}</div>
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
