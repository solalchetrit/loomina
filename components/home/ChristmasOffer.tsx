"use client";

import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Photo from "@/components/ui/Photo";
import { Countdown, useLaunchOffer } from "@/components/LaunchOffer";
import { OFFER, LAUNCH_OFFER } from "@/config/offer";
import { SITE } from "@/config/site";

const STEPS = [
  { title: "Vous commandez avant le 24 décembre", text: "Trois minutes, avec le prénom et le numéro de votre proche." },
  { title: "Le soir de Noël, vous lui annoncez", text: "Son cadeau : raconter sa vie, et la recevoir en livre." },
  { title: "Il appelle quand il est prêt", text: "Loomina écrit, le livre imprimé arrive chez lui." },
];

/**
 * L'offre de lancement, pensée pour Noël (Solal, 26/11/2026) : un grand
 * panneau sombre sous le haut de page, avec le compte à rebours jusqu'au
 * 24 décembre. Disparaît tout seul quand l'offre est finie.
 */
export default function ChristmasOffer() {
  const { active } = useLaunchOffer();
  if (!active) return null;

  return (
    <section id="offre-de-noel" className="section-y mx-auto w-full max-w-[1240px] scroll-mt-28 px-5 sm:px-6" aria-labelledby="offre-de-noel-titre">
      <div className="overflow-hidden rounded-[var(--radius-card)] border-t-[6px] border-[var(--noel)] bg-[var(--ink)] text-white" data-reveal>
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-6 sm:p-10 lg:p-12">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[var(--noel)] px-3.5 py-1.5 text-[14px] font-extrabold text-white">
                <Icon name="gift" size={16} />
                Offre de Noël
              </span>
              <span className="text-[15px] font-bold text-[#ff8f8f]">Jusqu’au {LAUNCH_OFFER.label} seulement</span>
            </p>

            <h2 id="offre-de-noel-titre" className="mt-5 text-balance text-[clamp(2rem,4.4vw,3.4rem)] font-extrabold leading-[1.04] tracking-[-0.04em] text-white">
              À Noël, offrez-lui le livre de sa vie
            </h2>
            <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-[#cfcfc8] md:text-[18px]">
              Le cadeau de Noël qu’on garde toute une vie. Pour le lancement de Loomina, le livre est à {LAUNCH_OFFER.price} € au lieu de {OFFER.regularPrice} €. L’offre s’arrête le soir du réveillon : après, le prix revient à {OFFER.regularPrice} €.
            </p>

            <div className="mt-7 flex flex-wrap items-end gap-x-8 gap-y-6">
              <p className="flex items-end gap-3">
                <span className="text-[72px] font-extrabold leading-[0.82] tracking-[-0.05em] text-[var(--amber)] md:text-[92px]">
                  {LAUNCH_OFFER.price}
                  <span className="ml-1 align-top text-[0.42em] tracking-normal">{OFFER.currencySymbol}</span>
                </span>
                <span className="whitespace-nowrap pb-1 text-[26px] font-bold text-[#9b9b94] line-through decoration-2 md:text-[30px]">
                  <span className="sr-only">au lieu de </span>
                  {OFFER.regularPrice} {OFFER.currencySymbol}
                </span>
              </p>
              <div>
                <p className="mb-2 text-[14px] font-bold text-[#ff8f8f]">Noël, c’est dans</p>
                <Countdown />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button href="/order" variant="accent" size="lg">
                Offrir Loomina pour Noël
              </Button>
              <Button href={`tel:${SITE.phone}`} variant="ghost" className="!px-0 !text-white !decoration-white/40 hover:!decoration-white">
                Essayer d’abord gratuitement
              </Button>
            </div>
            <p className="mt-4 text-[15px] text-[#cfcfc8]">Tout compris, livraison incluse. Satisfait ou remboursé pendant {OFFER.guaranteeDays} jours.</p>
          </div>

          <div className="flex flex-col gap-3 p-3 pt-0 lg:p-3 lg:pl-0">
            <Photo
              name="livre-arrive-chez-vous"
              alt="Un livre Loomina à couverture bleu nuit, posé dans sa boîte ouverte, prêt à être offert"
              ratio="aspect-[16/10] lg:aspect-auto lg:min-h-[240px] lg:flex-1"
              sizes="(min-width: 1024px) 480px, 100vw"
              className="!rounded-[18px]"
            />
            <ol className="rounded-[18px] bg-white/[0.06] p-5 sm:p-6">
              {STEPS.map((s, i) => (
                <li key={s.title} className={`flex gap-4 ${i ? "mt-4" : ""}`}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--amber)] text-[15px] font-extrabold text-[var(--ink)]">{i + 1}</span>
                  <span>
                    <span className="block text-[16px] font-bold leading-snug text-white">{s.title}</span>
                    <span className="mt-0.5 block text-[15px] leading-snug text-[#cfcfc8]">{s.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
