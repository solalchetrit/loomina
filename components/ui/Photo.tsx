import Image from "next/image";

/**
 * Photo en noir et blanc, aux coins arrondis comme les cartes.
 * Le cadre fixe le format : la photo le remplit, recadrée autour de `focus`.
 */
export default function Photo({
  name,
  alt,
  ratio = "aspect-[4/3]",
  focus = "center",
  sizes = "(min-width: 1024px) 600px, 100vw",
  priority = false,
  className = "",
}: {
  /** Nom du fichier dans /public/photos, sans l'extension. */
  name: string;
  alt: string;
  /** Classe de format, par exemple "aspect-[4/5]". */
  ratio?: string;
  /** Point de la photo à garder visible (valeur CSS object-position). */
  focus?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[28px] bg-[var(--line)] ${ratio} ${className}`}>
      <Image src={`/photos/${name}.jpg`} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" style={{ objectPosition: focus }} />
    </div>
  );
}
