import Image from "next/image";
import { blurOf } from "@/lib/photo-blur";
import type { ReactNode } from "react";
import s from "./PrintedPage.module.css";

/**
 * Une page du livre, telle qu'elle est imprimée : la photo du livre ouvert,
 * et le texte composé dessus dans la mise en page du livre (Times, justifié, folio en bas à droite).
 * Dans `children` : des <p> pour les paragraphes, des <h4> pour les intertitres.
 */
export default function PrintedPage({
  chapter,
  title,
  page,
  children,
  sizes = "(min-width: 1024px) 600px, 100vw",
  className = "",
}: {
  chapter: string;
  title: string;
  page: string;
  children: ReactNode;
  sizes?: string;
  className?: string;
}) {
  return (
    <div className={`${s.frame} ${className}`}>
      <Image src="/photos/accueil-livre-ouvert.jpg" alt="" fill sizes={sizes} className={s.shot} {...blurOf("accueil-livre-ouvert")} />
      <div className={s.ink} lang="fr">
        {chapter && <p className={s.chapter}>{chapter}</p>}
        <p className={s.title}>{title}</p>
        <div className={s.body}>{children}</div>
        <p className={s.pageNumber}>{page}</p>
      </div>
    </div>
  );
}
