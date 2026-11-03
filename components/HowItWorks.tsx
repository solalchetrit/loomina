import Link from "next/link";
import { OFFER } from "@/config/offer";
import { Section, SectionHead, Steps } from "@/components/ui/Section";
import type { IconName } from "@/components/ui/Icon";

export const STEPS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "phone",
    title: "Vous appelez, quand vous voulez",
    text: "Depuis le numéro donné à la commande, fixe ou portable. Loomina vous reconnaît et reprend là où vous vous étiez arrêté.",
  },
  {
    icon: "pen",
    title: "Un chapitre après chaque appel",
    text: "Écrit dans vos mots, sans rien inventer. Vous le relisez dans votre espace et dites ce qu’il faut changer.",
  },
  {
    icon: "book",
    title: "Le livre arrive chez vous",
    text: `Notre équipe relit chaque page, place vos photos et fait imprimer le livre. En général ${OFFER.delay} après le premier appel.`,
  },
];

export default function HowItWorks() {
  return (
    <Section id="parcours">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHead title="Trois étapes, et rien à écrire" text="Pas d’application, pas de rendez-vous. Un téléphone suffit." />
        <Link href="/experience" className="link shrink-0 text-[16px]">
          Le détail, appel par appel
        </Link>
      </div>
      <Steps items={STEPS} className="mt-10" />
    </Section>
  );
}
