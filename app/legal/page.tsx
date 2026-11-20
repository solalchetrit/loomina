import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { SELLER } from "@/config/legal";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Éditeur, hébergement, propriété intellectuelle et cookies du site loomina.eu.",
  alternates: { canonical: "/legal" },
};

export default function LegalMentionsPage() {
  return (
    <LegalPage title="Qui édite ce site" updated="20 novembre 2026">
      <h2>1. Éditeur</h2>
      <p>
        Le site www.loomina.eu est édité par <strong>{SELLER.name}</strong>, {SELLER.form}, qui exploite la marque{" "}
        <strong>{SELLER.brand}</strong>.
      </p>
      <ul>
        <li>Adresse : {SELLER.address}</li>
        <li>SIREN : {SELLER.siren} · SIRET : {SELLER.siret}</li>
        <li>Immatriculation : {SELLER.registry}</li>
        <li>{SELLER.vat}</li>
        <li>E-mail : {SELLER.email}</li>
        {SELLER.phone && <li>Téléphone : {SELLER.phone}</li>}
      </ul>
      <p>Directeur de la publication : {SELLER.director}.</p>

      <h2>2. Hébergement</h2>
      <ul>
        <li>
          <strong>Site</strong> : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (vercel.com).
        </li>
        <li>
          <strong>Données des clients</strong> : Supabase Inc., 970 Toa Payoh North #07-04, Singapour 318992 (supabase.com),
          dans un centre de données situé à Paris.
        </li>
        <li>
          <strong>Serveur des appels</strong> : Render Services Inc., 525 Brannan Street, Suite 300, San Francisco, CA 94107,
          États-Unis (render.com), dans un centre de données situé à Francfort.
        </li>
      </ul>
      <p>
        Le détail des prestataires est dans la <Link href="/privacy">politique de confidentialité</Link>.
      </p>

      <h2>3. Propriété intellectuelle</h2>
      <p>
        Les textes, images et éléments graphiques du site sont la propriété de l’éditeur, sauf mention contraire. Toute
        reproduction sans autorisation écrite est interdite (articles L.335-2 et suivants du Code de la propriété
        intellectuelle). Les récits des clients leur appartiennent.
      </p>

      <h2>4. Données personnelles</h2>
      <p>
        Les données collectées sur le site sont traitées conformément au RGPD. Vous disposez d’un droit d’accès, de
        rectification, de suppression, de limitation, d’opposition et de portabilité, à exercer par e-mail à {SELLER.email}.
        Le détail est dans la <Link href="/privacy">politique de confidentialité</Link>.
      </p>

      <h2 id="cookies">5. Cookies</h2>
      <p>Le site utilise deux types de cookies :</p>
      <ul>
        <li>
          <strong>un cookie de session</strong>, indispensable, posé uniquement lorsque vous vous connectez à votre espace
          auteur ;
        </li>
        <li>
          <strong>des cookies de mesure d’audience</strong> (Google Analytics), qui nous indiquent quelles pages sont consultées et combien de
          visiteurs essaient la démo ou commandent. Ils ne sont déposés qu’après votre accord, donné dans le bandeau affiché à
          votre première visite, et durent au plus 13 mois.
        </li>
      </ul>
      <p>
        Vous pouvez changer d’avis à tout moment avec le lien « Cookies » en bas de chaque page. Vous pouvez aussi désactiver les
        cookies dans les réglages de votre navigateur ; l’espace auteur ne fonctionnera alors plus.
      </p>

      <h2>6. Responsabilité</h2>
      <p>
        Loomina s’efforce de tenir ce site exact et à jour, sans pouvoir garantir l’absence d’erreur ou d’interruption. Les
        sites tiers vers lesquels il renvoie ne sont pas sous son contrôle.
      </p>

      <h2>7. Droit applicable</h2>
      <p>Les présentes mentions sont régies par le droit français.</p>
    </LegalPage>
  );
}
