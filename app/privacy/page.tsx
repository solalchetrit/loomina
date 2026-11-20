import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import LegalPage from "@/components/LegalPage";
import { SELLER } from "@/config/legal";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Politique de confidentialité",
    description: "Quelles données Loomina collecte, pourquoi, où elles sont stockées, et vos droits.",
    path: "/privacy",
  }),
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Ce que nous faisons de vos données" updated="20 novembre 2026">
      <h2>1. Ce que nous collectons</h2>
      <ul>
        <li>
          <strong>À la commande :</strong> prénom, nom, numéro de téléphone et e-mail de la personne qui racontera, et de la
          personne qui commande si elle est différente. Le paiement est traité par Stripe ; nous ne voyons pas votre numéro de
          carte.
        </li>
        <li>
          <strong>Pendant les appels :</strong> la transcription de ce que vous dites et de ce que Loomina répond, l’enregistrement
          audio de vos entretiens et de la démonstration, ainsi que le numéro appelant, la date et la durée de l’appel.
        </li>
        <li>
          <strong>Pendant la démonstration gratuite :</strong> la transcription de l’appel et le numéro appelant, pour écrire votre
          récit et vous l’envoyer par SMS, puis l’e-mail que vous nous donnez pour le recevoir en PDF. L’appel est aussi enregistré
          (vous en êtes prévenu dès le début), pour améliorer la qualité de la voix. Le récit, la transcription et l’enregistrement
          sont effacés au bout de 30 jours.
        </li>
        <li>
          <strong>Pour le livre :</strong> les récits et les chapitres écrits, vos corrections, et les photographies que vous nous envoyez.
        </li>
        <li>
          <strong>Sur le site :</strong> des mesures d’audience anonymisées (Google Analytics), et les messages que vous nous
          envoyez via la page contact.
        </li>
      </ul>

      <h2>2. Pourquoi, et sur quelle base</h2>
      <p>
        Vos paroles et vos textes ne sont ni revendus, ni utilisés pour autre chose que ce qui suit, et ne servent pas à
        entraîner des modèles d’intelligence artificielle.
      </p>
      <ul>
        <li>
          <strong>Écrire, mettre en page, imprimer et livrer votre livre</strong>, et vous en envoyer le PDF : c’est
          l’exécution du contrat que vous avez passé en commandant.
        </li>
        <li>
          <strong>Écrire le récit de la démonstration</strong> et vous l’envoyer : c’est votre demande, faite en appelant.
        </li>
        <li>
          <strong>Améliorer la qualité de la voix</strong> grâce aux enregistrements de démonstration : c’est notre intérêt
          légitime à corriger les défauts du service. Vous pouvez vous y opposer en raccrochant, ou en nous écrivant pour faire
          effacer l’enregistrement.
        </li>
        <li>
          <strong>Mesurer l’audience du site</strong> : votre consentement, donné dans le bandeau des cookies.
        </li>
        <li>
          <strong>Facturer</strong> : une obligation légale.
        </li>
      </ul>
      <p>
        Un récit de vie peut contenir des informations sensibles, comme votre santé, vos convictions ou vos origines. Vous
        les confiez librement en parlant, pour qu’elles figurent dans votre livre : nous ne les utilisons pour rien d’autre, et
        vous pouvez à tout moment demander qu’un passage soit retiré.
      </p>

      <h2>3. Les personnes citées dans votre récit</h2>
      <p>
        Votre livre parle aussi de vos proches. Ce que vous dites d’eux est traité de la même façon que le reste de votre
        récit, uniquement pour votre livre, et n’est jamais diffusé par Loomina. Le livre est destiné à votre usage privé et
        familial. Une personne citée peut nous écrire pour exercer ses droits.
      </p>

      <h2>4. Qui y a accès</h2>
      <p>
        La personne de l’équipe qui relit votre livre, et les prestataires techniques strictement nécessaires au service :
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> (base de données, centre de données à Paris) : stockage de votre profil, des transcriptions
          et des chapitres.
        </li>
        <li>
          <strong>Twilio</strong> (téléphonie) : acheminement des appels, enregistrement audio des entretiens et des démonstrations, et envoi des SMS.
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
          <strong>Vercel</strong> (hébergement du site), <strong>Render</strong> (hébergement du serveur qui tient les
          appels, à Francfort), <strong>o2switch</strong> (envoi des e-mails, en France) et <strong>Google</strong> (mesure
          d’audience, seulement si vous l’acceptez).
        </li>
      </ul>

      <h2>5. Données envoyées hors d’Europe</h2>
      <p>
        Vos données sont stockées en Europe (Paris et Francfort). Certains prestataires sont américains (OpenAI, Twilio,
        Deepgram, ElevenLabs, Vercel, Stripe, Google) et peuvent traiter des données aux États-Unis. Ces transferts sont
        encadrés par le Data Privacy Framework entre l’Union européenne et les États-Unis, ou par les clauses contractuelles
        types de la Commission européenne.
      </p>

      <h2>6. Combien de temps</h2>
      <p>
        Vos transcriptions, les enregistrements de vos entretiens et vos chapitres sont conservés tant que votre livre est en cours, puis un an après sa livraison,
        pour permettre une correction ou une réimpression. Vous pouvez demander leur suppression plus tôt à tout moment. Les
        données de facturation sont conservées le temps imposé par la loi (dix ans). Les enregistrements et récits de démonstration
        sont effacés au bout de 30 jours. Les cookies de mesure d’audience durent au plus 13 mois.
      </p>

      <h2>7. Vos droits</h2>
      <p>
        Vous pouvez à tout moment accéder à vos données, les corriger, les faire supprimer, en limiter le traitement, vous y
        opposer ou en demander une copie. Il suffit d’écrire à <strong>{SELLER.email}</strong>. Nous répondons dans le
        délai légal d’un mois. Vous pouvez aussi saisir la CNIL (cnil.fr).
      </p>

      <h2>8. Responsable du traitement</h2>
      <p>
        {SELLER.name}, {SELLER.form}, qui exploite la marque {SELLER.brand}, SIRET {SELLER.siret}, {SELLER.address}.
        Contact : {SELLER.email}.
      </p>
    </LegalPage>
  );
}
