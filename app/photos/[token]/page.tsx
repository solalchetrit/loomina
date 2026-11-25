import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InvitePhotoForm from "./InvitePhotoForm";
import { findByInvite, ESSAI_INVITE_TOKEN } from "@/lib/loomina/photo-invite";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ajouter une photo au livre",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/**
 * La page du lien d'invitation (lib/loomina/photo-invite.ts) : un proche y
 * ajoute des photos au livre, sans compte. Seul le prénom de l'auteur est
 * montré, rien d'autre du livre.
 */
export default async function InvitePhotosPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const essai = token === ESSAI_INVITE_TOKEN;
  let firstName: string | null = null;
  let valid = essai;
  if (essai) firstName = "Jeanne";
  else {
    const found = await findByInvite(token).catch(() => null);
    if (found) {
      valid = true;
      firstName = found.profile.first_name?.trim() || null;
    }
  }
  const whose = firstName ? `de ${firstName}` : "";

  return (
    <div className="min-h-svh bg-[var(--canvas)]">
      <div className="mx-auto flex h-16 w-full max-w-[640px] items-center px-5 sm:h-20">
        <Link href="/" aria-label="Loomina, accueil" className="relative block h-7 w-[118px] sm:h-8 sm:w-[134px]">
          <Image src="/header-logo-trimmed.png" alt="" fill className="object-contain object-left" priority sizes="134px" />
        </Link>
      </div>

      <main className="mx-auto w-full max-w-[640px] px-5 pb-16 pt-4 sm:pt-8">
        {valid ? (
          <>
            <p className="t-eyebrow">{firstName ? `Le livre ${whose}` : "Un livre en cours"}</p>
            <h1 className="t-display mt-3">Ajoutez une photo au livre {whose}</h1>
            <p className="mt-4 text-[18px] leading-relaxed text-[var(--ink-2)]">
              {firstName ?? "La personne"} écrit le livre de sa vie avec Loomina, en racontant ses souvenirs au téléphone. Envoyez une photo de famille, d’un lieu ou d’un moment :
              Loomina en parlera avec {firstName ?? "elle"} lors d’un prochain appel, et la photo pourra trouver sa place dans le livre.
            </p>
            <div className="card mt-8 p-6 sm:p-7">
              <InvitePhotoForm token={token} essai={essai} />
            </div>
            <p className="mt-6 text-[14px] leading-relaxed text-[var(--ink-3)]">
              Vos photos ne sont vues que par {firstName ?? "l’auteur"} et l’équipe Loomina. Cette page ne montre rien du livre.
            </p>
          </>
        ) : (
          <>
            <h1 className="t-display">Ce lien ne marche plus</h1>
            <p className="mt-4 text-[18px] leading-relaxed text-[var(--ink-2)]">
              Le livre est peut-être terminé. Vérifiez l’adresse auprès de la personne qui vous l’a envoyée.
            </p>
            <Link href="/" className="link mt-6 inline-block text-[16px]">
              Découvrir Loomina
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
