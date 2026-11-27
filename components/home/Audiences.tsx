import Button from "@/components/ui/Button";
import Icon, { type IconName } from "@/components/ui/Icon";
import { Section, SectionHead } from "@/components/ui/Section";
import Photo from "@/components/ui/Photo";

const AUDIENCES: { icon: IconName; title: string; text: string; points: string[]; cta: string; href: string; dark?: boolean; photo: { name: string; alt: string; focus?: string } }[] = [
  {
    icon: "user",
    title: "Pour raconter votre vie",
    text: "Vous avez des souvenirs à transmettre, mais pas l’envie ni le temps d’écrire. Vous parlez, Loomina écrit.",
    points: ["Vous appelez quand vous voulez", "Vous relisez le récit de chaque appel", "Vous gardez tous les droits sur votre récit"],
    cta: "Commencer mon livre",
    href: "/order#pour-moi",
    photo: { name: "homme-au-telephone", alt: "Un homme âgé raconte un souvenir au téléphone.", focus: "50% 36%" },
  },
  {
    icon: "gift",
    title: "Pour l’offrir à un parent",
    text: "Le cadeau d’un livre qui reste : votre proche raconte, et toute la famille reçoit son histoire.",
    points: ["Vous indiquez son numéro à la commande", "Il appelle à son rythme, sans ordinateur", "Vous suivez son livre dans votre espace famille"],
    cta: "Offrir le livre",
    href: "/order#pour-offrir",
    photo: { name: "grand-mere-calin", alt: "Une petite fille serre sa grand-mère dans ses bras.", focus: "50% 35%" },
    dark: true,
  },
];

export default function Audiences() {
  return (
    <Section id="pour-qui">
      <SectionHead title="Racontez votre histoire, ou offrez-la à un proche" />
      <div className="head-gap grid gap-4 md:grid-cols-2" data-reveal>
        {AUDIENCES.map((a) => (
          <div
            key={a.title}
            className={`flex flex-col rounded-[var(--radius-card)] p-3 ${a.dark ? "bg-[var(--ink)] text-white" : "card"}`}
          >
            <Photo {...a.photo} ratio="aspect-[16/10]" className="!rounded-[20px]" />
            <div className="flex flex-1 flex-col p-4 pt-7 md:p-7 md:pt-8">
            <span className={"chip-icon"}>
              <Icon name={a.icon} />
            </span>
            <h3 className={`t-heading mt-6 !text-[clamp(1.45rem,2.2vw,1.8rem)] ${a.dark ? "text-white" : ""}`}>{a.title}</h3>
            <p className={`mt-3 text-[17px] leading-relaxed ${a.dark ? "text-[#cfcfc8]" : "text-[var(--ink-2)]"}`}>{a.text}</p>
            <ul className="mt-6 space-y-2.5">
              {a.points.map((p) => (
                <li key={p} className="flex gap-3 text-[16px]">
                  <Icon name="check" size={20} className={`mt-0.5 shrink-0 ${a.dark ? "text-[var(--amber-bright)]" : "text-[var(--amber-ink)]"}`} />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-8">
              <Button href={a.href} size="lg" variant={a.dark ? "accent" : "primary"}>
                {a.cta}
              </Button>
            </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
