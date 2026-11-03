import Button from "@/components/ui/Button";
import { CheckList } from "@/components/ui/Section";
import { OFFER, INCLUDED, GUARANTEE } from "@/config/offer";

/** Le prix et ce qu'il comprend : deux cartes côte à côte. */
export default function OfferCard({ showDetailLink = true }: { showDetailLink?: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
      <div className="card flex flex-col p-8 md:p-10">
        <p className="text-[16px] font-bold text-[var(--ink-2)]">{OFFER.name}</p>
        <p className="mt-3 text-[80px] font-extrabold leading-none tracking-[-0.05em] md:text-[96px]">
          {OFFER.price}
          <span className="ml-1 align-top text-[0.42em] tracking-normal">{OFFER.currencySymbol}</span>
        </p>
        <p className="t-body mt-4">Paiement unique, sans abonnement. {OFFER.delivery}.</p>
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
        <p className="t-small mt-auto pt-8">Pour l’offrir : votre proche reçoit le numéro et appelle quand il le souhaite.</p>
      </div>

      <div className="card p-6 md:p-9">
        <p className="text-[16px] font-bold">Ce qui est compris</p>
        <CheckList items={INCLUDED} className="mt-3" />
        <p className="mt-5 rounded-[18px] bg-[var(--amber-soft)] px-5 py-4 text-[16px] leading-relaxed text-[var(--amber-deep)]">
          <b>Satisfait ou remboursé.</b> {GUARANTEE}
        </p>
      </div>
    </div>
  );
}
