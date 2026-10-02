import Button from "@/components/ui/Button";

/** Bandeau d'appel final, sombre. Utilisé en bas des pages marketing. */
export default function CtaBand({
  title = "Une vie entière,",
  accent = "racontée de vive voix.",
  text = "Commencez aujourd’hui : le premier appel suffit pour que l’histoire prenne forme.",
  primary = { href: "/order", label: "Commander mon livre" },
  secondary = { href: "/experience", label: "Découvrir l’expérience" },
}: {
  title?: string;
  accent?: string;
  text?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string } | null;
}) {
  return (
    <section className="w-full px-5 pb-24 sm:px-6 md:pb-32">
      <div className="paper-grain reveal relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-[var(--ink)] px-7 py-16 text-center sm:px-12 md:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(212,176,106,0.22),transparent_70%)]"
        />
        <div className="relative">
          <h2 className="mx-auto max-w-3xl font-serif text-[clamp(2.1rem,4.5vw,3.75rem)] leading-[1.05] tracking-[-0.03em] text-[var(--loomina-void)]">
            {title} <em className="text-[var(--loomina-gold-light)]">{accent}</em>
          </h2>
          <p className="mx-auto mt-5 max-w-xl font-sans text-[17px] leading-relaxed text-[#cfc8bb]">{text}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              href={primary.href}
              variant="primary"
              size="lg"
              className="w-full !bg-[var(--loomina-void)] !text-[var(--ink)] hover:!bg-white sm:w-auto"
            >
              {primary.label}
            </Button>
            {secondary && (
              <Button
                href={secondary.href}
                variant="ghost"
                size="lg"
                className="w-full !text-[#e9e3d8] hover:!bg-white/10 hover:!text-white sm:w-auto"
              >
                {secondary.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
