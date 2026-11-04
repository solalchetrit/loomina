import Button from "@/components/ui/Button";
import Icon, { type IconName } from "@/components/ui/Icon";
import { Section, SectionHead } from "@/components/ui/Section";

const AUDIENCES: { icon: IconName; title: string; text: string; points: string[]; cta: string; dark?: boolean }[] = [
  {
    icon: "user",
    title: "Pour raconter votre vie",
    text: "Vous avez des souvenirs à transmettre, mais pas l’envie ni le temps d’écrire. Vous parlez, Loomina écrit.",
    points: ["Vous appelez quand vous voulez", "Vous relisez chaque chapitre", "Vous gardez tous les droits sur votre récit"],
    cta: "Commencer mon livre",
  },
  {
    icon: "gift",
    title: "Pour l’offrir à un parent",
    text: "Le cadeau d’un livre qui reste : votre mère, votre grand-père raconte, et toute la famille reçoit son histoire.",
    points: ["Vous indiquez son numéro à la commande", "Il appelle à son rythme, sans ordinateur", "Version PDF et EPUB à partager"],
    cta: "Offrir le livre",
    dark: true,
  },
];

export default function Audiences() {
  return (
    <Section id="pour-qui">
      <SectionHead title="Pour vous, ou pour quelqu’un que vous aimez" text="La même méthode, deux façons de commencer." />
      <div className="mt-10 grid gap-4 md:grid-cols-2" data-reveal>
        {AUDIENCES.map((a) => (
          <div
            key={a.title}
            className={`flex flex-col rounded-[var(--radius-card)] p-7 md:p-10 ${a.dark ? "bg-[var(--ink)] text-white" : "card"}`}
          >
            <span className={`chip-icon ${a.dark ? "!bg-[var(--amber)] !text-[var(--ink)]" : ""}`}>
              <Icon name={a.icon} />
            </span>
            <h3 className={`mt-6 text-[clamp(1.5rem,2.4vw,1.9rem)] ${a.dark ? "text-white" : ""}`}>{a.title}</h3>
            <p className={`mt-3 text-[17px] leading-relaxed ${a.dark ? "text-[#cfcfc8]" : "text-[var(--ink-2)]"}`}>{a.text}</p>
            <ul className="mt-6 space-y-2.5">
              {a.points.map((p) => (
                <li key={p} className="flex gap-3 text-[16px]">
                  <Icon name="check" size={20} className={`mt-0.5 shrink-0 ${a.dark ? "text-[var(--amber)]" : "text-[var(--amber-ink)]"}`} />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-8">
              <Button href="/order" size="lg" variant={a.dark ? "accent" : "primary"}>
                {a.cta}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
