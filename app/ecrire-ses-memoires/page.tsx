import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import GuidePage from "@/components/guide/GuidePage";
import { SITE } from "@/config/site";
import { OFFER } from "@/config/offer";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Écrire ses mémoires sans écrire",
    description: `Écrire ses mémoires sans tenir la plume : vous racontez votre vie au téléphone, Loomina en écrit le récit et en fait un livre imprimé. Démo gratuite au ${SITE.phoneDisplay}.`,
    path: "/ecrire-ses-memoires",
  }),
};

export default function Page() {
  return (
    <GuidePage
      title="Écrire ses mémoires, sans avoir à écrire"
      intro="Beaucoup de gens veulent laisser leur histoire à leurs enfants et petits-enfants. Peu arrivent au bout du premier chapitre. Et si vous la racontiez simplement, à voix haute ?"
      photo={{ name: "homme-au-telephone", alt: "Un homme âgé raconte un souvenir au téléphone.", ratio: "aspect-[1376/1600]" }}
      sections={[
        {
          title: "Pourquoi on ne finit jamais ses mémoires",
          body: (
            <>
              <p>
                La page blanche, d’abord : par où commencer une vie entière ? Puis le temps : écrire demande des heures de
                concentration, des semaines, souvent des mois. Et enfin la forme : on a l’impression que ce qu’on écrit ne
                ressemble pas à ce qu’on raconte si bien à table, en famille.
              </p>
              <p>
                Pourtant, raconter, tout le monde sait le faire. C’est l’écriture qui bloque, pas les souvenirs.
              </p>
            </>
          ),
        },
        {
          title: "Raconter à voix haute plutôt qu’écrire",
          body: (
            <>
              <p>
                Avec Loomina, vous appelez un numéro de téléphone, quand vous voulez. Loomina vous pose des questions,
                comme le ferait un biographe : votre enfance, vos parents, la maison où vous avez grandi, vos premiers
                emplois, les rencontres qui ont compté. Vous répondez avec vos mots, à votre rythme.
              </p>
              <p>
                Après chaque appel, le récit est écrit pour vous, dans votre façon de parler. Vous le relisez si vous le
                souhaitez, vous corrigez au prochain appel, et notre équipe relit l’ensemble avant l’impression.
              </p>
            </>
          ),
        },
        {
          title: "Par où commencer",
          body: (
            <>
              <p>
                Inutile de tout préparer. Loomina propose {OFFER.chapters} thèmes, de l’enfance à aujourd’hui, mais vous
                pouvez parler de ce qui vous vient, dans le désordre : chaque souvenir est rangé à sa place dans le livre.
              </p>
              <p>
                Quelques idées pour le premier appel : l’odeur de la maison de vos grands-parents, votre premier souvenir
                d’école, la façon dont vos parents se sont rencontrés, un jour où tout a basculé.
              </p>
            </>
          ),
        },
        {
          title: "Ce que vous recevez",
          body: (
            <p>
              Un livre imprimé ({OFFER.format}), avec vos photos placées dans le texte, et sa version numérique (
              {OFFER.digital}) à partager avec toute la famille. Comptez en général {OFFER.delay} du premier appel au livre
              validé, pour {OFFER.price} € tout compris. Tous les détails sont sur la page{" "}
              <Link href="/offre" className="link">
                le livre et le prix
              </Link>
              .
            </p>
          ),
        },
      ]}
      questions={[
        {
          q: "Faut-il savoir bien écrire pour faire ses mémoires ?",
          a: "Non. Vous racontez au téléphone, Loomina écrit le récit dans vos mots, et notre équipe relit le livre avant l’impression.",
        },
        {
          q: "Combien de temps faut-il pour écrire ses mémoires ?",
          a: `Avec Loomina, en général ${OFFER.delay} entre le premier appel et le livre validé, mais c’est votre rythme qui compte : il n’y a aucune date limite.`,
        },
        {
          q: "Peut-on écrire ses mémoires avec l’intelligence artificielle ?",
          a: "Oui : Loomina est une intelligence artificielle qui mène l’entretien et rédige le récit de chaque appel. Vous gardez le dernier mot sur chaque page, et une personne de notre équipe relit tout avant l’impression.",
        },
        {
          q: "Comment essayer ?",
          a: `Appelez le ${SITE.phoneDisplay} : la démo dure ${OFFER.demoMinutes} minutes, elle est gratuite, et vous recevez par SMS le récit de ce que vous avez raconté.`,
        },
      ]}
      related={[
        { href: "/cadeau-grands-parents", label: "Un cadeau pour ses grands-parents" },
        { href: "/biographe-familial", label: "Biographe familial ou Loomina ?" },
      ]}
    />
  );
}
