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
  contain = false,
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
  /**
   * Montre la photo entière, sans la recadrer. Donner son format (par exemple "aspect-[4/5]") :
   * le reste du cadre reprend ses couleurs, floutées, et ses bords s'y fondent sans démarcation.
   */
  contain?: false | string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[28px] bg-[var(--line)] ${ratio} ${className}`}>
      {contain ? (
        <>
          <Image src={`/photos/${name}.jpg`} alt="" aria-hidden fill sizes="200px" className="scale-[2] object-cover blur-2xl" />
          <div
            className={`absolute inset-y-0 left-1/2 -translate-x-1/2 ${contain}`}
            style={{
              maskImage: "linear-gradient(90deg, transparent, #000 22%, #000 78%, transparent)",
              WebkitMaskImage: "linear-gradient(90deg, transparent, #000 22%, #000 78%, transparent)",
            }}
          >
            <Image src={`/photos/${name}.jpg`} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
          </div>
        </>
      ) : (
        <Image src={`/photos/${name}.jpg`} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" style={{ objectPosition: focus }} />
      )}
    </div>
  );
}
