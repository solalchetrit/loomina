import Link from "next/link";
import { LOOMINA_CONFIG } from "@/config/loomina";
import { OFFER } from "@/config/offer";
import { Numbered } from "@/components/ui/Section";

export const STEPS = [
  {
    title: "Vous appelez, quand vous voulez",
    text: `Après la commande, vous appelez le ${LOOMINA_CONFIG.PHONE_NUMBER_DISPLAY} depuis le numéro donné à l’inscription. Loomina vous reconnaît et reprend là où vous vous étiez arrêté. Un appel dure le temps qu’il vous faut.`,
  },
  {
    title: "Un chapitre arrive après chaque appel",
    text: `Loomina l’écrit dans vos mots, sans rien inventer, et vous le retrouvez dans votre espace auteur. Au prochain appel, vous dites ce qu’il faut changer. ${OFFER.chapters} thèmes vous guident, de l’enfance à aujourd’hui ; vous pouvez en sauter ou en ajouter.`,
  },
  {
    title: "Nous relisons, mettons en page, imprimons",
    text: `Notre équipe relit chaque page, place vos photos et compose le livre. Il arrive relié chez vous, en général ${OFFER.delay} après le premier appel, avec sa version numérique à partager.`,
  },
];

export default function HowItWorks() {
  return (
    <section id="parcours" className="w-full scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.7fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="t-eyebrow">Comment ça se passe</p>
          <h2 className="t-title mt-4">Rien à installer, rien à écrire.</h2>
          <span aria-hidden="true" className="gold-dash mt-6" />
          <p className="t-lead mt-6 max-w-sm">Un téléphone suffit, fixe ou portable. Trois étapes, et le livre est chez vous.</p>
          <p className="mt-8">
            <Link href="/experience" className="link font-sans text-[16px] font-medium">
              Le détail, appel par appel
            </Link>
          </p>
        </div>
        <Numbered items={STEPS} />
      </div>
    </section>
  );
}
