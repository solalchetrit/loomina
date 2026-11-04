"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { SITE } from "@/config/site";
import { OFFER, THEMES } from "@/config/offer";

/** La première question que Loomina pourrait poser pour chaque thème. Des exemples, pas un script figé. */
const QUESTIONS: Record<string, string> = {
  "L’enfance": "Quelle est la première maison dont vous vous souvenez ? Qu’est-ce qu’on voyait en ouvrant la porte ?",
  "L’adolescence": "Qui était votre meilleur ami à quinze ans, et qu’est-ce que vous faisiez ensemble ?",
  "Les premiers amours": "Vous souvenez-vous du jour où vous avez compris que vous étiez amoureux ?",
  "Les études, la formation": "Y a-t-il un professeur dont vous entendez encore la voix ?",
  "Les premiers emplois": "Comment s’est passé votre tout premier jour de travail ?",
  "Les rencontres marquantes": "Quelle rencontre a changé le cours de votre vie, sans que vous le sachiez sur le moment ?",
  "La famille": "Comment décririez-vous la cuisine de chez vous, un dimanche midi ?",
  "La carrière": "De quoi êtes-vous le plus fier dans votre métier ?",
  "Les voyages": "Quel est le voyage que vous racontez toujours, et pourquoi celui-là ?",
  "Les épreuves": "Qu’est-ce qui vous a aidé à tenir, dans les moments les plus durs ?",
  "Les passions": "Qu’est-ce qui vous fait oublier l’heure ?",
  "Les leçons": "Si vous pouviez donner un seul conseil à vos vingt ans, lequel serait-ce ?",
  "La transmission": "Qu’aimeriez-vous que vos petits-enfants sachent de vous ?",
  "Les projets": "Qu’avez-vous encore envie de faire, de voir ou d’apprendre ?",
};

/**
 * L'élément interactif de l'accueil : on choisit un thème et on lit la question
 * par laquelle Loomina ouvrirait l'entretien. Sans JavaScript, la première reste affichée.
 */
export default function ThemePicker() {
  const [current, setCurrent] = useState(THEMES[0].title);

  return (
    <section id="themes" className="w-full scroll-mt-28 py-20 md:py-32">
      <div className="mx-auto grid w-full max-w-[1240px] items-start gap-10 px-5 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div data-reveal>
          <h2 className="t-title">Par quoi commenceriez-vous ?</h2>
          <p className="t-lead mt-5 max-w-lg">
            Loomina vous guide à travers {OFFER.chapters} thèmes, de l’enfance à ce que vous voulez transmettre. Choisissez-en un pour
            entendre sa première question.
          </p>
          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Thèmes">
            {THEMES.map((t) => {
              const active = t.title === current;
              return (
                <button
                  key={t.title}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCurrent(t.title)}
                  className={`press min-h-11 rounded-full px-4 text-[15px] font-semibold ${
                    active ? "bg-[var(--ink)] text-white" : "bg-white text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--line)] hover:shadow-[inset_0_0_0_1px_var(--ink)]"
                  }`}
                >
                  {t.title}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:sticky lg:top-32" data-reveal>
          <div className="rounded-[32px] bg-[var(--ink)] p-8 text-white md:p-12">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="flex h-8 items-end gap-[3px]">
                {[12, 24, 16, 30, 20, 10, 26].map((h, i) => (
                  <span
                    key={i}
                    className="voice-bar w-[4px] rounded-full bg-[var(--amber)]"
                    style={{ height: h, animationDelay: `${i * 110}ms` }}
                  />
                ))}
              </span>
              <p className="text-[15px] font-bold text-[var(--amber)]">Loomina vous demanderait</p>
            </div>
            <p key={current} aria-live="polite" className="rise mt-6 min-h-[7.5em] font-serif text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.3] text-white">
              « {QUESTIONS[current]} »
            </p>
            <p className="mt-2 text-[15px] text-[#cfcfc8]">
              Thème : {current}. Vous répondez comme vous voulez, elle relance, vous laisse le temps.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={`tel:${SITE.phone}`} variant="accent" size="lg">
                Répondre au téléphone
              </Button>
              <Button href="/order" variant="ghost" className="!text-white !decoration-white/40 hover:!decoration-white">
                Commencer mon livre
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
