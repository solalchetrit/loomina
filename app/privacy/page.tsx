import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Quelles données Loomina collecte, pourquoi, où elles sont stockées, et vos droits.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Ce que nous faisons de vos données" updated="19 novembre 2026">
      <h2>1. Ce que nous collectons</h2>
      <ul>
        <li>
          <strong>À la commande :</strong> prénom, nom, numéro de téléphone et e-mail de la personne qui racontera, et de la
          personne qui commande si elle est différente. Le paiement est traité par Stripe ; nous ne voyons pas votre numéro de
          carte.
        </li>
        <li>
          <strong>Pendant les appels :</strong> la transcription de ce que vous dites et de ce que Loomina répond, l’enregistrement
          audio de vos entretiens (jamais celui de la démonstration), ainsi que le numéro appelant, la date et la durée de l’appel.
        </li>
        <li>
          <strong>Pendant la démonstration gratuite :</strong> la transcription de l’appel et le numéro appelant, pour écrire votre
          récit et vous l’envoyer par SMS, puis l’e-mail que vous nous donnez pour le recevoir en PDF. Pas d’enregistrement audio.
          Le récit et la transcription sont effacés au bout de 30 jours.
        </li>
        <li>
          <strong>Pour le livre :</strong> les récits et les chapitres écrits, vos corrections, et les photographies que vous nous envoyez.
        </li>
        <li>
          <strong>Sur le site :</strong> des mesures d’audience anonymisées (Google Analytics), et les messages que vous nous
          envoyez via la page contact.
        </li>
      </ul>

      <h2>2. Pourquoi</h2>
      <p>
        Uniquement pour écrire, mettre en page, imprimer et vous livrer votre livre, et pour répondre à vos messages. Vos
        paroles et vos textes ne sont ni revendus, ni utilisés pour autre chose, et ne servent pas à entraîner des modèles
        d’intelligence artificielle.
      </p>

      <h2>3. Qui y a accès</h2>
      <p>
        La personne de l’équipe qui relit votre livre, et les prestataires techniques strictement nécessaires au service :
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> (base de données, centre de données à Paris) : stockage de votre profil, des transcriptions
          et des chapitres.
        </li>
        <li>
          <strong>Twilio</strong> (téléphonie) : acheminement des appels, enregistrement audio des entretiens et envoi des SMS.
          Pendant l’appel, Twilio fait transcrire votre voix par <strong>Deepgram</strong> et prononcer les réponses de
          Loomina par <strong>ElevenLabs</strong>.
        </li>
        <li>
          <strong>OpenAI</strong> (intelligence artificielle) : conduite de l’entretien et écriture des récits et des
          chapitres. Les échanges transitent par ses serveurs le temps du traitement, dans le cadre de ses
          conditions d’utilisation pour les entreprises, qui excluent l’entraînement de ses modèles sur vos données.
        </li>
        <li>
          <strong>Stripe</strong> (paiement, et <strong>Klarna</strong> si vous choisissez de payer en plusieurs fois),{" "}
          <strong>Vercel</strong> (hébergement du site) et <strong>Render</strong> (hébergement du serveur qui tient les
          appels, à Francfort).
        </li>
      </ul>

      <h2>4. Combien de temps</h2>
      <p>
        Vos transcriptions, les enregistrements de vos entretiens et vos chapitres sont conservés tant que votre livre est en cours, puis un an après sa livraison,
        pour permettre une correction ou une réimpression. Vous pouvez demander leur suppression plus tôt à tout moment. Les
        données de facturation sont conservées le temps imposé par la loi.
      </p>

      <h2>5. Vos droits</h2>
      <p>
        Vous pouvez à tout moment accéder à vos données, les corriger, les faire supprimer, en limiter le traitement, vous y
        opposer ou en demander une copie. Il suffit d’écrire à <strong>contact@loomina.eu</strong>. Nous répondons dans le
        délai légal d’un mois. Vous pouvez aussi saisir la CNIL (cnil.fr).
      </p>

      <h2>6. Responsable du traitement</h2>
      <p>Solal Chetrit, pour Loomina, projet en cours de création. Contact : contact@loomina.eu.</p>
    </LegalPage>
  );
}
