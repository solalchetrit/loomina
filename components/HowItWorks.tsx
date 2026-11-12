import Link from "next/link";
import { OFFER } from "@/config/offer";
import { SITE } from "@/config/site";
import { Section, SectionHead, Steps } from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import { BookCover } from "@/components/home/WhatYouGet";
import type { IconName } from "@/components/ui/Icon";

/** Aperçu 1 : un appel en cours. */
function CallPreview() {
  const bars = [10, 22, 34, 18, 40, 26, 14, 30, 38, 20, 12, 28, 36, 16, 24];
  return (
    <div className="w-full max-w-[260px] rounded-[18px] bg-white p-4 shadow-[var(--shadow-bar)]">
      <div className="flex items-center justify-between text-[13px]">
        <b>Loomina</b>
        <span className="pill pill-green !py-0.5">En ligne · 12:04</span>
      </div>
      <div className="mt-4 flex h-10 items-center gap-[5px]">
        {bars.map((h, i) => (
          <span key={i} className="w-[5px] rounded-full bg-[var(--amber)]" style={{ height: h }} />
        ))}
      </div>
    </div>
  );
}

/** Aperçu 2 : un chapitre fraîchement écrit. */
function ChapterPreview() {
  return (
    <div className="w-full max-w-[260px] rounded-[14px] bg-white px-5 py-4 shadow-[var(--shadow-bar)]">
      <p className="text-[11px] font-bold text-[var(--amber-ink)]">Chapitre 4</p>
      <p className="mt-1 font-serif text-[17px] italic leading-tight">L’été de mes seize ans</p>
      <div className="mt-3 space-y-1.5">
        <span className="block h-[5px] w-full rounded bg-[var(--line)]" />
        <span className="block h-[5px] w-11/12 rounded bg-[var(--line)]" />
        <span className="block h-[5px] w-4/5 rounded bg-[var(--line)]" />
      </div>
      <span className="pill pill-amber mt-3 !py-0.5 !text-[11px]">À relire</span>
    </div>
  );
}

export const STEPS: { icon: IconName; title: string; text: string; preview: React.ReactNode }[] = [
  {
    icon: "phone",
    title: "Vous appelez, quand vous voulez",
    text: "Depuis le numéro donné à la commande, fixe ou portable. Loomina vous reconnaît et reprend là où vous vous étiez arrêté.",
    preview: <CallPreview />,
  },
  {
    icon: "pen",
    title: "Un chapitre après chaque appel",
    text: "Écrit dans vos mots, sans rien inventer. Vous le relisez dans votre espace et dites ce qu’il faut changer.",
    preview: <ChapterPreview />,
  },
  {
    icon: "book",
    title: "Le livre arrive chez vous",
    text: `Notre équipe relit chaque page, place vos photos et fait imprimer le livre. En général ${OFFER.delay} après le premier appel.`,
    preview: <BookCover className="max-w-[96px] !py-0" compact />,
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
      <div className="mt-6 flex flex-col items-start gap-4 rounded-[var(--radius-card)] bg-[var(--amber-soft)] p-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <p className="text-[17px] font-bold text-[var(--amber-deep)]">Le plus simple pour comprendre, c’est d’essayer : {OFFER.demoMinutes} minutes, gratuitement.</p>
        <Button href={`tel:${SITE.phone}`} className="shrink-0">
          Appeler le {SITE.phoneDisplay}
        </Button>
      </div>
    </Section>
  );
}
