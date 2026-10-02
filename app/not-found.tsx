import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="flex min-h-[70svh] w-full items-center px-5 pt-28 pb-20 sm:px-6">
      <div className="rise mx-auto max-w-2xl text-center">
        <p className="eyebrow">Erreur 404</p>
        <h1 className="heading-display mt-4">
          Cette page manque <em className="text-[var(--gold-ink)]">au récit.</em>
        </h1>
        <p className="mx-auto mt-6 max-w-md font-sans text-lg leading-relaxed text-[var(--text-secondary)]">
          L’adresse est introuvable, mais votre histoire, elle, est toujours là.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/" variant="primary" size="lg">
            Retour à l’accueil
          </Button>
          <Button href="/contact" variant="secondary" size="lg">
            Nous écrire
          </Button>
        </div>
      </div>
    </section>
  );
}
