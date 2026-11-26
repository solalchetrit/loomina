import type { Metadata } from "next";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { isOptOutToken } from "@/lib/loomina/optout";

export const metadata: Metadata = {
  title: "Ne plus recevoir nos e-mails",
  robots: { index: false, follow: false },
};

/**
 * Le module de désinscription (refait le 25/11/2026, demande de Solal).
 * Le lien est en bas des e-mails « en plus » : relances de panier, fin de la
 * réduction de la démo, « Mémo grandit », nouvelles à la famille. Un bouton à
 * confirmer (les messageries ouvrent parfois les liens toutes seules), puis un
 * « Annuler ma désinscription » pour revenir. Les messages essentiels d'une commande
 * (bienvenue, étapes du livre, remboursement) continuent toujours.
 */
export default async function Desinscription({ searchParams }: { searchParams: Promise<{ t?: string; fait?: string; retour?: string; erreur?: string }> }) {
  const { t, fait, retour, erreur } = await searchParams;
  const valid = isOptOutToken(t);
  const state = erreur ? "erreur" : fait ? "fait" : retour ? "retour" : valid ? "confirmer" : "invalide";

  const memo = { confirmer: "/memo/1-h.webp", fait: "/memo/1-g.webp", retour: "/memo/1-c.webp", erreur: "/memo/1-b.webp", invalide: "/memo/1-b.webp" }[state];
  const bubble = {
    confirmer: "Vous voulez qu’on vous écrive moins ? Pas de souci.",
    fait: "C’est noté. À bientôt, peut-être !",
    retour: "Youpi, vous revoilà !",
    erreur: "Oups, quelque chose a coincé.",
    invalide: "Hmm, ce lien est incomplet.",
  }[state];

  return (
    <section className="page-top section-b flex min-h-[70svh] w-full items-center px-5 sm:px-6">
      <div className="rise mx-auto grid w-full max-w-[760px] gap-8">
        <div className="flex items-end gap-4 rounded-[var(--radius-card)] bg-[var(--surface-2)] px-6 pt-6">
          <Image src={memo} alt="Mémo" width={116} height={130} className="h-auto w-[96px] sm:w-[116px]" priority />
          <p className="mb-6 rounded-[18px] rounded-bl-[4px] bg-white px-4 py-3 text-[16px] font-semibold text-[var(--title)] shadow-sm">{bubble}</p>
        </div>

        {state === "confirmer" && (
          <div>
            <h1 className="t-display max-w-2xl">Ne plus recevoir nos e-mails</h1>
            <p className="t-lead mt-5 max-w-xl">Vous ne recevrez plus nos rappels (commande commencée, fin de votre réduction) ni nos nouvelles (Mémo grandit, nouveaux récits de vos proches).</p>
            <p className="mt-3 max-w-xl text-[15px] text-[var(--ink-2)]">Si vous avez commandé un livre, les messages essentiels continuent : bienvenue, étapes du livre jusqu’à sa livraison, remboursement.</p>
            <form action="/api/desinscription" method="post" className="mt-8 flex flex-wrap items-center gap-4">
              <input type="hidden" name="t" value={t} />
              <button className="press inline-flex h-14 items-center rounded-full bg-[var(--ink)] px-7 text-[17px] font-bold text-white">Confirmer ma désinscription</button>
              <Button href="/" variant="secondary" size="lg">Finalement, je reste</Button>
            </form>
          </div>
        )}

        {state === "fait" && (
          <div>
            <h1 className="t-display max-w-2xl">C’est noté</h1>
            <p className="t-lead mt-5 max-w-xl">Vous ne recevrez plus nos rappels ni nos nouvelles. Les messages essentiels d’une commande continuent d’arriver.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button href="/" size="lg">Retour à l’accueil</Button>
              {isOptOutToken(t) && (
                <form action="/api/desinscription" method="post">
                  <input type="hidden" name="t" value={t} />
                  <input type="hidden" name="action" value="reabonner" />
                  <button className="press inline-flex h-14 items-center rounded-full border border-[var(--line)] bg-white px-7 text-[17px] font-semibold text-[var(--title)]">Annuler ma désinscription</button>
                </form>
              )}
            </div>
          </div>
        )}

        {state === "retour" && (
          <div>
            <h1 className="t-display max-w-2xl">Vous revoilà !</h1>
            <p className="t-lead mt-5 max-w-xl">Votre désinscription est annulée. Mémo continuera de vous donner des nouvelles.</p>
            <div className="mt-8">
              <Button href="/" size="lg">Retour à l’accueil</Button>
            </div>
          </div>
        )}

        {(state === "erreur" || state === "invalide") && (
          <div>
            <h1 className="t-display max-w-2xl">Ce lien ne fonctionne pas</h1>
            <p className="t-lead mt-5 max-w-xl">
              {state === "erreur" ? "Un problème nous a empêchés d’enregistrer votre demande." : "Il est incomplet."} Écrivez-nous à contact@loomina.eu et nous ferons le nécessaire.
            </p>
            <div className="mt-8">
              <Button href="/contact" size="lg">Nous écrire</Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
