import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import GuidePage from "@/components/guide/GuidePage";
import { SITE } from "@/config/site";
import { OFFER, SHOW_PRICE } from "@/config/offer";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Cadeau grands-parents : le livre de leur vie",
    description: `Une idée de cadeau pour grand-mère ou grand-père qui a déjà tout : il ou elle raconte sa vie au téléphone, Loomina en fait un livre imprimé${SHOW_PRICE ? `. ${OFFER.price} € tout compris.` : ", tout compris."}`,
    path: "/cadeau-grands-parents",
  }),
};

export default function Page() {
  return (
    <GuidePage
      title="Un cadeau pour vos grands-parents : le livre de leur vie"
      intro="Pour un anniversaire, des 80 ou 90 ans, Noël ou simplement parce qu’il est temps : offrez-leur de raconter leur histoire, et à toute la famille de la garder."
      photo={{ name: "grand-mere-calin", alt: "Une petite fille serre sa grand-mère dans ses bras.", ratio: "aspect-[1600/1071]" }}
      sections={[
        {
          title: "Le cadeau quand on a déjà tout",
          body: (
            <>
              <p>
                Passé un certain âge, on n’a plus besoin d’objets. Ce qui touche, c’est l’attention : qu’on s’intéresse à ce
                qu’on a vécu, qu’on ait envie d’entendre l’histoire de la ferme, de l’usine, du bal où tout a commencé.
              </p>
              <p>
                Loomina offre exactement cela : quelqu’un qui pose les questions, écoute, et en fait un vrai livre, qui
                restera dans la famille.
              </p>
            </>
          ),
        },
        {
          title: "Rien à faire pour eux, à part décrocher",
          body: (
            <>
              <p>
                Pas d’ordinateur, pas d’application, pas de rendez-vous. Votre grand-mère ou votre grand-père appelle un
                numéro de téléphone, fixe ou portable, quand il ou elle en a envie, et raconte. S’ils préfèrent, Loomina les
                appelle au jour et à l’heure choisis.
              </p>
              <p>
                Le récit de chaque appel est écrit dans leurs mots. Vous pouvez le relire pour eux, et les corrections se
                disent simplement de vive voix au prochain appel.
              </p>
            </>
          ),
        },
        {
          title: "Comment l’offrir",
          body: (
            <>
              <p>
                À la commande, choisissez « Pour offrir », puis indiquez le prénom et le numéro de téléphone de la
                personne qui racontera. Annoncez-lui le cadeau vous-même : c’est le plus beau moment. Elle peut
                ensuite appeler quand elle veut.
              </p>
              <p>
                Pour Noël ou un anniversaire proche, sachez que le livre se construit au fil des appels (en général{" "}
                {OFFER.delay}, puis {OFFER.printDelay} d’impression) : ce que vous offrez le jour J, c’est l’aventure, et le
                livre arrive ensuite.
              </p>
            </>
          ),
        },
        {
          title: "Ce que la famille reçoit",
          body: (
            <p>
              Un livre imprimé ({OFFER.format}) avec les photos de famille placées dans le texte, livré chez vous en France
              métropolitaine, et une version numérique ({OFFER.digital}) à partager avec les cousins, les oncles, les
              arrière-petits-enfants.{SHOW_PRICE && ` ${OFFER.price} € tout compris.`}
            </p>
          ),
        },
      ]}
      questions={[
        {
          q: "Quel cadeau original offrir à une grand-mère de 80 ou 90 ans ?",
          a: "Le livre de sa vie : elle raconte ses souvenirs au téléphone, Loomina les écrit et en fait un livre imprimé, que toute la famille gardera.",
        },
        {
          q: "Mon grand-père entend mal ou n’aime pas le téléphone, est-ce possible ?",
          a: `Le mieux est d’essayer la démo gratuite avec lui au ${SITE.phoneDisplay} : ${OFFER.demoMinutes} minutes suffisent pour savoir si la conversation lui plaît. Il peut aussi être à côté d’un proche pendant l’appel.`,
        },
        {
          q: "Et si l’expérience ne lui plaît pas ?",
          a: `Si le premier entretien ne convient pas, nous remboursons intégralement, sur simple demande dans les ${OFFER.guaranteeDays} jours.`,
        },
        {
          q: "Peut-on ajouter des photos de famille ?",
          a: "Oui, dans l’espace auteur ou par e-mail, en indiquant le souvenir auquel elles se rapportent. Nous les plaçons dans le livre.",
        },
      ]}
      related={[
        { href: "/ecrire-ses-memoires", label: "Écrire ses mémoires sans écrire" },
        { href: "/biographe-familial", label: "Biographe familial ou Loomina ?" },
      ]}
    />
  );
}
