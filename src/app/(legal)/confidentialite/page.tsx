import type { Metadata } from "next";
import { LegalPage, LegalSection, LegalSubsection, LegalCallout } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Politique de confidentialité · RideCloud",
  description:
    "Politique de confidentialité de RideCloud : données collectées, finalités, bases légales, durées de conservation et sous-traitants.",
  robots: { index: true, follow: false }
};

const toc = [
  { id: "responsable", label: "Responsable du traitement" },
  { id: "donnees", label: "Données collectées" },
  { id: "notifications", label: "Notifications push" },
  { id: "finalites", label: "Finalités et bases légales" },
  { id: "duree", label: "Durées de conservation" },
  { id: "destinataires", label: "Destinataires & sous-traitants" },
  { id: "transferts", label: "Transferts hors UE" },
  { id: "securite", label: "Sécurité" },
  { id: "cookies", label: "Cookies & traceurs" },
  { id: "droits", label: "Vos droits" },
  { id: "contact", label: "Contact" }
];

export default function ConfidentialitePage() {
  return (
    <LegalPage
      badge="Politique de confidentialité"
      title="Politique de confidentialité"
      description="Comment nous collectons, utilisons et protégeons vos données personnelles dans le respect du RGPD et de la loi française Informatique et Libertés."
      lastUpdated="25 août 2026"
      toc={toc}
    >
      <LegalCallout variant="info">
        Cette politique précise les modalités de traitement des données personnelles dans RideCloud. Pour exercer vos droits RGPD (accès, rectification, suppression…), consultez la page <a href="/rgpd" className="font-medium underline">RGPD</a>. Pour demander la suppression de votre compte, voir <a href="/suppression-compte" className="font-medium underline">Supprimer mon compte</a>.
      </LegalCallout>

      <LegalSection id="responsable" title="1. Responsable du traitement">
        <p>
          Le responsable du traitement des données personnelles collectées via RideCloud est <strong>JavaChrist</strong>, entrepreneur individuel, dont les coordonnées complètes figurent dans les <a href="/mentions-legales" className="text-blue-700 dark:text-blue-300 hover:underline">mentions légales</a>.
        </p>
        <p>
          Adresse e-mail dédiée à la protection des données&nbsp;: <a href="mailto:support@javachrist.fr" className="text-blue-700 dark:text-blue-300 hover:underline">support@javachrist.fr</a>
        </p>
        <p>
          L&apos;Éditeur n&apos;est pas tenu de désigner un Délégué à la Protection des Données (DPO) au sens de l&apos;article 37 du RGPD. Toute demande relative aux données personnelles est néanmoins traitée par le représentant légal&nbsp;: <strong>Christian Grohens</strong>.
        </p>
      </LegalSection>

      <LegalSection id="donnees" title="2. Données collectées">
        <p>
          RideCloud collecte uniquement les données strictement nécessaires au fonctionnement du Service. Aucune donnée n&apos;est collectée à votre insu, ni revendue à des tiers.
        </p>

        <LegalSubsection title="2.1 Données de compte">
          <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
            <li>Adresse e-mail (identifiant de connexion)&nbsp;;</li>
            <li>Mot de passe (stocké uniquement sous forme de hash bcrypt, jamais en clair)&nbsp;;</li>
            <li>Identifiant unique généré (UUID)&nbsp;;</li>
            <li>Date d&apos;inscription et date de dernière connexion.</li>
          </ul>
        </LegalSubsection>

        <LegalSubsection title="2.2 Données saisies par l'utilisateur">
          <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
            <li>Informations relatives aux véhicules (marque, modèle, immatriculation, kilométrage, date de mise en circulation, etc.)&nbsp;;</li>
            <li>Historique des entretiens, réparations et révisions&nbsp;;</li>
            <li>Coûts associés (factures, dépenses)&nbsp;;</li>
            <li>Documents téléversés (PDF de factures, photos, attestations)&nbsp;;</li>
            <li>Rappels et messages de l&apos;inbox RideCloud (entretiens, compteur)&nbsp;;</li>
            <li>Préférences d&apos;activation des notifications (Paramètres).</li>
          </ul>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            L&apos;Utilisateur est seul responsable du contenu des données qu&apos;il saisit dans le Service.
          </p>
        </LegalSubsection>

        <LegalSubsection title="2.3 Données techniques">
          <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
            <li>Adresse IP (anonymisée après traitement)&nbsp;;</li>
            <li>Type et version du navigateur&nbsp;;</li>
            <li>Système d&apos;exploitation&nbsp;;</li>
            <li>Pages consultées et durée de session (uniquement à des fins de mesure agrégée et anonyme)&nbsp;;</li>
            <li>
              Identifiants techniques de notification, uniquement après activation&nbsp;: jeton Android FCM
              et identifiant d&apos;installation, ou souscription Web Push (voir section 3).
            </li>
          </ul>
        </LegalSubsection>
      </LegalSection>

      <LegalSection id="notifications" title="3. Notifications push">
        <p>
          RideCloud peut vous envoyer des notifications hors de l&apos;application (rappels
          d&apos;entretien, mise à jour du compteur) uniquement si vous les activez depuis
          <strong> Paramètres → Notifications</strong>. Ces notifications ne servent pas
          à de la publicité ni à du marketing ciblé.
        </p>

        <LegalSubsection title="3.1 Application Android (Google Play)">
          <p>
            Sur l&apos;application Android RideCloud (package <code>fr.javachrist.ridecloud</code>),
            l&apos;acheminement utilise <strong>Firebase Cloud Messaging</strong> (Google).
            Après votre activation et l&apos;autorisation système Android, un
            <strong> jeton technique</strong> (token FCM) est créé par l&apos;appareil.
          </p>
          <p>Ce jeton est stocké dans RideCloud et associé&nbsp;:</p>
          <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
            <li>à votre compte utilisateur (<code>user_id</code>)&nbsp;;</li>
            <li>à la plateforme (<code>android</code>)&nbsp;;</li>
            <li>à l&apos;installation de l&apos;application sur cet appareil (<code>installation_id</code>)&nbsp;;</li>
            <li>à des horodatages techniques (<code>created_at</code>, <code>updated_at</code>, <code>last_seen_at</code>).</li>
          </ul>
          <p>
            Finalité exclusive&nbsp;: permettre à RideCloud d&apos;envoyer, via Firebase, la
            notification que vous avez acceptée (titre, texte, lien interne vers l&apos;app).
            Le jeton n&apos;est pas utilisé pour vous identifier auprès d&apos;annonceurs, ni
            pour un profilage publicitaire.
          </p>
        </LegalSubsection>

        <LegalSubsection title="3.2 Navigateur / PWA (Web Push)">
          <p>
            Sur le web, l&apos;activation enregistre une souscription Web Push (adresse
            d&apos;acheminement du navigateur et clés techniques associées), distincte du
            jeton Android.
          </p>
        </LegalSubsection>

        <LegalSubsection title="3.3 Désactivation et suppression">
          <p>Vous pouvez&nbsp;:</p>
          <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
            <li>désactiver les notifications dans <strong>Paramètres</strong> — le jeton ou la souscription de l&apos;installation courante est alors supprimé côté RideCloud&nbsp;;</li>
            <li>révoquer l&apos;autorisation dans les réglages Android ou du navigateur&nbsp;;</li>
            <li>supprimer votre compte — les jetons et souscriptions liés au compte sont alors effacés avec le compte.</li>
          </ul>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Un jeton devenu invalide peut aussi être retiré automatiquement lorsqu&apos;un
            envoi échoue définitivement.
          </p>
        </LegalSubsection>
      </LegalSection>

      <LegalSection id="finalites" title="4. Finalités et bases légales">
        <p>
          Les données personnelles collectées sont traitées pour les finalités suivantes, sur les bases légales suivantes (article 6 du RGPD)&nbsp;:
        </p>
        <div className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-ride-xs">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800 text-left text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 font-semibold">Finalité</th>
                <th className="px-4 py-3 font-semibold">Base légale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              <tr>
                <td className="px-4 py-3 align-top">Création et gestion du compte utilisateur</td>
                <td className="px-4 py-3 align-top">Exécution du contrat (art. 6.1.b)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 align-top">Fourniture des fonctionnalités du Service (gestion des véhicules, rappels, exports, notifications inbox)</td>
                <td className="px-4 py-3 align-top">Exécution du contrat (art. 6.1.b)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 align-top">Envoi d&apos;e-mails transactionnels (confirmation d&apos;inscription, réinitialisation de mot de passe, rappels)</td>
                <td className="px-4 py-3 align-top">Exécution du contrat (art. 6.1.b)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 align-top">
                  Acheminement des notifications push (Web Push et/ou Android via Firebase Cloud Messaging), uniquement après activation dans les Paramètres
                </td>
                <td className="px-4 py-3 align-top">
                  Même finalité de rappel que le Service. L&apos;enregistrement du jeton ou de la souscription n&apos;a lieu qu&apos;après votre action d&apos;activation (et l&apos;autorisation système le cas échéant).
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 align-top">Amélioration du Service (statistiques d&apos;usage anonymisées)</td>
                <td className="px-4 py-3 align-top">Intérêt légitime (art. 6.1.f)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 align-top">Communication marketing (newsletter, annonces produit)</td>
                <td className="px-4 py-3 align-top">Consentement explicite (art. 6.1.a)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 align-top">Traitement des paiements et gestion des abonnements (via Mollie B.V.)</td>
                <td className="px-4 py-3 align-top">Exécution du contrat (art. 6.1.b)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 align-top">Conformité aux obligations légales (lutte contre la fraude, conservation comptable)</td>
                <td className="px-4 py-3 align-top">Obligation légale (art. 6.1.c)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </LegalSection>

      <LegalSection id="duree" title="5. Durées de conservation">
        <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
          <li><strong>Données de compte actif</strong>&nbsp;: pendant toute la durée d&apos;utilisation du Service&nbsp;;</li>
          <li><strong>Compte inactif</strong>&nbsp;: après 24 mois consécutifs d&apos;inactivité, l&apos;Utilisateur reçoit une notification. À défaut de réactivation dans les 30 jours, le compte est supprimé automatiquement&nbsp;;</li>
          <li><strong>Compte supprimé</strong>&nbsp;: suppression définitive des données dans un délai maximal de <strong>30 jours</strong>, sauf obligations légales contraires. La procédure publique est décrite sur <a href="/suppression-compte" className="text-blue-700 dark:text-blue-300 hover:underline">Supprimer mon compte</a>&nbsp;;</li>
          <li>
            <strong>Jetons Android (FCM) et souscriptions Web Push</strong>&nbsp;: conservés tant que les notifications restent activées pour cette installation.
            Ils sont supprimés lorsque vous désactivez les notifications dans les Paramètres, lorsque le compte est supprimé, ou lorsqu&apos;un jeton/souscription est devenu invalide lors d&apos;un envoi.
            Aucune durée maximale distincte n&apos;est appliquée au-delà de ces événements&nbsp;;
          </li>
          <li><strong>Logs techniques</strong>&nbsp;: 12 mois maximum&nbsp;;</li>
          <li><strong>Données comptables</strong> (factures futures)&nbsp;: 10 ans (article L.123-22 du Code de commerce)&nbsp;;</li>
          <li><strong>Données de prospection</strong> (si consentement)&nbsp;: 3 ans à compter du dernier contact actif.</li>
        </ul>
      </LegalSection>

      <LegalSection id="destinataires" title="6. Destinataires et sous-traitants">
        <p>
          Les données personnelles ne sont communiquées qu&apos;aux personnes habilitées au sein de l&apos;équipe RideCloud, ainsi qu&apos;à des sous-traitants techniques rigoureusement sélectionnés, présentant des garanties suffisantes au regard du RGPD&nbsp;:
        </p>

        <div className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-ride-xs">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800 text-left text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 font-semibold">Sous-traitant</th>
                <th className="px-4 py-3 font-semibold">Rôle</th>
                <th className="px-4 py-3 font-semibold">Localisation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              <tr>
                <td className="px-4 py-3 align-top font-medium">Supabase Inc.</td>
                <td className="px-4 py-3 align-top">Base de données, authentification, stockage de fichiers</td>
                <td className="px-4 py-3 align-top">Frankfurt (UE)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 align-top font-medium">Vercel Inc.</td>
                <td className="px-4 py-3 align-top">Hébergement de l&apos;application web et CDN</td>
                <td className="px-4 py-3 align-top">Frankfurt (UE) — principal</td>
              </tr>
              <tr>
                <td className="px-4 py-3 align-top font-medium">Resend, Inc.</td>
                <td className="px-4 py-3 align-top">Envoi d&apos;e-mails transactionnels</td>
                <td className="px-4 py-3 align-top">Irlande (UE)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 align-top font-medium">IONOS SE</td>
                <td className="px-4 py-3 align-top">Registrar du nom de domaine</td>
                <td className="px-4 py-3 align-top">Allemagne (UE)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 align-top font-medium">Mollie B.V.</td>
                <td className="px-4 py-3 align-top">Traitement des paiements par carte et prélèvement (abonnements Premium et Family) — aucune donnée carte ne transite par RideCloud</td>
                <td className="px-4 py-3 align-top">Pays-Bas (UE)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 align-top font-medium">Mistral AI SAS</td>
                <td className="px-4 py-3 align-top">Génération des plans d&apos;entretien personnalisés (IA) — données transmises : marque, modèle, kilométrage, historique d&apos;entretien, sans identifiant direct</td>
                <td className="px-4 py-3 align-top">France (UE)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 align-top font-medium">Google LLC (Firebase Cloud Messaging)</td>
                <td className="px-4 py-3 align-top">
                  Acheminement des notifications de l&apos;application Android — réception du jeton technique et du contenu de la notification (titre, texte, lien interne) uniquement pour la délivrance
                </td>
                <td className="px-4 py-3 align-top">États-Unis — traitement encadré (CCT / DPF selon les conditions Google)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300">
          Chaque sous-traitant est lié à RideCloud par un contrat de sous-traitance (DPA) conforme à l&apos;article 28 du RGPD, garantissant la confidentialité, la sécurité et la limitation des traitements.
        </p>
      </LegalSection>

      <LegalSection id="transferts" title="7. Transferts hors Union européenne">
        <p>
          RideCloud s&apos;efforce de localiser l&apos;ensemble des traitements au sein de l&apos;Union européenne. Toutefois, certains sous-traitants (Supabase, Vercel, Resend, Google Firebase Cloud Messaging) sont des sociétés constituées aux États-Unis. Les flux de données entre les datacenters européens et les sièges sociaux américains, lorsqu&apos;ils existent (support technique, monitoring, acheminement des notifications Android), sont encadrés par&nbsp;:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
          <li>les <strong>Clauses Contractuelles Types</strong> (CCT) adoptées par la Commission européenne&nbsp;;</li>
          <li>l&apos;adhésion volontaire de ces sous-traitants au <strong>Data Privacy Framework</strong> (DPF) lorsque applicable&nbsp;;</li>
          <li>des mesures techniques complémentaires (chiffrement au repos et en transit, contrôles d&apos;accès stricts).</li>
        </ul>
      </LegalSection>

      <LegalSection id="securite" title="8. Sécurité des données">
        <p>
          L&apos;Éditeur met en œuvre des mesures techniques et organisationnelles appropriées pour garantir la sécurité, la confidentialité et l&apos;intégrité des données personnelles, et notamment&nbsp;:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
          <li>chiffrement TLS (HTTPS) pour toutes les communications entre l&apos;Utilisateur et le Service&nbsp;;</li>
          <li>chiffrement au repos des bases de données (AES-256)&nbsp;;</li>
          <li>hachage des mots de passe avec bcrypt et sel cryptographique&nbsp;;</li>
          <li>authentification multi-facteurs disponible (à venir)&nbsp;;</li>
          <li>contrôle d&apos;accès strict (y compris politiques d&apos;accès sur les jetons de notification, limités au compte concerné)&nbsp;;</li>
          <li>journalisation des actions sensibles&nbsp;;</li>
          <li>sauvegardes automatiques chiffrées avec rétention de 7 jours&nbsp;;</li>
          <li>tests de sécurité réguliers et application immédiate des correctifs critiques.</li>
        </ul>
        <p>
          En cas de violation de données susceptible d&apos;engendrer un risque pour les droits et libertés des Utilisateurs, l&apos;Éditeur s&apos;engage à&nbsp;:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
          <li>notifier la CNIL dans un délai maximal de <strong>72 heures</strong>&nbsp;;</li>
          <li>informer les Utilisateurs concernés sans délai si le risque est élevé.</li>
        </ul>
      </LegalSection>

      <LegalSection id="cookies" title="9. Cookies et traceurs">
        <p>
          RideCloud utilise uniquement des cookies <strong>strictement nécessaires</strong> au fonctionnement du Service, dispensés du recueil de consentement préalable conformément à l&apos;article 82 de la loi Informatique et Libertés&nbsp;:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700 dark:text-slate-200">
          <li><strong>Cookies de session</strong> (Supabase Auth)&nbsp;: maintien de la session connectée&nbsp;;</li>
          <li><strong>Cookies de préférences</strong>&nbsp;: mémorisation des préférences d&apos;affichage de l&apos;Utilisateur.</li>
        </ul>
        <p>
          Aucun cookie de mesure d&apos;audience, de publicité ou de traçage tiers n&apos;est déposé sans consentement explicite. Aucun cookie publicitaire n&apos;est utilisé.
        </p>
        <p>
          L&apos;Utilisateur peut à tout moment configurer son navigateur pour refuser ou supprimer les cookies. La désactivation des cookies strictement nécessaires peut empêcher l&apos;utilisation du Service.
        </p>
      </LegalSection>

      <LegalSection id="droits" title="10. Vos droits">
        <p>
          Conformément au RGPD et à la loi française Informatique et Libertés, vous disposez de plusieurs droits sur vos données personnelles, détaillés sur la page dédiée&nbsp;:
        </p>
        <p>
          <a
            href="/rgpd"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-ride-glow-sm transition hover:bg-blue-700"
          >
            Consulter mes droits RGPD →
          </a>
        </p>
      </LegalSection>

      <LegalSection id="contact" title="11. Contact">
        <p>
          Pour toute question relative à cette politique de confidentialité ou au traitement de vos données personnelles, vous pouvez nous contacter à l&apos;adresse&nbsp;:
        </p>
        <p>
          <a href="mailto:support@javachrist.fr" className="font-medium text-blue-700 dark:text-blue-300 hover:underline">support@javachrist.fr</a>
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Vous disposez également du droit d&apos;introduire une réclamation auprès de la <strong>CNIL</strong> (Commission Nationale de l&apos;Informatique et des Libertés), 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07 — <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-700 dark:text-blue-300 hover:underline">www.cnil.fr</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
