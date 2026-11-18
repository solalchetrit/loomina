import Link from "next/link";
import { OFFER } from "@/config/offer";
import { SITE } from "@/config/site";
import { Section, SectionHead } from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import Photo from "@/components/ui/Photo";
import PrintedPage from "@/components/ui/PrintedPage";

/** Aperçu 1 : un appel en cours. */
export function CallPreview() {
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

const STEPS: { title: string; text: string; visual: React.ReactNode }[] = [
  {
    title: "Vous appelez, quand vous voulez",
    text: "Depuis le numéro donné à la commande, fixe ou portable. Loomina vous reconnaît et reprend là où vous vous étiez arrêté.",
    visual: (
      <Photo
        name="homme-au-telephone"
        alt="Un homme âgé raconte ses souvenirs au téléphone"
        ratio="aspect-[4/3] md:aspect-[4/5]"
        focus="50% 30%"
        sizes="(min-width: 768px) 400px, 100vw"
      />
    ),
  },
  {
    title: "Loomina écrit le récit de chaque appel",
    text: "Dans vos mots, dans le style que vous avez choisi. Vous le relisez dans votre espace auteur et le corrigez : le livre se construit à deux.",
    visual: (
      <PrintedPage chapter="Chapitre 5" title="L’été de mes seize ans" page="61" sizes="(min-width: 768px) 400px, 100vw">
        <p>
          Cet été-là, mon oncle m’a confié la camionnette du marché. Je n’avais pas encore le permis, mais sur les chemins de la
          vallée, personne ne le demandait.
        </p>
        <h4>Les matins de marché</h4>
        <p>
          On partait avant le jour, les cageots de pêches calés à l’arrière. Je revois la place encore vide, les bâches qu’on
          tendait, et le premier café, brûlant, que la boulangère nous apportait sans qu’on le demande.
        </p>
        <p>C’est cet été-là que j’ai compris que je ne resterais pas au village.</p>
      </PrintedPage>
    ),
  },
  {
    title: "Le livre arrive chez vous",
    text: `Quand votre récit est complet, notre équipe relit le livre, y place vos photos et l’envoie à l’impression. Comptez en général ${OFFER.delay} entre le premier appel et le livre validé.`,
    visual: (
      <Photo
        name="livre-debout"
        alt="Le livre relié, couverture en toile de lin, debout"
        ratio="aspect-[4/5]"
        sizes="(min-width: 768px) 400px, 100vw"
      />
    ),
  },
];

export default function HowItWorks() {
  return (
    <Section id="parcours">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHead title="Trois étapes, et rien à écrire" text="Pas d’application, rien à installer. Un téléphone suffit." />
        <Link href="/experience" className="link shrink-0 text-[16px]">
          Le détail, appel par appel
        </Link>
      </div>
      <ol className="head-gap grid gap-12 md:grid-cols-3 md:gap-6 lg:gap-8" data-reveal>
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex flex-col">
            <div className="relative">
              {step.visual}
              <span
                aria-hidden="true"
                className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[18px] font-extrabold text-[var(--ink)] shadow-[var(--shadow-bar)]"
              >
                {i + 1}
              </span>
            </div>
            <p className="mt-6 text-[14px] font-bold text-[var(--amber-ink)]">Étape {i + 1}</p>
            <h3 className="t-heading mt-1.5">{step.title}</h3>
            <p className="t-body mt-2">{step.text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex flex-col items-start gap-4 rounded-[var(--radius-card)] bg-[var(--amber-soft)] p-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <p className="text-[17px] font-bold text-[var(--amber-deep)]">Le plus simple pour comprendre, c’est d’essayer : {OFFER.demoMinutes} minutes, gratuitement.</p>
        <Button href={`tel:${SITE.phone}`} className="shrink-0">
          Appeler le {SITE.phoneDisplay}
        </Button>
      </div>
    </Section>
  );
}
