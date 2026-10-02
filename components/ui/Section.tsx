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
  const bg = tone === "alt" ? "bg-[var(--loomina-night)]" : "";
  return (
    <section id={id} className={`relative w-full scroll-mt-24 ${pad} ${bg} ${className}`}>
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6">{children}</div>
    </section>
  );
}

/** En-tête de section : surtitre, titre (avec partie en or), texte. */
export function SectionHeading({
  eyebrow,
  title,
  accent,
  text,
  align = "center",
  as: Tag = "h2",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  accent?: ReactNode;
  text?: ReactNode;
  align?: "center" | "left";
  as?: "h1" | "h2";
  className?: string;
}) {
  const center = align === "center";
  return (
    <div className={`reveal ${center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} ${className}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Tag className={`${eyebrow ? "mt-4" : ""} ${Tag === "h1" ? "heading-display" : "heading-section"}`}>
        {title}
        {accent && (
          <>
            {" "}
            <em className="text-[var(--gold-ink)]">{accent}</em>
          </>
        )}
      </Tag>
      {text && (
        <p className={`mt-5 font-sans text-[17px] leading-relaxed text-[var(--text-secondary)] ${center ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
          {text}
        </p>
      )}
    </div>
  );
}

/** En-tête de page (sous le header fixe). */
export function PageHeader({
  eyebrow,
  title,
  accent,
  text,
  children,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  accent?: ReactNode;
  text?: ReactNode;
  children?: ReactNode;
  align?: "center" | "left";
}) {
  return (
    <section className="relative w-full overflow-hidden pt-28 pb-12 md:pt-40 md:pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(212,176,106,0.14),transparent_70%)]"
      />
      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-6">
        <div className={`rise ${align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}`}>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className={`${eyebrow ? "mt-4" : ""} heading-display`}>
            {title}
            {accent && (
              <>
                {" "}
                <em className="text-[var(--gold-ink)]">{accent}</em>
              </>
            )}
          </h1>
          {text && (
            <p className={`mt-6 font-sans text-lg leading-relaxed text-[var(--text-secondary)] ${align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
              {text}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
