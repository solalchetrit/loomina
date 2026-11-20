import type { Metadata } from "next";
import GuidePage from "@/components/guide/GuidePage";
import { SITE } from "@/config/site";
import { OFFER } from "@/config/offer";

export const metadata: Metadata = {
  title: "Biographe familial : prix, déroulement, et une alternative par téléphone",
  description: `Faire écrire la biographie d’un parent : ce que fait un biographe familial, ce que cela coûte, et comment Loomina propose un livre imprimé pour ${OFFER.price} €, par téléphone.`,
  alternates: { canonical: "/biographe-familial" },
};

export default function Page() {
  return (
    <GuidePage
      title="Biographe familial : comment faire écrire l’histoire d’un proche"
      intro="Vous voulez garder l’histoire de votre mère, de votre père ou de vos grands-parents dans un livre. Voici comment font les biographes, et ce que Loomina change."
      photo={{ name: "photos-de-famille", alt: "Une main tient deux vieilles photos de famille.", ratio: "aspect-[1600/1063]" }}
      sections={[
        {
          title: "Ce que fait un biographe familial",
          body: (
            <>
              <p>
                Un biographe familial (on dit aussi écrivain public ou biographe privé) rencontre la personne plusieurs fois,
                enregistre ses souvenirs, puis rédige et met en page un livre. Le travail est souvent remarquable, mais il
                prend du temps : plusieurs mois, et de nombreuses heures d’entretien et d’écriture.
              </p>
              <p>
                Le prix suit ce temps : il se compte généralement en milliers d’euros, selon la longueur du livre et le nombre
                de rencontres. C’est souvent ce qui fait renoncer.
              </p>
            </>
          ),
        },
        {
          title: "Loomina : l’entretien au téléphone, quand on veut",
          body: (
            <>
              <p>
                Loomina reprend la méthode du biographe, l’entretien, mais au téléphone et sans rendez-vous. La personne
                appelle quand elle en a envie, de jour comme de nuit, et Loomina lui pose les questions, relance, revient
                sur un détail. Le récit de chaque appel est écrit dans ses mots.
              </p>
              <p>
                Loomina est une intelligence artificielle : c’est ce qui permet un prix de {OFFER.price} € tout compris. Mais
                le livre n’est pas laissé à la machine : la personne relit et corrige, et notre équipe relit l’ensemble avant
                l’impression.
              </p>
            </>
          ),
        },
        {
          title: "Comment choisir",
          body: (
            <>
              <p>
                Si vous cherchez une plume d’auteur, une enquête dans les archives de la famille, ou des rencontres en
                personne, un biographe familial est le bon choix.
              </p>
              <p>
                Si ce qui compte, c’est que l’histoire soit racontée par la personne elle-même, dans ses mots, à son rythme,
                et gardée dans un beau livre imprimé, Loomina le permet pour une fraction du prix. Le plus simple est d’essayer
                : la démo au {SITE.phoneDisplay} dure {OFFER.demoMinutes} minutes et elle est gratuite.
              </p>
            </>
          ),
        },
      ]}
      questions={[
        {
          q: "Combien coûte un biographe familial ?",
          a: `Le plus souvent plusieurs milliers d’euros, selon la longueur du livre et le nombre de rencontres. Avec Loomina, le livre imprimé coûte ${OFFER.price} € tout compris, livraison incluse en France métropolitaine.`,
        },
        {
          q: "Combien de temps faut-il pour écrire une biographie familiale ?",
          a: `Chez un biographe, plusieurs mois en général. Avec Loomina, comptez ${OFFER.delay} entre le premier appel et le livre validé, puis ${OFFER.printDelay} d’impression et de livraison.`,
        },
        {
          q: "Le livre ressemble-t-il vraiment à la personne ?",
          a: "Le récit est écrit à partir de ses propres mots, et elle a le dernier mot : elle peut faire corriger chaque passage au prochain appel avant l’impression.",
        },
      ]}
      related={[
        { href: "/ecrire-ses-memoires", label: "Écrire ses mémoires sans écrire" },
        { href: "/cadeau-grands-parents", label: "Un cadeau pour ses grands-parents" },
      ]}
    />
  );
}
