import Image from "next/image";

interface MemberCardProps {
  name?: string;
  memberId?: string;
}

/** Carte membre : encre, filet or, nom en serif. Statique (pas de survol animé). */
export default function MemberCard({ name = "Membre Loomina", memberId = "2025 • #001" }: MemberCardProps) {
  return (
    <div className="relative mx-auto w-full max-w-[480px]">
      <div className="paper-grain relative aspect-[1.7/1] overflow-hidden rounded-2xl bg-[var(--ink)] shadow-[0_40px_60px_-30px_rgba(26,24,21,0.6)]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0)_55%,rgba(0,0,0,0.25)_100%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_80%_0%,rgba(212,176,106,0.22),transparent_70%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-xl border border-[var(--loomina-gold-light)]/30" />

        <div className="relative flex h-full flex-col justify-between p-7 sm:p-8">
          <div className="flex items-start justify-between">
            <div className="relative h-6 w-28 brightness-0 invert">
              <Image src="/header-logo-trimmed.png" alt="Loomina" fill className="object-contain object-left" sizes="112px" />
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--loomina-gold-light)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--loomina-gold-light)]" />
              Membre
            </span>
          </div>

          <div>
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-[#cfc8bb]">Livre de vie de</p>
            <p className="mt-1 font-serif text-[28px] leading-tight tracking-[-0.01em] text-[#ecd9ae] sm:text-[34px]">{name}</p>
          </div>

          <div className="flex items-end justify-between font-sans">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#9d968a]">loomina.eu</span>
            <span className="text-[11px] tracking-[0.18em] text-[var(--loomina-gold-light)]/80">{memberId}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
