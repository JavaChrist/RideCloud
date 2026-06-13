import type { Metadata } from "next";
import { LegalPage, LegalSection, LegalCallout } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation et de Vente · RideCloud",
  description:
    "Conditions Générales d'Utilisation et de Vente (CGU/CGV) du service RideCloud : accès, compte, tarification, droit de rétractation, résiliation.",
  robots: { index: true, follow: false }
};

const toc = [
  { id: "objet", label: "Objet" },
  { id: "acceptation", label: "Acceptation des CGU" },
  { id: "service", label: "Description du service" },
  { id: "acces", label: "Accès au service" },
  { id: "compte", label: "Compte utilisateur" },
  { id: "obligations", label: "Obligations de l'utilisateur" },
  { id: "donnees-utilisateur", label: "Vos données" },
  { id: "propriete", label: "Propriété intellectuelle" },
  { id: "responsabilite", label: "Responsabilités" },
  { id: "tarifs", label: "Tarification & paiement" },
  { id: "retractation", label: "Rétractation & renonciation" },
  { id: "resiliation", label: "Résiliation des abonnements" },
  { id: "suspension", label: "Suspension du compte" },
  { id: "evolutions", label: "Évolutions du service" },
  { id: "modification", label: "Modification des CGU" },
  { id: "mediateur", label: "Médiateur de la consommation" },
  { id: "droit", label: "Droit applicable" }
];

export default function CguPage() {
  return (
    <LegalPage
      badge="Conditions générales"
      title="Conditions Générales d'Utilisation et de Vente"
      description="Règles d'utilisation et de vente du service RideCloud, applicables à toute personne accédant à l'application et souscrivant à un abonnement payant."
      lastUpdated="13 juin 2026"
      toc={toc}
    >
      <LegalCallout variant="info">
        En créant un compte sur RideCloud, vous acceptez sans réserve les présentes Conditions Générales d&apos;Utilisation ainsi que la <a href="/confidentialite" className="font-medium underline">Politique de confidentialité</a>.
      </LegalCallout>

      <LegalSection id="objet" title="1. Objet">
        <p>
          Les présentes Conditions Générales d&apos;Utilisation (ci-après les « <strong>CGU</strong> ») ont pour objet de définir les modalités et conditions dans lesquelles l&apos;utilisateur (ci-après l&apos;« <strong>Utilisateur</strong> ») peut accéder et utiliser le service RideCloud (ci-après le « <strong>Service</strong> »), édité par <strong>JavaChrist</strong> (ci-après l&apos;« <strong>Éditeur</strong> »).
        </p>
        <p>
          Les CGU constituent un contrat entre l&apos;Utilisateur et l&apos;Éditeur. Elles s&apos;appliquent à l&apos;ensemble des fonctionnalités du Service, accessibles à l&apos;adresse <strong>https://ridecloud.app</strong> et via l&apos;installation de l&apos;application web progressive (PWA).
        </p>
      </LegalSection>

      <LegalSection id="acceptation" title="2. Acceptation des CGU">
        <p>
          L&apos;utilisation du Service est subordonnée à l&apos;acceptation expresse et sans réserve des présentes CGU par l&apos;Utilisateur. Cette acceptation se matérialise lors de la création d&apos;un compte sur le Service, par la case à cocher prévue à cet effet ou par tout autre moyen équivalent.
        </p>
        <p>
          L&apos;Utilisateur déclare avoir la capacité juridique nécessaire pour s&apos;engager au titre des présentes. L&apos;utilisation du Service est réservée aux personnes majeures ou mineures dûment représentées par leur représentant légal.
        </p>
      </LegalSection>

      <LegalSection id="service" title="3. Description du service">
        <p>
          RideCloud est une plateforme de gestion d&apos;entretien automobile, conçue pour les particuliers propriétaires de véhicules. Elle permet notamment, sans s&apos;y limiter&nbsp;:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
          <li>la centralisation des informations relatives à un ou plusieurs véhicules (voiture, moto, scooter, utilitaire)&nbsp;;</li>
          <li>le suivi des entretiens, réparations et révisions effectués&nbsp;;</li>
          <li>la conservation et l&apos;archivage de documents (factures, contrôles techniques, certificats)&nbsp;;</li>
          <li>la mise en place de rappels automatiques basés sur le kilométrage ou la date&nbsp;;</li>
          <li>la visualisation des coûts d&apos;utilisation et l&apos;export des données au format JSON, ZIP ou PDF&nbsp;;</li>
          <li>la cession du dossier complet d&apos;un véhicule à un acheteur tiers.</li>
        </ul>
        <p>
          Le Service est proposé sous forme freemium : un plan <strong>Free</strong> (1 véhicule) gratuit à vie, et des plans payants <strong>Premium</strong> (3,99 €/mois, 5 véhicules) et <strong>Family</strong> (7,99 €/mois, 10 véhicules), avec option annuelle remisée. Les prix incluent les taxes (l&apos;Éditeur bénéficiant de la franchise de TVA, art. 293 B du CGI, aucune TVA n&apos;est facturée). Toute évolution tarifaire fera l&apos;objet d&apos;une notification préalable à l&apos;Utilisateur, dans un délai raisonnable. Les paiements sont traités par <strong>Mollie B.V.</strong> (Pays-Bas), prestataire de services de paiement agréé.
        </p>
      </LegalSection>

      <LegalSection id="acces" title="4. Accès au service">
        <p>
          Le Service est accessible 24 heures sur 24, 7 jours sur 7, sauf cas de force majeure, d&apos;interruption pour maintenance ou de défaillance d&apos;un prestataire technique (notamment Supabase, Vercel, Resend ou le fournisseur d&apos;accès internet de l&apos;Utilisateur).
        </p>
        <p>
          L&apos;Éditeur ne garantit pas une disponibilité ininterrompue du Service et ne saurait être tenu responsable des conséquences d&apos;une indisponibilité, quelle qu&apos;en soit la cause. Il s&apos;efforce néanmoins de maintenir une disponibilité supérieure à <strong>99 %</strong> sur l&apos;année glissante.
        </p>
        <p>
          L&apos;accès au Service nécessite&nbsp;:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
          <li>une connexion internet fonctionnelle&nbsp;;</li>
          <li>un navigateur web moderne (Chrome, Firefox, Safari, Edge — versions récentes)&nbsp;;</li>
          <li>la création d&apos;un compte personnel.</li>
        </ul>
      </LegalSection>

      <LegalSection id="compte" title="5. Compte utilisateur">
        <p>
          La création d&apos;un compte est nécessaire pour accéder à l&apos;ensemble des fonctionnalités du Service. L&apos;Utilisateur s&apos;engage à fournir des informations exactes, complètes et à jour lors de son inscription, notamment une adresse e-mail valide.
        </p>
        <p>
          L&apos;Utilisateur est seul responsable de la confidentialité de ses identifiants. Toute action effectuée depuis son compte est réputée effectuée par lui. En cas d&apos;utilisation frauduleuse ou de soupçon de compromission, l&apos;Utilisateur doit immédiatement modifier son mot de passe et en informer l&apos;Éditeur par e-mail à <a href="mailto:support@javachrist.fr" className="text-blue-700 dark:text-blue-300 hover:underline">support@javachrist.fr</a>.
        </p>
        <p>
          L&apos;Utilisateur peut supprimer son compte à tout moment depuis l&apos;interface du Service. La suppression entraîne l&apos;effacement définitif de l&apos;ensemble des données associées au compte, dans un délai maximal de <strong>30 jours</strong>, sous réserve des obligations légales de conservation incombant à l&apos;Éditeur.
        </p>
      </LegalSection>

      <LegalSection id="obligations" title="6. Obligations de l'utilisateur">
        <p>L&apos;Utilisateur s&apos;engage à&nbsp;:</p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
          <li>utiliser le Service conformément à sa destination et dans le respect des lois en vigueur&nbsp;;</li>
          <li>ne pas porter atteinte aux droits de tiers, notamment aux droits de propriété intellectuelle&nbsp;;</li>
          <li>ne pas tenter d&apos;accéder de manière non autorisée au Service, à ses serveurs ou aux comptes d&apos;autres utilisateurs&nbsp;;</li>
          <li>ne pas introduire de virus, code malveillant ou tout élément susceptible de perturber le fonctionnement du Service&nbsp;;</li>
          <li>ne pas utiliser le Service à des fins commerciales, publicitaires ou de prospection sans autorisation expresse&nbsp;;</li>
          <li>ne pas téléverser de contenu illicite, diffamatoire, contraire à l&apos;ordre public ou aux bonnes mœurs.</li>
        </ul>
        <p>
          Tout manquement à ces obligations pourra entraîner la suspension ou la suppression du compte de l&apos;Utilisateur, sans préavis ni indemnité.
        </p>
      </LegalSection>

      <LegalSection id="donnees-utilisateur" title="7. Vos données et contenus">
        <p>
          L&apos;Utilisateur conserve l&apos;intégralité des droits sur les données et contenus qu&apos;il téléverse ou saisit dans le Service (informations véhicules, factures, photos, notes, etc.).
        </p>
        <p>
          L&apos;Utilisateur concède à l&apos;Éditeur, à titre gratuit et pour la seule durée d&apos;utilisation du Service, une licence non exclusive et non transférable d&apos;hébergement, de stockage et d&apos;affichage de ces contenus, strictement limitée aux fins de fonctionnement du Service.
        </p>
        <p>
          Les modalités de traitement des données personnelles sont détaillées dans la <a href="/confidentialite" className="text-blue-700 dark:text-blue-300 hover:underline">Politique de confidentialité</a> et la page <a href="/rgpd" className="text-blue-700 dark:text-blue-300 hover:underline">RGPD</a>.
        </p>
      </LegalSection>

      <LegalSection id="propriete" title="8. Propriété intellectuelle">
        <p>
          Le Service, son interface, son code source, sa charte graphique, ses textes et l&apos;ensemble de ses composants techniques sont la propriété exclusive de l&apos;Éditeur. Aucune cession ou licence d&apos;aucune sorte n&apos;est consentie à l&apos;Utilisateur, en dehors du droit d&apos;utilisation personnel et non transférable du Service.
        </p>
        <p>
          La marque <strong>RideCloud</strong> et son logo sont protégés par le droit des marques. Leur reproduction, sous quelque forme que ce soit, est interdite sans autorisation écrite préalable.
        </p>
      </LegalSection>

      <LegalSection id="responsabilite" title="9. Responsabilités">
        <p>
          L&apos;Éditeur fournit le Service « en l&apos;état », sans garantie d&apos;adéquation à un usage particulier. Les recommandations d&apos;entretien, rappels et statistiques fournis par le Service sont à titre indicatif et ne sauraient se substituer aux instructions du constructeur du véhicule ni à l&apos;avis d&apos;un professionnel qualifié.
        </p>
        <p>
          L&apos;Éditeur ne saurait être tenu responsable&nbsp;:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
          <li>de la perte de données résultant d&apos;une mauvaise utilisation du Service ou de la suppression volontaire du compte par l&apos;Utilisateur&nbsp;;</li>
          <li>des dommages indirects (perte d&apos;exploitation, perte de chance, préjudice commercial)&nbsp;;</li>
          <li>des conséquences d&apos;une indisponibilité technique imputable à un tiers (hébergeur, FAI, fournisseur d&apos;e-mail).</li>
        </ul>
        <p>
          En tout état de cause, la responsabilité de l&apos;Éditeur, si elle venait à être engagée, serait limitée au montant des sommes effectivement versées par l&apos;Utilisateur au cours des <strong>douze (12) derniers mois</strong>. Le Service étant actuellement gratuit, la responsabilité de l&apos;Éditeur est limitée à un (1) euro symbolique.
        </p>
      </LegalSection>

      <LegalSection id="tarifs" title="10. Tarification, paiement et facturation">
        <p>
          Le Service est proposé selon un modèle <strong>freemium</strong> :
        </p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
          <li><strong>Plan Free</strong> : gratuit à vie, limité à un (1) véhicule&nbsp;;</li>
          <li><strong>Plan Premium</strong> : 3,99 €/mois ou 39 €/an (soit 3,25 €/mois — environ 18 % d&apos;économies), jusqu&apos;à 5 véhicules&nbsp;;</li>
          <li><strong>Plan Family</strong> : 7,99 €/mois ou 79 €/an (soit 6,58 €/mois — environ 18 % d&apos;économies), jusqu&apos;à 10 véhicules.</li>
        </ul>
        <p>
          Les prix affichés sont les prix finaux. L&apos;Éditeur bénéficie de la franchise de TVA prévue à l&apos;<strong>article 293 B du Code général des impôts</strong> : aucune TVA n&apos;est facturée, conformément à la mention « TVA non applicable, art. 293 B du CGI ».
        </p>
        <p>
          Les paiements sont traités exclusivement par <strong>Mollie B.V.</strong> (société de droit néerlandais, agréée en tant qu&apos;établissement de monnaie électronique par la Banque centrale des Pays-Bas — DNB). Aucune donnée carte ne transite ni n&apos;est stockée par l&apos;Éditeur.
        </p>
        <p>
          Les abonnements <strong>mensuels</strong> sont prélevés tous les mois à la date anniversaire de la souscription. Les abonnements <strong>annuels</strong> sont prélevés en une seule fois au moment de la souscription, puis tous les douze (12) mois à la date anniversaire.
        </p>
        <p>
          L&apos;Utilisateur reçoit une <strong>confirmation de paiement par e-mail</strong> à chaque prélèvement, émise par Mollie. Les justificatifs de paiement sont également consultables depuis l&apos;espace personnel.
        </p>
        <p>
          En cas de modification tarifaire, l&apos;Utilisateur est informé par e-mail au moins <strong>30 jours</strong> avant l&apos;entrée en vigueur du nouveau tarif. Il dispose, jusqu&apos;à cette date, du droit de résilier son abonnement sans frais s&apos;il n&apos;accepte pas le nouveau tarif.
        </p>
      </LegalSection>

      <LegalSection id="retractation" title="11. Droit de rétractation et renonciation expresse">
        <LegalCallout variant="warning">
          <strong>Renonciation expresse au droit de rétractation</strong> — En souscrivant à un abonnement payant (Premium ou Family, mensuel ou annuel), l&apos;Utilisateur <strong>demande expressément l&apos;exécution immédiate du Service</strong> et <strong>renonce expressément à son droit de rétractation</strong> de quatorze (14) jours, conformément à l&apos;article <strong>L.&nbsp;221-28, 13°</strong> du Code de la consommation.
        </LegalCallout>
        <p>
          Conformément aux articles <strong>L.&nbsp;221-18 et suivants</strong> du Code de la consommation, l&apos;Utilisateur consommateur dispose en principe d&apos;un délai de quatorze (14) jours pour exercer son droit de rétractation à compter de la conclusion du contrat de vente à distance, sans avoir à justifier de motifs ni à payer de pénalités.
        </p>
        <p>
          Toutefois, l&apos;article <strong>L.&nbsp;221-28, 13°</strong> du Code de la consommation prévoit que ce droit ne peut être exercé pour « la fourniture d&apos;un contenu numérique non fourni sur un support matériel dont l&apos;exécution a commencé après accord préalable exprès du consommateur et renoncement exprès à son droit de rétractation ».
        </p>
        <p>
          Le Service RideCloud étant un <strong>contenu numérique en ligne fourni immédiatement</strong> dès validation du paiement (création du compte, accès au plan souscrit et à toutes ses fonctionnalités), l&apos;Utilisateur est invité, lors de la souscription, à cocher une case par laquelle il&nbsp;:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
          <li>demande expressément l&apos;activation immédiate du Service&nbsp;;</li>
          <li>reconnaît avoir pris connaissance des présentes CGU/CGV&nbsp;;</li>
          <li>renonce expressément à son droit de rétractation de quatorze (14) jours.</li>
        </ul>
        <p>
          La validation de cette case constitue le <strong>recueil du consentement préalable et exprès</strong> requis par la loi. Sans cette validation, le paiement ne peut être initié. Le consentement est horodaté et conservé à des fins de preuve.
        </p>
        <p>
          À défaut de renonciation expresse (cas exceptionnel non prévu par le tunnel actuel), l&apos;Utilisateur conserverait son droit de rétractation pendant 14 jours et pourrait demander le remboursement intégral par e-mail à <a href="mailto:support@javachrist.fr" className="text-blue-700 dark:text-blue-300 hover:underline">support@javachrist.fr</a>.
        </p>
      </LegalSection>

      <LegalSection id="resiliation" title="12. Résiliation des abonnements payants">
        <p>
          L&apos;Utilisateur peut résilier son abonnement à tout moment, sans motif ni préavis, depuis l&apos;interface du Service (<strong>Paramètres → Abonnement → Annuler</strong>) ou par e-mail à <a href="mailto:support@javachrist.fr" className="text-blue-700 dark:text-blue-300 hover:underline">support@javachrist.fr</a>.
        </p>
        <LegalCallout variant="warning">
          <strong>Absence de remboursement au prorata</strong> — Conformément à la renonciation expresse prévue à la section 11 et à l&apos;exécution immédiate du Service, <strong>aucun remboursement du temps restant n&apos;est dû</strong> en cas de résiliation, que l&apos;abonnement soit <strong>mensuel</strong> ou <strong>annuel</strong>.
        </LegalCallout>
        <p>
          Concrètement, en cas de résiliation&nbsp;:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
          <li>l&apos;abonnement reste <strong>pleinement actif jusqu&apos;à la fin de la période payée</strong> (jusqu&apos;à la prochaine échéance mensuelle pour un abonnement mensuel, ou jusqu&apos;à la date anniversaire annuelle pour un abonnement annuel)&nbsp;;</li>
          <li>le renouvellement automatique est désactivé : aucun prélèvement supplémentaire n&apos;est effectué&nbsp;;</li>
          <li>à l&apos;échéance, le compte bascule automatiquement vers le plan Free. Les données restent intactes et exportables&nbsp;;</li>
          <li>la résiliation peut être annulée tant que la période payée n&apos;est pas écoulée, en réactivant l&apos;abonnement depuis Paramètres.</li>
        </ul>
        <p>
          Cette absence de remboursement au prorata vaut <strong>tant pour les abonnements mensuels que pour les abonnements annuels</strong>. Elle est la contrepartie de l&apos;exécution immédiate du Service et de la renonciation expresse au droit de rétractation acceptées lors de la souscription.
        </p>
        <p>
          <strong>Exception</strong> — En cas d&apos;arrêt définitif du Service par l&apos;Éditeur (cf. section 14), un remboursement au prorata du temps restant sera effectué pour les abonnements annuels en cours.
        </p>
      </LegalSection>

      <LegalSection id="suspension" title="13. Suspension du compte par l'Éditeur">
        <p>
          L&apos;Éditeur se réserve le droit de suspendre ou de supprimer le compte d&apos;un Utilisateur en cas de manquement avéré aux présentes CGU (notamment au titre de la section 6), sans préavis ni indemnité, et sans préjudice de tous droits ou actions auxquels l&apos;Éditeur pourrait prétendre.
        </p>
        <p>
          En cas de suspension imputable à l&apos;Utilisateur, aucun remboursement, même partiel, n&apos;est dû. L&apos;Utilisateur reste tenu des sommes éventuellement dues au titre des prélèvements en cours.
        </p>
        <p>
          L&apos;Utilisateur peut également supprimer son compte à tout moment depuis l&apos;interface du Service. La suppression entraîne l&apos;effacement définitif des données associées, conformément à la section 5.
        </p>
      </LegalSection>

      <LegalSection id="evolutions" title="14. Évolutions du service">
        <p>
          L&apos;Éditeur se réserve le droit, à tout moment et sans préavis, de modifier, suspendre ou interrompre tout ou partie des fonctionnalités du Service, notamment dans le cadre de mises à jour techniques, d&apos;améliorations ou de réorganisations.
        </p>
        <p>
          En cas d&apos;arrêt définitif du Service, l&apos;Utilisateur sera informé au minimum <strong>30 jours</strong> à l&apos;avance et disposera de la possibilité d&apos;exporter l&apos;intégralité de ses données.
        </p>
      </LegalSection>

      <LegalSection id="modification" title="15. Modification des CGU">
        <p>
          L&apos;Éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les modifications substantielles seront notifiées à l&apos;Utilisateur par e-mail ou par un avis affiché dans le Service, au minimum <strong>15 jours</strong> avant leur entrée en vigueur.
        </p>
        <p>
          La poursuite de l&apos;utilisation du Service après l&apos;entrée en vigueur de la nouvelle version des CGU vaut acceptation expresse de celle-ci. À défaut d&apos;acceptation, l&apos;Utilisateur dispose du droit de résilier son compte.
        </p>
      </LegalSection>

      <LegalSection id="mediateur" title="16. Médiateur de la consommation">
        <p>
          Conformément aux articles <strong>L.611-1</strong> et <strong>L.612-1</strong> du Code de la consommation, l&apos;Utilisateur consommateur a le droit, en cas de litige avec l&apos;Éditeur n&apos;ayant pas pu être résolu à l&apos;amiable dans un délai d&apos;<strong>un an</strong> à compter de la réclamation écrite, de recourir <strong>gratuitement</strong> au médiateur de la consommation désigné ci-dessous.
        </p>

        <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/40 p-5 shadow-ride-xs">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
            Médiateur de la consommation désigné
          </p>
          <ul className="space-y-1.5 text-sm text-blue-900 dark:text-blue-200">
            <li><strong>Dénomination</strong> : MÉDIATION CONSOMMATION DÉVELOPPEMENT</li>
            <li><strong>Forme juridique</strong> : SAS au capital de 10&nbsp;000&nbsp;€</li>
            <li><strong>Représentant légal</strong> : Madame Anne PILLIAS-PERRON, Présidente</li>
            <li><strong>RCS</strong> : 852 787 472 RCS SAINT-ÉTIENNE</li>
            <li>
              <strong>Adresse</strong> : Centre d&apos;Affaires Stéphanois — Immeuble l&apos;Horizon — Esplanade de France, 3 rue J. Constant Milleret, 42000 Saint-Étienne
            </li>
            <li>
              <strong>Site web</strong> :{" "}
              <a
                href="https://www.medconsodev.eu"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline hover:text-blue-700 dark:hover:text-blue-300"
              >
                www.medconsodev.eu
              </a>
            </li>
            <li>
              <strong>Saisine en ligne</strong> :{" "}
              <a
                href="https://www.medconsodev.eu/mediation-consommation-demande.php"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline hover:text-blue-700 dark:hover:text-blue-300"
              >
                Déposer une demande de médiation
              </a>
            </li>
          </ul>
          <p className="mt-3 text-xs text-blue-800/80 dark:text-blue-300/80">
            Entité de médiation de la consommation référencée par la CECMC (Commission d&apos;Évaluation et de Contrôle de la Médiation de la Consommation) depuis le 1<sup>er</sup> juin 2018.
          </p>
        </div>

        <p>
          L&apos;Utilisateur peut également recourir à la <strong>plateforme européenne de Règlement en Ligne des Litiges</strong> (RLL) mise en place par la Commission européenne, accessible à l&apos;adresse&nbsp;:
        </p>
        <p>
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-700 dark:text-blue-300 hover:underline"
          >
            https://ec.europa.eu/consumers/odr
          </a>
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          La saisine du médiateur est facultative et ne fait pas obstacle aux recours juridictionnels habituels. Le recours à la médiation n&apos;est ouvert qu&apos;après une tentative de résolution amiable préalable directement auprès de l&apos;Éditeur, à l&apos;adresse <a href="mailto:support@javachrist.fr" className="text-blue-700 dark:text-blue-300 hover:underline">support@javachrist.fr</a>.
        </p>
      </LegalSection>

      <LegalSection id="droit" title="17. Droit applicable et juridiction">
        <p>
          Les présentes CGU sont soumises au droit français. En cas de litige, l&apos;Utilisateur et l&apos;Éditeur s&apos;efforceront de trouver une solution amiable avant toute action judiciaire, le cas échéant par l&apos;intermédiaire du médiateur de la consommation visé à la section 16.
        </p>
        <p>
          À défaut de résolution amiable, tout litige relèvera de la compétence exclusive des tribunaux français.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
