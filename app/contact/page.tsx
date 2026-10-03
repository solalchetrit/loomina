import { Section, PageHeader } from "@/components/ui/Section";
import { Input, Textarea } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { LOOMINA_CONFIG } from "@/config/loomina";

const EMAIL = "contact@loomina.eu";

export default function ContactPage() {
  return (
    <main className="w-full min-h-[85svh]">
      <PageHeader eyebrow="Contact" title="Parlons de" accent="votre livre." text="Une question sur votre projet, un cadeau à préparer, un doute ? Nous répondons sous 24 h ouvrées." />

      <Section size="sm">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          {/* Coordonnées */}
          <div className="reveal space-y-4">
            <a href={`tel:${LOOMINA_CONFIG.PHONE_NUMBER}`} className="press card flex items-center gap-4 rounded-3xl p-5 hover:border-[var(--loomina-gold)]">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-[var(--loomina-gold-light)]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 0 0-1.173.417l-.97 1.293a1.125 1.125 0 0 1-1.21.38 12.035 12.035 0 0 1-7.143-7.143 1.125 1.125 0 0 1 .38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
              </span>
              <span>
                <span className="block font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Par téléphone</span>
                <span className="block font-serif text-[24px] leading-tight text-[var(--ink)]">{LOOMINA_CONFIG.PHONE_NUMBER_DISPLAY}</span>
                <span className="block font-sans text-[13px] text-[var(--text-muted)]">Du lundi au vendredi, 9 h à 18 h</span>
              </span>
            </a>
            <a href={`mailto:${EMAIL}`} className="press card flex items-center gap-4 rounded-3xl p-5 hover:border-[var(--loomina-gold)]">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--loomina-night)] text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--hairline)]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </span>
              <span>
                <span className="block font-sans text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Par e-mail</span>
                <span className="block font-serif text-[22px] leading-tight text-[var(--ink)]">{EMAIL}</span>
              </span>
            </a>
            <p className="px-2 pt-2 font-sans text-[14px] leading-relaxed text-[var(--text-muted)]">
              Vous offrez Loomina ? Précisez-le dans votre message : nous préparons un bon cadeau à imprimer.
            </p>
          </div>

          {/* Formulaire (envoi via le client mail du visiteur) */}
          <form className="reveal card rounded-3xl p-6 sm:p-8" action={`mailto:${EMAIL}`} method="post" encType="text/plain">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Votre nom" name="nom" autoComplete="name" placeholder="Jeanne Martin" required />
              <Input label="Votre e-mail" name="email" type="email" autoComplete="email" inputMode="email" placeholder="jeanne@exemple.fr" required />
            </div>
            <div className="mt-5">
              <Textarea label="Votre message" name="message" rows={6} placeholder="Bonjour, je souhaiterais en savoir plus sur…" required />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-sans text-[13px] text-[var(--text-muted)]">Le message s’ouvre dans votre application e-mail.</p>
              <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
                Envoyer
              </Button>
            </div>
          </form>
        </div>
      </Section>
    </main>
  );
}
