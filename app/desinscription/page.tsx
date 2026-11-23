import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import { isOptOutToken } from "@/lib/loomina/optout";

export const metadata: Metadata = {
  title: "Ne plus recevoir nos rappels",
  robots: { index: false, follow: false },
};

/**
 * Le lien en bas des e-mails de relance (paniers abandonnés, fin de la
 * réduction de la démo). Un bouton à confirmer : ouvrir le lien ne suffit
 * pas, les messageries ouvrent parfois les liens toutes seules.
 */
export default async function Desinscription({ searchParams }: { searchParams: Promise<{ t?: string; fait?: string; erreur?: string }> }) {
  const { t, fait, erreur } = await searchParams;
  const valid = isOptOutToken(t);

  return (
    <section className="page-top section-b flex min-h-[70svh] w-full items-center px-5 sm:px-6">
      <div className="rise mx-auto w-full max-w-[1240px]">
        {fait ? (
          <>
            <h1 className="t-display max-w-2xl">C’est noté</h1>
            <p className="t-lead mt-6 max-w-md">Vous ne recevrez plus nos rappels. Si vous avez commandé un livre, les messages qui le concernent continueront d’arriver.</p>
            <div className="mt-10">
              <Button href="/" size="lg">Retour à l’accueil</Button>
            </div>
          </>
        ) : valid ? (
          <>
            <h1 className="t-display max-w-2xl">Ne plus recevoir nos rappels</h1>
            <p className="t-lead mt-6 max-w-md">Nous ne vous écrirons plus au sujet d’une commande commencée ou de votre réduction.</p>
            <form action="/api/desinscription" method="post" className="mt-10">
              <input type="hidden" name="t" value={t} />
              <button className="press inline-flex h-14 items-center rounded-full bg-[var(--ink)] px-7 text-[17px] font-bold text-white">Confirmer</button>
            </form>
          </>
        ) : (
          <>
            <h1 className="t-display max-w-2xl">Ce lien ne fonctionne pas</h1>
            <p className="t-lead mt-6 max-w-md">
              {erreur ? "Un problème nous a empêchés d’enregistrer votre demande." : "Il est incomplet."} Écrivez-nous à contact@loomina.eu et nous arrêterons nos rappels.
            </p>
            <div className="mt-10">
              <Button href="/contact" size="lg">Nous écrire</Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
