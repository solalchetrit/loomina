import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Éditeur, hébergement, propriété intellectuelle et cookies du site loomina.eu.",
  alternates: { canonical: "/legal" },
};

export default function LegalMentionsPage() {
  return (
    <LegalPage eyebrow="Mentions légales" title="Qui édite ce site." updated="7 octobre 2026">
      <h2>1. Éditeur</h2>
      <p>
        Le site www.loomina.eu est édité par <strong>Loomina</strong>, projet en cours de création porté par Solal Chetrit,
        personne physique. Les informations d’immatriculation seront publiées ici dès la création de la société.
      </p>
      <p>
        Directeur de la publication : Solal Chetrit.
        <br />
        Contact : contact@loomina.eu.
      </p>

      <h2>2. Hébergement</h2>
      <p>
        Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (vercel.com). Les données
        des clients sont stockées par Supabase, dans un centre de données situé à Paris (voir la{" "}
        <Link href="/privacy">politique de confidentialité</Link>).
      </p>

      <h2>3. Propriété intellectuelle</h2>
      <p>
        Les textes, images et éléments graphiques du site sont la propriété de Loomina, sauf mention contraire. Toute
        reproduction sans autorisation écrite est interdite (articles L.335-2 et suivants du Code de la propriété
        intellectuelle). Les récits des clients leur appartiennent.
      </p>

      <h2>4. Données personnelles</h2>
      <p>
        Les données collectées sur le site sont traitées conformément au RGPD. Vous disposez d’un droit d’accès, de
        rectification, de suppression, de limitation, d’opposition et de portabilité, à exercer par e-mail à contact@loomina.eu.
        Le détail est dans la <Link href="/privacy">politique de confidentialité</Link>.
      </p>

      <h2>5. Cookies</h2>
      <p>Le site utilise deux types de cookies :</p>
      <ul>
        <li>
          <strong>un cookie de session</strong>, indispensable, posé uniquement lorsque vous vous connectez à votre espace
          auteur ;
        </li>
        <li>
          <strong>des cookies de mesure d’audience</strong> (Google Analytics), qui nous indiquent quelles pages sont consultées.
        </li>
      </ul>
      <p>Vous pouvez désactiver les cookies dans les réglages de votre navigateur ; l’espace auteur ne fonctionnera alors plus.</p>

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
