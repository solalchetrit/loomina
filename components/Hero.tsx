import { LOOMINA_CONFIG } from "@/config/loomina";
import Button from "@/components/ui/Button";

const FACTS = [
  { value: "14+", label: "chapitres rédigés" },
  { value: "Illimités", label: "entretiens par téléphone" },
  { value: "Relié", label: "livre imprimé et livré" },
  { value: "449 €", label: "tout compris" },
];

const CheckIcon = () => (
  <svg className="h-4 w-4 shrink-0 text-[var(--gold-ink)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.57a1 1 0 0 1-1.42 0l-3.5-3.53a1 1 0 1 1 1.42-1.408l2.79 2.814 6.79-6.853a1 1 0 0 1 1.414-.006Z"
      clipRule="evenodd"
    />
  </svg>
);

const PhoneIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 0 0-1.173.417l-.97 1.293a1.125 1.125 0 0 1-1.21.38 12.035 12.035 0 0 1-7.143-7.143 1.125 1.125 0 0 1 .38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
    />
  </svg>
);

/** Illustration produit : un appel qui devient un livre. Purement décoratif. */
function BookVisual() {
  return (
    <div aria-hidden="true" className="relative mx-auto aspect-[5/6] w-full max-w-[340px] select-none sm:max-w-[420px] lg:max-w-[480px]">
      {/* Halo doré */}
      <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(closest-side,rgba(212,176,106,0.35),rgba(212,176,106,0)_70%)]" />

      {/* Page d'extrait, derrière le livre */}
      <div
        className="settle absolute right-[-3%] top-[5%] w-[50%] rotate-[5deg] rounded-[6px] bg-[var(--paper)] py-[5%] pl-[8%] pr-[5%] shadow-[0_24px_48px_-24px_rgba(26,24,21,0.35),0_0_0_1px_var(--hairline)]"
        style={{ "--i": 1 } as React.CSSProperties}
      >
        <p className="font-sans text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--gold-ink)] sm:text-[10px]">
          Chapitre III
        </p>
        <p className="mt-2 font-serif text-[15px] leading-tight text-[var(--ink)] sm:text-lg">
          L’été de mes seize ans
        </p>
        <div className="mt-3 h-px w-8 bg-[var(--loomina-gold)]/50" />
        <p className="mt-3 font-serif text-[10px] leading-[1.65] text-[var(--text-secondary)] sm:text-[11.5px]">
          <span className="float-left mr-[3px] mt-[3px] font-serif text-[2.9em] leading-[0.75] text-[var(--gold-ink)]">C</span>haque dimanche, nous prenions le car jusqu’à la mer. Ma mère emportait des pêches
          enveloppées dans du papier journal, et mon père chantait tout le trajet…
        </p>
        <div className="mt-3 space-y-1.5">
          <div className="h-[3px] w-full rounded-full bg-[var(--loomina-slate)]" />
          <div className="h-[3px] w-11/12 rounded-full bg-[var(--loomina-slate)]" />
          <div className="h-[3px] w-4/6 rounded-full bg-[var(--loomina-slate)]" />
        </div>
      </div>

      {/* Le livre relié */}
      <div
        className="settle absolute left-[3%] top-[22%] w-[50%]"
        style={{ "--i": 0 } as React.CSSProperties}
      >
        <div className="relative aspect-[3/4.3] -rotate-[4deg]">
          {/* Tranche des pages */}
          <div className="absolute inset-y-[1.5%] -right-[4%] w-[6%] rounded-r-[3px] bg-[repeating-linear-gradient(90deg,#f3eee4_0px,#f3eee4_1px,#e2dbcd_1px,#e2dbcd_2px)] shadow-[inset_0_0_0_1px_rgba(26,24,21,0.06)]" />
          {/* Couverture */}
          <div className="absolute inset-0 overflow-hidden rounded-[4px_8px_8px_4px] bg-[linear-gradient(145deg,#2c2823_0%,#1a1815_55%,#121110_100%)] shadow-[0_40px_60px_-30px_rgba(26,24,21,0.7),0_12px_24px_-12px_rgba(26,24,21,0.4)]">
            {/* Dos / reliure */}
            <div className="absolute inset-y-0 left-0 w-[9%] bg-[linear-gradient(90deg,rgba(0,0,0,0.45),rgba(255,255,255,0.07)_60%,rgba(0,0,0,0.25))]" />
            {/* Filet doré */}
            <div className="absolute inset-[9%_8%_9%_15%] rounded-[2px] border border-[var(--loomina-gold-light)]/35" />
            <div className="absolute inset-[9%_8%_9%_15%] flex flex-col items-center justify-between py-[14%] text-center">
              <span className="font-sans text-[8px] font-semibold uppercase tracking-[0.32em] text-[var(--loomina-gold-light)]/80 sm:text-[9px]">
                Livre de vie
              </span>
              <div>
                <p className="font-serif text-[22px] italic leading-[1.05] text-[#ecd9ae] sm:text-[28px]">
                  Les saisons
                  <br />
                  de Jeanne
                </p>
                <div className="mx-auto mt-3 h-px w-8 bg-[var(--loomina-gold-light)]/60" />
              </div>
              <span className="font-serif text-[9px] tracking-[0.18em] text-[var(--loomina-gold-light)]/70 sm:text-[10px]">
                LOOMINA
              </span>
            </div>
            {/* Reflet */}
            <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_38%)]" />
          </div>
        </div>
      </div>

      {/* Carte d'appel */}
      <div
        className="settle absolute bottom-[7%] left-0 flex items-center gap-3 rounded-2xl bg-[var(--paper)]/95 py-2.5 pl-2.5 pr-4 shadow-[0_20px_40px_-20px_rgba(26,24,21,0.35),0_0_0_1px_var(--hairline)] backdrop-blur sm:bottom-[9%] sm:left-[-2%]"
        style={{ "--i": 2 } as React.CSSProperties}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--loomina-gold-light)]">
          <PhoneIcon />
        </span>
        <span className="flex flex-col">
          <span className="font-sans text-[13px] font-semibold leading-tight text-[var(--ink)]">Loomina vous écoute</span>
          <span className="font-sans text-[11px] leading-tight text-[var(--text-muted)]">Entretien n°4 · Votre jeunesse</span>
        </span>
        <span className="ml-1 flex h-5 items-center gap-[3px]">
          {[0.45, 0.9, 0.6, 1, 0.5].map((h, i) => (
            <span
              key={i}
              className="wave-bar block w-[3px] rounded-full bg-[var(--loomina-gold)]"
              style={{ height: `${h * 100}%`, animationDelay: `${i * 120}ms` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section id="home" className="relative w-full scroll-mt-0 overflow-hidden">
      {/* Fond : lumière chaude très douce */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(60%_50%_at_75%_30%,rgba(212,176,106,0.14),transparent_70%)]"
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-16 pt-28 sm:px-6 md:pt-36 lg:min-h-[min(92svh,860px)] lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-20 lg:pt-32">
        {/* Texte */}
        <div className="flex flex-col items-start">
          <span
            className="rise inline-flex items-center gap-2 rounded-full border border-[var(--hairline)] bg-[var(--paper)]/70 py-1 pl-1.5 pr-3 font-sans text-[12px] font-medium text-[var(--text-secondary)]"
            style={{ "--i": 0 } as React.CSSProperties}
          >
            <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ink)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--loomina-gold-light)]" />
            </span>
            La 1ʳᵉ IA biographe, par téléphone
          </span>

          <h1
            className="rise mt-6 font-serif text-[clamp(2.75rem,7vw,5.25rem)] leading-[1.02] tracking-[-0.035em] text-[var(--ink)]"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            Vos souvenirs méritent <em className="whitespace-nowrap text-[var(--gold-ink)]">l’éternité.</em>
          </h1>

          <p
            className="rise mt-6 max-w-[34rem] font-sans text-[17px] leading-[1.65] text-[var(--text-secondary)] sm:text-lg"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            Racontez votre histoire au téléphone, simplement. Notre IA biographe en fait un{" "}
            <span className="font-medium text-[var(--ink)]">Livre de Vie d’exception</span>, sans que vous ayez à écrire
            une seule ligne.
          </p>

          <div
            className="rise mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <Button href="/order" variant="primary" size="lg" className="w-full sm:w-auto">
              Commander mon livre
            </Button>
            <Button href={`tel:${LOOMINA_CONFIG.PHONE_NUMBER}`} variant="secondary" size="lg" className="w-full sm:w-auto">
              <PhoneIcon />
              Essayer gratuitement
            </Button>
          </div>

          <p
            className="rise mt-4 font-sans text-sm text-[var(--text-muted)]"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            ou appelez directement le{" "}
            <a
              href={`tel:${LOOMINA_CONFIG.PHONE_NUMBER}`}
              className="font-medium text-[var(--ink)] underline decoration-[var(--loomina-gold)]/50 underline-offset-4 transition-colors duration-200 hover:decoration-[var(--loomina-gold)]"
            >
              {LOOMINA_CONFIG.PHONE_NUMBER_DISPLAY}
            </a>
          </p>

          <ul
            className="rise mt-8 flex flex-wrap gap-x-5 gap-y-2 font-sans text-[13px] text-[var(--text-secondary)]"
            style={{ "--i": 5 } as React.CSSProperties}
          >
            <li className="flex items-center gap-1.5 font-sans">
              <CheckIcon /> Paiement sécurisé
            </li>
            <li className="flex items-center gap-1.5 font-sans">
              <CheckIcon /> Satisfait ou remboursé
            </li>
            <li className="flex items-center gap-1.5 font-sans">
              <CheckIcon /> Sans rien écrire
            </li>
          </ul>
        </div>

        {/* Visuel */}
        <BookVisual />
      </div>

      {/* Chiffres clés */}
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <dl className="grid grid-cols-2 border-t border-[var(--hairline)] md:grid-cols-4">
          {FACTS.map((fact, i) => (
            <div
              key={fact.label}
              className={[
                "py-6 md:py-8",
                i === 0 ? "" : "md:border-l md:border-[var(--hairline)] md:pl-8",
                i % 2 === 1 ? "border-l border-[var(--hairline)] pl-5" : "",
                i === 2 ? "md:pl-8" : "",
                i > 1 ? "border-t border-[var(--hairline)] md:border-t-0" : "",
              ].join(" ")}
            >
              <dt className="sr-only">{fact.label}</dt>
              <dd className="font-serif text-[28px] leading-none tracking-[-0.02em] text-[var(--ink)] md:text-[34px]">
                {fact.value}
              </dd>
              <dd className="mt-2 font-sans text-[13px] text-[var(--text-muted)]">{fact.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
