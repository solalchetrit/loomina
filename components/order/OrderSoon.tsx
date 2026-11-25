import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { CheckoutFooter } from "@/components/order/CheckoutBar";
import { LAUNCH, OFFER } from "@/config/offer";
import { SITE } from "@/config/site";

/**
 * Page de commande avant le lancement : la date d'ouverture, et la démo, qui marche déjà.
 * Une carte centrée dans l'écran, sans photo (Solal, 25/11 : ne pas montrer le livre).
 */
export default function OrderSoon() {
  return (
    <div className="flex min-h-svh flex-col">
      <div className="mx-auto flex h-16 w-full max-w-[720px] items-center justify-center px-4 sm:h-20 sm:px-6">
        <Link href="/" aria-label="Loomina, accueil" className="relative block h-7 w-[118px] sm:h-8 sm:w-[134px]">
          <Image src="/header-logo-bleu.png" alt="" fill className="object-contain" priority sizes="134px" />
        </Link>
      </div>
      <main className="flex flex-1 items-center px-4 pb-4 sm:px-6">
        <div className="card card-float mx-auto w-full max-w-[720px] p-6 text-center sm:p-12">
          <div className="flex flex-col items-center">
            <p className="text-[15px] font-bold text-[var(--amber-deep)]">Bientôt</p>
            <h1 className="mt-2 text-balance text-[27px] font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[38px]">
              Les commandes ouvrent le {LAUNCH.label}.
            </h1>
            <p className="mt-4 max-w-[34rem] text-[17px] leading-relaxed text-[var(--ink-2)] sm:text-[18px]">
              En attendant, essayez Loomina dès maintenant : appelez, racontez un souvenir pendant {OFFER.demoMinutes}{" "}
              minutes, et recevez-le écrit.
            </p>
            <div className="mt-7 flex w-full flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
              <Button href={`tel:${SITE.phone}`} size="lg" variant="accent">
                Essayer la démo : {SITE.phoneDisplay}
              </Button>
              <Button href="/" size="lg" variant="secondary">
                Retour à l’accueil
              </Button>
            </div>
          </div>
        </div>
      </main>
      <CheckoutFooter />
    </div>
  );
}
