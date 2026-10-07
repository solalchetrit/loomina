import { LOOMINA_CONFIG } from "@/config/loomina";
import Button from "@/components/ui/Button";
import { OFFER } from "@/config/offer";

const FACTS = [
  { value: `${OFFER.demoMinutes} min`, label: "pour essayer, gratuitement" },
  { value: `${OFFER.chapters} thèmes`, label: "de l’enfance à aujourd’hui" },
  { value: OFFER.delay, label: "du premier appel au livre" },
  { value: `${OFFER.price} €`, label: "tout compris, livraison incluse" },
];

/** Illustration : le livre relié et une page de chapitre. Purement décoratif. */
function BookVisual() {
  return (
    <div aria-hidden="true" className="relative mx-auto aspect-[5/6] w-full max-w-[340px] select-none sm:max-w-[420px] lg:max-w-[460px]">
      {/* Page d'extrait, derrière le livre */}
      <div
        className="settle absolute right-0 top-[6%] w-[54%] rotate-[4deg] bg-white px-[7%] py-[6%] shadow-[0_24px_48px_-28px_rgba(27,25,21,0.4),0_0_0_1px_var(--rule)]"
        style={{ "--i": 1 } as React.CSSProperties}
      >
        <p className="text-center font-sans text-[9px] font-semibold uppercase tracking-[0.24em] text-[var(--gold-ink)] sm:text-[10px]">Chapitre III</p>
        <p className="mt-2 text-center font-serif text-[15px] italic leading-tight text-[var(--ink)] sm:text-[18px]">L’été de mes seize ans</p>
        <span className="gold-dash mx-auto mt-3 !w-6" />
        <p className="mt-3 font-serif text-[10px] leading-[1.6] text-[var(--ink-2)] sm:text-[11.5px]">
          <span className="float-left mr-[3px] mt-[2px] font-serif text-[2.8em] leading-[0.75] text-[var(--gold-ink)]">C</span>haque dimanche, nous prenions le car jusqu’à la mer. Ma mère
          emportait des pêches enveloppées dans du papier journal, et mon père chantait tout le trajet…
        </p>
        <div className="mt-3 space-y-1.5">
          <div className="h-[3px] w-full bg-[var(--paper-edge)]" />
          <div className="h-[3px] w-11/12 bg-[var(--paper-edge)]" />
          <div className="h-[3px] w-4/6 bg-[var(--paper-edge)]" />
        </div>
      </div>

      {/* Le livre relié */}
      <div className="settle absolute left-[2%] top-[20%] w-[52%]" style={{ "--i": 0 } as React.CSSProperties}>
        <div className="relative aspect-[3/4.3] -rotate-[3deg]">
          <div className="absolute inset-y-[1.5%] -right-[4%] w-[6%] rounded-r-[3px] bg-[repeating-linear-gradient(90deg,#f3eee4_0px,#f3eee4_1px,#e2dbcd_1px,#e2dbcd_2px)]" />
          <div className="absolute inset-0 overflow-hidden rounded-[3px_7px_7px_3px] bg-[linear-gradient(145deg,#2c2823_0%,#1b1915_55%,#121110_100%)] shadow-[0_40px_60px_-30px_rgba(27,25,21,0.7),0_12px_24px_-12px_rgba(27,25,21,0.4)]">
            <div className="absolute inset-y-0 left-0 w-[9%] bg-[linear-gradient(90deg,rgba(0,0,0,0.45),rgba(255,255,255,0.07)_60%,rgba(0,0,0,0.25))]" />
            <div className="absolute inset-[9%_8%_9%_15%] border border-[var(--gold-light)]/35" />
            <div className="absolute inset-[9%_8%_9%_15%] flex flex-col items-center justify-between py-[14%] text-center">
              <span className="font-sans text-[8px] font-semibold uppercase tracking-[0.32em] text-[var(--gold-light)]/80 sm:text-[9px]">Livre de vie</span>
              <div>
                <p className="font-serif text-[22px] italic leading-[1.05] text-[#ecd9ae] sm:text-[28px]">
                  Les saisons
                  <br />
                  de Jeanne
                </p>
                <div className="mx-auto mt-3 h-px w-8 bg-[var(--gold-light)]/60" />
              </div>
              <span className="font-serif text-[9px] tracking-[0.18em] text-[var(--gold-light)]/70 sm:text-[10px]">LOOMINA</span>
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_38%)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section id="home" className="relative w-full overflow-hidden">
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-16 pt-28 sm:px-8 md:pt-36 lg:min-h-[min(88svh,820px)] lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:pb-20 lg:pt-32">
        <div className="flex flex-col items-start">
          <p className="rise t-eyebrow" style={{ "--i": 0 } as React.CSSProperties}>
            Biographie par téléphone · livre relié
          </p>

          <h1 className="rise t-display mt-5" style={{ "--i": 1 } as React.CSSProperties}>
            Racontez votre vie au téléphone. Nous en faisons un livre.
          </h1>

          <p className="rise t-lead mt-6 max-w-[34rem]" style={{ "--i": 2 } as React.CSSProperties}>
            Vous parlez, comme à quelqu’un qui vous écoute vraiment. Après chaque appel, Loomina écrit un chapitre dans vos
            mots. Notre équipe relit chaque page, et vous recevez le livre relié chez vous.
          </p>

          {/* La démo : l'action la plus simple, donc la plus visible */}
          <div className="rise mt-9 w-full max-w-[34rem] border-y border-[var(--ink)] py-5" style={{ "--i": 3 } as React.CSSProperties}>
            <p className="t-eyebrow">Essayez maintenant, c’est gratuit</p>
            <a
              href={`tel:${LOOMINA_CONFIG.PHONE_NUMBER}`}
              className="link mt-2 inline-block font-serif text-[clamp(2.2rem,5vw,3.1rem)] leading-none tracking-[-0.015em] text-[var(--ink)]"
            >
              {LOOMINA_CONFIG.PHONE_NUMBER_DISPLAY}
            </a>
            <p className="t-body mt-3">
              {OFFER.demoMinutes} minutes avec Loomina : vous racontez un souvenir, elle vous pose quelques questions. Rien n’est
              enregistré. Prix d’un appel normal.
            </p>
          </div>

          <div className="rise mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center" style={{ "--i": 4 } as React.CSSProperties}>
            <Button href="/order" variant="primary" size="lg" className="w-full sm:w-auto">
              Commander · {OFFER.price} €
            </Button>
            <Button href="/experience" variant="ghost" size="lg" className="w-full sm:w-auto">
              Comment ça marche
            </Button>
          </div>
        </div>

        <BookVisual />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <dl className="grid grid-cols-2 border-t border-[var(--rule)] md:grid-cols-4">
          {FACTS.map((fact, i) => (
            <div
              key={fact.label}
              className={[
                "flex flex-col-reverse justify-end py-6 md:py-8",
                i % 2 === 1 ? "border-l border-[var(--rule)] pl-5 md:pl-8" : "",
                i === 2 ? "md:border-l md:border-[var(--rule)] md:pl-8" : "",
                i > 1 ? "border-t border-[var(--rule)] md:border-t-0" : "",
              ].join(" ")}
            >
              <dt className="mt-2 font-sans text-[15px] text-[var(--ink-3)]">{fact.label}</dt>
              <dd className="font-serif text-[26px] leading-none tracking-[-0.01em] text-[var(--ink)] md:text-[32px]">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
