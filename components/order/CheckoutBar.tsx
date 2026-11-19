import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

/** Barre du parcours de commande : le logo, et la mention du paiement sécurisé. Pas de menu. */
export default function CheckoutBar() {
  return (
    <div className="mx-auto flex h-16 w-full max-w-[640px] items-center justify-between px-4 sm:h-20 sm:px-0">
      <Link href="/" aria-label="Loomina, accueil" className="relative block h-7 w-[118px] sm:h-8 sm:w-[134px]">
        <Image src="/header-logo-bleu.png" alt="" fill className="object-contain object-left" priority sizes="134px" />
      </Link>
      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ink-3)]">
        <Icon name="shield" size={15} /> Paiement sécurisé
      </span>
    </div>
  );
}

/** Pied du parcours de commande : les liens légaux, discrets. */
export function CheckoutFooter() {
  return (
    <p className="mx-auto flex w-full max-w-[640px] flex-wrap justify-center gap-x-4 gap-y-1 px-4 py-6 text-[13px] text-[var(--ink-3)]">
      <span>© Loomina</span>
      <Link href="/cgv" className="hover:text-[var(--ink)]">Conditions de vente</Link>
      <Link href="/privacy" className="hover:text-[var(--ink)]">Confidentialité</Link>
      <Link href="/contact" className="hover:text-[var(--ink)]">Une question ?</Link>
    </p>
  );
}
