import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="flex min-h-[70svh] w-full items-center px-5 pt-28 pb-20 sm:px-8">
      <div className="rise mx-auto w-full max-w-6xl">
        <p className="t-eyebrow">Erreur 404</p>
        <h1 className="t-display mt-4 max-w-2xl">Cette page manque au récit.</h1>
        <span aria-hidden="true" className="gold-dash mt-6" />
        <p className="t-lead mt-6 max-w-md">L’adresse est introuvable. Votre histoire, elle, est toujours là.</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
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
