import Image from "next/image";
import { blurOf } from "@/lib/photo-blur";

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
   * de chaque côté, le cadre prolonge la colonne de bord de la photo : pas de démarcation.
   */
  contain?: false | string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[28px] bg-[var(--line)] ${ratio} ${className}`}>
      {contain ? (
        <>
          {/* Le fond : la première et la dernière colonne de la photo, étirées jusqu'aux bords du cadre. */}
          <div aria-hidden className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
            <Image src={`/photos/${name}.jpg`} alt="" fill sizes={sizes} className="!w-[20000%] !max-w-none object-fill" />
          </div>
          <div aria-hidden className="absolute inset-y-0 right-0 w-1/2 overflow-hidden">
            <Image src={`/photos/${name}.jpg`} alt="" fill sizes={sizes} className="!left-auto !right-0 !w-[20000%] !max-w-none object-fill" />
          </div>
          <div
            className={`absolute inset-y-0 left-1/2 -translate-x-1/2 ${contain}`}
          >
            <Image src={`/photos/${name}.jpg`} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" {...blurOf(name)} />
          </div>
        </>
      ) : (
        <Image src={`/photos/${name}.jpg`} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" {...blurOf(name)} style={{ objectPosition: focus }} />
      )}
    </div>
  );
}
