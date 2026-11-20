import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { OFFER } from "@/config/offer";
import { SELLER } from "@/config/legal";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description: "Les conditions de vente du service Loomina : prix, paiement, délais, garantie, rétractation, données.",
  alternates: { canonical: "/cgv" },
};

export default function CGVPage() {
  return (
    <LegalPage title="Ce à quoi nous nous engageons" updated="20 novembre 2026">
      <h2>1. Objet</h2>
      <p>
        Les présentes conditions générales de vente (CGV) régissent les relations entre <strong>{SELLER.name}</strong>,{" "}
        {SELLER.form}, qui exploite la marque {SELLER.brand}, SIRET {SELLER.siret}, {SELLER.address}, joignable à{" "}
        {SELLER.email}
        {SELLER.phone ? ` ou au ${SELLER.phone}` : ""} (« Loomina »), et toute personne passant commande sur le site
        www.loomina.eu (« le Client »).
      </p>

      <h2>2. Le service</h2>
      <p>
        Loomina propose la création d’un livre de vie à partir d’entretiens téléphoniques. Ces entretiens sont menés par une
        intelligence artificielle, à voix de synthèse, ce dont la personne qui raconte est informée. Le prix comprend :
      </p>
      <ul>
        <li>des entretiens téléphoniques, en nombre libre, menés par une intelligence artificielle ;</li>
        <li>l’écriture du récit de chaque entretien, à partir des seules paroles du Client, puis la composition du livre à partir de ces récits ;</li>
        <li>la relecture de l’ensemble par une personne de l’équipe avant l’impression ;</li>
        <li>l’intégration des photographies fournies par le Client ;</li>
        <li>la mise en page et l’impression d’un exemplaire du livre ({OFFER.format}) ;</li>
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
        Le prix du service est de <strong>{OFFER.price} € TTC</strong>, tout compris ({SELLER.vat}). Il se règle par carte bancaire, en une fois, ou en trois
        ou quatre fois avec Klarna, via la plateforme sécurisée Stripe. Loomina ne conserve aucune donnée bancaire. Le prix applicable est celui
        affiché au moment de la validation de la commande.
      </p>

      <h2>5. Droit de rétractation</h2>
      <p>
        Conformément aux articles L221-18 et suivants du Code de la consommation, le Client dispose de{" "}
        <strong>{OFFER.withdrawalDays} jours</strong> à compter de la commande pour se rétracter, sans motif, par e-mail à
        contact@loomina.eu. S’il demande que le service commence avant la fin de ce délai (en passant son premier appel), il
        peut encore se rétracter, et Loomina conserve une somme proportionnelle au service déjà rendu.
      </p>
      <p>
        Le Client peut utiliser le <a href="#formulaire-retractation" className="link">formulaire de rétractation</a> en bas de
        cette page, ou toute autre déclaration sans ambiguïté. Loomina rembourse les sommes dues au plus tard 14 jours après
        avoir reçu la demande, par le même moyen de paiement que la commande.
      </p>

      <h2 id="garantie" className="scroll-mt-32">6. Garantie satisfait ou remboursé</h2>
      <p>
        Indépendamment du droit de rétractation, Loomina rembourse intégralement le Client qui, après son premier entretien,
        ne souhaite pas poursuivre, sans avoir à se justifier. La demande doit être faite dans les{" "}
        <strong>{OFFER.guaranteeDays} jours</strong> qui suivent ce premier appel, par e-mail à contact@loomina.eu ou par le
        formulaire de contact, en indiquant le numéro de téléphone donné à la commande.
      </p>
      <p>
        Le remboursement porte sur la totalité du prix payé. Il est effectué par le même moyen de paiement que la commande, au
        plus tard 14 jours après la demande. Les récits déjà écrits sont alors supprimés, sauf si le Client demande à les
        recevoir. Passé ce délai de {OFFER.guaranteeDays} jours, seul le droit de rétractation prévu à l’article 5 s’applique.
      </p>

      <h2>7. Délais</h2>
      <p>
        Le livre est en général validé <strong>{OFFER.delay}</strong> après le premier entretien ; ce délai dépend du rythme du
        Client, qui appelle quand il le souhaite. Une fois le texte validé, l’impression et l’acheminement prennent{" "}
        <strong>{OFFER.printDelay}</strong>. La livraison se fait à l’adresse indiquée par le Client, en France métropolitaine ;
        toute autre destination fait l’objet d’un accord préalable.
      </p>

      <h2>8. Garanties légales</h2>
      <p>
        Le Client bénéficie de la garantie légale de conformité (articles L217-3 et suivants du Code de la consommation) et
        de la garantie des vices cachés (articles 1641 et suivants du Code civil). En cas de défaut du livre imprimé (pages
        manquantes, erreur d’impression, livre abîmé à la livraison), il écrit à {SELLER.email} avec une photo : Loomina
        réimprime et renvoie le livre à ses frais. La garantie de conformité dure deux ans à compter de la livraison.
      </p>

      <h2>9. Propriété du récit</h2>
      <p>
        Le Client conserve l’intégralité des droits sur son récit. Loomina ne l’utilise que pour réaliser le service
        (écriture, mise en page, impression) et ne le reproduit ni ne le diffuse sans son accord écrit.
      </p>

      <h2>10. Données personnelles</h2>
      <p>
        Les données sont traitées conformément au RGPD, comme décrit dans la{" "}
        <Link href="/privacy">politique de confidentialité</Link>.
      </p>

      <h2>11. Responsabilité</h2>
      <p>
        Loomina s’engage à fournir le service avec soin. Sa responsabilité ne peut être engagée en cas de force majeure,
        d’inexactitude des informations fournies par le Client, ou d’usage du service contraire à sa destination.
      </p>

      <h2>12. Litiges</h2>
      <p>
        En cas de difficulté, le Client écrit d’abord à {SELLER.email} pour trouver une solution amiable.
        {SELLER.mediator && (
          <>
            {" "}
            Conformément à l’article L612-1 du Code de la consommation, il peut ensuite recourir gratuitement au médiateur de la
            consommation : <strong>{SELLER.mediator.name}</strong>, {SELLER.mediator.address} ({SELLER.mediator.website}).
          </>
        )}{" "}
        À défaut d’accord, les tribunaux français sont compétents.
      </p>

      <h2>13. Modification des CGV</h2>
      <p>
        Loomina peut modifier les présentes CGV. Les conditions applicables à une commande sont celles en vigueur à la date de
        cette commande.
      </p>

      <h2 id="formulaire-retractation" className="scroll-mt-32">
        Annexe : formulaire de rétractation
      </h2>
      <p>À compléter et renvoyer uniquement si vous souhaitez vous rétracter, par e-mail à {SELLER.email} ou par courrier à :</p>
      <p>
        {SELLER.name}, {SELLER.address}
      </p>
      <p>
        Je vous notifie par la présente ma rétractation du contrat portant sur la création d’un livre de vie Loomina.
        <br />
        Commandé le : ……………
        <br />
        Nom du Client : ……………
        <br />
        Numéro de téléphone donné à la commande : ……………
        <br />
        Adresse du Client : ……………
        <br />
        Date et signature (uniquement en cas d’envoi papier) : ……………
      </p>
    </LegalPage>
  );
}
