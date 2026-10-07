import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { OFFER } from "@/config/offer";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: "Les conditions de vente du service Loomina : prix, paiement, délais, garantie, rétractation, données.",
  alternates: { canonical: "/cgv" },
};

export default function CGVPage() {
  return (
    <LegalPage eyebrow="Conditions générales de vente" title="Ce à quoi nous nous engageons." updated="7 octobre 2026">
      <h2>1. Objet</h2>
      <p>
        Les présentes conditions générales de vente (CGV) régissent les relations entre <strong>Loomina</strong>, projet en
        cours de création porté par Solal Chetrit, personne physique, joignable à contact@loomina.eu (« Loomina »), et toute
        personne passant commande sur le site www.loomina.eu (« le Client »).
      </p>

      <h2>2. Le service</h2>
      <p>Loomina propose la création d’un livre de vie à partir d’entretiens téléphoniques. Le prix comprend :</p>
      <ul>
        <li>des entretiens téléphoniques, en nombre libre, menés par une intelligence artificielle ;</li>
        <li>l’écriture d’un chapitre après chaque entretien, à partir des seules paroles du Client ;</li>
        <li>la relecture de l’ensemble par une personne de l’équipe avant l’impression ;</li>
        <li>l’intégration des photographies fournies par le Client ;</li>
        <li>la mise en page et l’impression d’un exemplaire relié ({OFFER.format}) ;</li>
        <li>une version numérique ({OFFER.digital}) ;</li>
        <li>la livraison en France métropolitaine.</li>
      </ul>

      <h2>3. Commande</h2>
      <p>
        La commande est conclue lorsque le Client a rempli le formulaire de commande, accepté les présentes CGV et réglé
        l’intégralité du prix. Une confirmation est envoyée par e-mail.
      </p>

      <h2>4. Prix et paiement</h2>
      <p>
        Le prix du service est de <strong>{OFFER.price} € TTC</strong>, tout compris. Il se règle en une fois, par carte
        bancaire, via la plateforme sécurisée Stripe. Loomina ne conserve aucune donnée bancaire. Le prix applicable est celui
        affiché au moment de la validation de la commande.
      </p>

      <h2>5. Droit de rétractation</h2>
      <p>
        Conformément aux articles L221-18 et suivants du Code de la consommation, le Client dispose de{" "}
        <strong>{OFFER.withdrawalDays} jours</strong> à compter de la commande pour se rétracter, sans motif, par e-mail à
        contact@loomina.eu. S’il demande que le service commence avant la fin de ce délai (en passant son premier appel), il
        peut encore se rétracter, et Loomina conserve une somme proportionnelle au service déjà rendu.
      </p>

      <h2>6. Garantie satisfait ou remboursé</h2>
      <p>
        Indépendamment du droit de rétractation, Loomina rembourse intégralement le Client qui, après son premier entretien,
        ne souhaite pas poursuivre, sans avoir à se justifier. La demande doit être faite dans les{" "}
        <strong>{OFFER.guaranteeDays} jours</strong> qui suivent ce premier appel.
      </p>

      <h2>7. Délais</h2>
      <p>
        Le livre est en général validé <strong>{OFFER.delay}</strong> après le premier entretien ; ce délai dépend du rythme du
        Client, qui appelle quand il le souhaite. Une fois le texte validé, l’impression et l’acheminement prennent{" "}
        <strong>{OFFER.printDelay}</strong>. La livraison se fait à l’adresse indiquée par le Client, en France métropolitaine ;
        toute autre destination fait l’objet d’un accord préalable.
      </p>

      <h2>8. Propriété du récit</h2>
      <p>
        Le Client conserve l’intégralité des droits sur son récit. Loomina ne l’utilise que pour réaliser le service
        (écriture, mise en page, impression) et ne le reproduit ni ne le diffuse sans son accord écrit.
      </p>

      <h2>9. Données personnelles</h2>
      <p>
        Les données sont traitées conformément au RGPD, comme décrit dans la{" "}
        <Link href="/privacy">politique de confidentialité</Link>.
      </p>

      <h2>10. Responsabilité</h2>
      <p>
        Loomina s’engage à fournir le service avec soin. Sa responsabilité ne peut être engagée en cas de force majeure,
        d’inexactitude des informations fournies par le Client, ou d’usage du service contraire à sa destination.
      </p>

      <h2>11. Litiges</h2>
      <p>
        En cas de difficulté, le Client écrit d’abord à contact@loomina.eu pour trouver une solution amiable. Conformément à
        l’article L612-1 du Code de la consommation, il peut ensuite recourir gratuitement à un médiateur de la consommation ;
        ses coordonnées sont communiquées sur demande. À défaut, les tribunaux français sont compétents.
      </p>

      <h2>12. Modification des CGV</h2>
      <p>
        Loomina peut modifier les présentes CGV. Les conditions applicables à une commande sont celles en vigueur à la date de
        cette commande.
      </p>
    </LegalPage>
  );
}
