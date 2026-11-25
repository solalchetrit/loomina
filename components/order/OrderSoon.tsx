import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { CheckoutFooter } from "@/components/order/CheckoutBar";
import { LAUNCH, OFFER } from "@/config/offer";
import { SITE } from "@/config/site";

/** Page de commande avant le lancement : la date d'ouverture, et la démo, qui marche déjà. */
export default function OrderSoon() {
  return (
    <div className="flex min-h-svh flex-col">
      <div className="mx-auto flex h-16 w-full max-w-[640px] items-center px-4 sm:h-20 sm:px-0">
        <Link href="/" aria-label="Loomina, accueil" className="relative block h-7 w-[118px] sm:h-8 sm:w-[134px]">
          <Image src="/header-logo-bleu.png" alt="" fill className="object-contain object-left" priority sizes="134px" />
        </Link>
      </div>
      <div className="flex-1 px-4 pb-6 sm:px-6">
        <div className="mx-auto w-full max-w-[640px]">
          <div className="card card-float p-6 sm:p-10">
            <p className="text-[15px] font-bold text-[var(--amber-deep)]">Bientôt</p>
            <h1 className="mt-2 text-[28px] font-extrabold leading-tight tracking-[-0.03em] sm:text-[34px]">
              Les commandes ouvrent le {LAUNCH.label}.
            </h1>
            <p className="mt-4 text-[18px] leading-relaxed text-[var(--ink-2)]">
              Le livre de vie, tout compris : {OFFER.price} {OFFER.currencySymbol}. En attendant, vous pouvez essayer
              Loomina dès maintenant : appelez, racontez un souvenir pendant {OFFER.demoMinutes} minutes, et recevez-le écrit.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={`tel:${SITE.phone}`} size="lg" variant="accent">
                Essayer la démo : {SITE.phoneDisplay}
              </Button>
              <Button href="/" size="lg" variant="secondary">
                Retour à l’accueil
              </Button>
            </div>
          </div>
        </div>
      </div>
      <CheckoutFooter />
    </div>
  );
}
