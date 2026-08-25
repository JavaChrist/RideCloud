import type { Metadata } from "next";
import { LegalPage, LegalSection, LegalSubsection, LegalCallout } from "@/components/legal/legal-page";
import {
  ACCOUNT_DELETION_MAIL_SUBJECT,
  RIDE_CLOUD_SUPPORT_EMAIL,
  buildAccountDeletionMailto
} from "@/lib/legal/account-deletion";

export const metadata: Metadata = {
  title: "Supprimer mon compte RideCloud",
  description:
    "Demandez la suppression de votre compte RideCloud et des données associées, depuis l'application ou par e-mail, sans mot de passe.",
  robots: { index: true, follow: false }
};

const toc = [
  { id: "application", label: "Depuis l'application" },
  { id: "web", label: "Sans accès à l'application" },
  { id: "supprime", label: "Données supprimées" },
  { id: "conservees", label: "Données pouvant être conservées" },
  { id: "delai", label: "Délai de traitement" },
  { id: "partiel", label: "Certaines données sans supprimer le compte" },
  { id: "liens", label: "Pages associées" }
];

export default function SuppressionComptePage() {
  const mailto = buildAccountDeletionMailto();

  return (
    <LegalPage
      badge="RideCloud · JavaChrist"
      title="Supprimer mon compte RideCloud"
      description="Page publique permettant de demander la suppression de votre compte RideCloud et des données associées. Éditée par JavaChrist. Aucun mot de passe n'est demandé."
      lastUpdated="25 août 2026"
      toc={toc}
    >
      <LegalCallout variant="info">
        Deux moyens existent&nbsp;: la suppression depuis l&apos;application (compte connecté),
        ou une demande par e-mail à{" "}
        <a href={`mailto:${RIDE_CLOUD_SUPPORT_EMAIL}`} className="font-medium underline">
          {RIDE_CLOUD_SUPPORT_EMAIL}
        </a>{" "}
        si vous n&apos;avez plus accès à l&apos;application. Cette page ne déclenche aucune
        suppression automatique.
      </LegalCallout>

      <LegalSection id="application" title="1. Depuis l'application">
        <p>
          Si vous pouvez encore ouvrir RideCloud, la suppression se fait dans l&apos;application&nbsp;:
        </p>
        <p>
          <strong>Paramètres → Supprimer mon compte</strong>
        </p>
        <p>
          Le bouton ouvre une confirmation. RideCloud vous demande de ressaisir
          <strong> l&apos;adresse e-mail</strong> du compte, pas le mot de passe. La
          suppression authentifiée est alors exécutée immédiatement côté serveur.
        </p>
      </LegalSection>

      <LegalSection id="web" title="2. Sans accès à l'application">
        <p>
          Si vous ne pouvez plus vous connecter, envoyez une demande à l&apos;adresse
          de support RideCloud déjà utilisée sur le site&nbsp;:{" "}
          <a
            href={`mailto:${RIDE_CLOUD_SUPPORT_EMAIL}`}
            className="text-blue-700 dark:text-blue-300 hover:underline"
          >
            {RIDE_CLOUD_SUPPORT_EMAIL}
          </a>
          .
        </p>
        <p>Indiquez uniquement&nbsp;:</p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
          <li>l&apos;adresse e-mail associée à votre compte RideCloud&nbsp;;</li>
          <li>une confirmation claire de votre demande de suppression.</li>
        </ul>
        <p>
          Ne transmettez jamais votre mot de passe, un code, un jeton
          d&apos;authentification ou une information bancaire.
        </p>
        <p>
          <a
            href={mailto}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-ride-glow-sm transition hover:bg-blue-700"
          >
            Demander la suppression de mon compte
          </a>
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Ce bouton ouvre votre application de messagerie avec l&apos;objet
          «&nbsp;{ACCOUNT_DELETION_MAIL_SUBJECT}&nbsp;».
        </p>
      </LegalSection>

      <LegalSection id="supprime" title="3. Données supprimées avec le compte">
        <p>
          Lorsque le compte est supprimé, RideCloud efface les données métier
          rattachées à ce compte, telles que confirmées par le mécanisme de
          suppression existant&nbsp;:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
          <li>le compte RideCloud et le profil utilisateur&nbsp;;</li>
          <li>les véhicules&nbsp;;</li>
          <li>l&apos;historique des entretiens, les plans d&apos;entretien et les échéances / rappels&nbsp;;</li>
          <li>les modifications enregistrées&nbsp;;</li>
          <li>les documents et fichiers associés dans RideCloud Storage&nbsp;;</li>
          <li>les notifications internes&nbsp;;</li>
          <li>les souscriptions Web Push&nbsp;;</li>
          <li>les jetons Android FCM liés au compte&nbsp;;</li>
          <li>les autres données métier directement rattachées au compte (suppression en cascade avec le compte d&apos;authentification).</li>
        </ul>
        <p>
          Si un abonnement Mollie est encore actif, RideCloud tente de le
          résilier avant la suppression. Cette étape n&apos;est pas bloquante si
          Mollie est indisponible.
        </p>
      </LegalSection>

      <LegalSection id="conservees" title="4. Données pouvant être conservées">
        <p>
          Certaines traces peuvent subsister hors du compte RideCloud, pour des
          raisons déjà décrites dans la{" "}
          <a href="/confidentialite" className="text-blue-700 dark:text-blue-300 hover:underline">
            politique de confidentialité
          </a>
          &nbsp;:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
          <li>
            <strong>Traces de paiement / facturation Mollie</strong> — RideCloud
            n&apos;enregistre pas les données de carte. Mollie peut conserver les
            justificatifs de paiement. Les données comptables sont mentionnées
            dans la politique avec une conservation de <strong>10 ans</strong>{" "}
            (article L.123-22 du Code de commerce).
          </li>
          <li>
            <strong>E-mails transactionnels Resend</strong> — les messages déjà
            envoyés (confirmation, réinitialisation, etc.) peuvent rester chez
            ce prestataire. Aucune durée distincte n&apos;est publiée au-delà des
            règles générales de la politique.
          </li>
          <li>
            <strong>Logs techniques d&apos;hébergement</strong> — jusqu&apos;à{" "}
            <strong>12 mois</strong> maximum, selon la politique de confidentialité.
          </li>
          <li>
            <strong>Sauvegardes</strong> — rétention de <strong>7 jours</strong>{" "}
            mentionnée dans la politique de confidentialité. La suppression
            définitive des données du compte est prévue dans un délai maximal de{" "}
            <strong>30 jours</strong>, sauf obligation légale contraire.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="delai" title="5. Délai de traitement">
        <LegalSubsection title="Depuis l'application">
          <p>
            La suppression authentifiée est exécutée immédiatement côté serveur.
            La politique de confidentialité prévoit ensuite un délai maximal de{" "}
            <strong>30 jours</strong> pour l&apos;effacement définitif (sauvegardes
            incluses), sauf obligation légale contraire.
          </p>
        </LegalSubsection>
        <LegalSubsection title="Demande par e-mail">
          <p>
            La demande sera traitée après vérification de l&apos;identité du
            titulaire du compte conformément aux obligations applicables. La
            page{" "}
            <a href="/rgpd" className="text-blue-700 dark:text-blue-300 hover:underline">
              RGPD
            </a>{" "}
            prévoit une réponse dans un délai maximal d&apos;<strong>un mois</strong>{" "}
            (article 12 du RGPD).
          </p>
        </LegalSubsection>
      </LegalSection>

      <LegalSection id="partiel" title="6. Supprimer certaines données sans supprimer mon compte">
        <p>
          RideCloud permet déjà de retirer des données précises dans
          l&apos;application, sans supprimer le compte. Ce n&apos;est pas une
          demande globale d&apos;effacement&nbsp;: chaque action concerne
          uniquement l&apos;élément choisi.
        </p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
          <li>supprimer un véhicule&nbsp;;</li>
          <li>supprimer un entretien ou une échéance&nbsp;;</li>
          <li>supprimer un document ou une modification&nbsp;;</li>
          <li>supprimer une notification de l&apos;inbox&nbsp;;</li>
          <li>désactiver les notifications push (le jeton ou la souscription de l&apos;installation courante est alors retiré).</li>
        </ul>
        <p>
          Pour supprimer <strong>toutes</strong> les données du compte, utilisez
          la suppression de compte (section 1 ou 2).
        </p>
      </LegalSection>

      <LegalSection id="liens" title="7. Pages associées">
        <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
          <li>
            <a href="/confidentialite" className="text-blue-700 dark:text-blue-300 hover:underline">
              Politique de confidentialité
            </a>
          </li>
          <li>
            <a href="/rgpd" className="text-blue-700 dark:text-blue-300 hover:underline">
              Vos droits RGPD
            </a>
          </li>
        </ul>
      </LegalSection>
    </LegalPage>
  );
}
