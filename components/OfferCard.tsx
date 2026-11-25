import Button from "@/components/ui/Button";
import Photo from "@/components/ui/Photo";
import { CheckList } from "@/components/ui/Section";
import { OFFER, INCLUDED, GUARANTEE, SHOW_PRICE, LAUNCH } from "@/config/offer";

/** L'offre (le prix, ou la date d'ouverture avant le lancement) et ce qu'elle comprend : deux cartes côte à côte. */
export default function OfferCard({
  showDetailLink = true,
}: {
  showDetailLink?: boolean;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]" data-reveal>
      <div className="card flex flex-col p-3">
        <Photo
          name="livre-a-plat-lunettes"
          alt="Le livre, couverture en toile de lin, posé à côté d’une paire de lunettes et de vieilles photos de famille"
          ratio="aspect-[3/2]"
          sizes="(min-width: 1024px) 520px, 100vw"
          className="!rounded-[18px]"
        />
        <div className="flex flex-1 flex-col p-5 pt-7 md:p-7 md:pt-8">
          <p className="text-[16px] font-bold text-[var(--ink-2)]">
            {OFFER.name}
          </p>
          {SHOW_PRICE ? (
            <p className="mt-3 text-[80px] font-extrabold leading-none tracking-[-0.05em] md:text-[96px]">
              {OFFER.price}
              <span className="ml-1 align-top text-[0.42em] tracking-normal">
                {OFFER.currencySymbol}
              </span>
            </p>
          ) : (
            <p className="mt-3 text-[44px] font-extrabold leading-none tracking-[-0.045em] md:text-[56px]">
              Le {LAUNCH.label.replace(/^\S+ /, "")}
            </p>
          )}
          <p className="t-body mt-4">
            {SHOW_PRICE ? "Paiement unique, sans abonnement." : "Ouverture des commandes."} {OFFER.delivery}.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/order" size="lg">
              Commander
            </Button>
            {showDetailLink && (
              <Button href="/offre" variant="secondary" size="lg">
                Tout le détail
              </Button>
            )}
          </div>
          <p className="t-small mt-auto pt-8">
            Pour l’offrir : votre proche reçoit le numéro et appelle quand il le
            souhaite.
          </p>
        </div>
      </div>

      <div className="card p-6 md:p-9">
        <p className="text-[16px] font-bold">Ce qui est compris</p>
        <CheckList items={INCLUDED} className="mt-3" />
        <p className="mt-5 rounded-[14px] border-l-[3px] border-[var(--amber)] bg-[var(--canvas)] px-5 py-4 text-[16px] leading-relaxed text-[var(--ink-2)] [&>b]:text-[var(--ink)]">
          <b>Satisfait ou remboursé.</b> {GUARANTEE}
        </p>
      </div>
    </div>
  );
}
