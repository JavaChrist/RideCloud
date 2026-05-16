import type { Metadata } from "next";
import { LegalPage, LegalSection, LegalSubsection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Mentions légales · RideCloud",
  description:
    "Mentions légales de RideCloud : identité de l'éditeur, hébergeur, contact et propriété intellectuelle.",
  robots: { index: true, follow: false }
};

const toc = [
  { id: "editeur", label: "Éditeur du site" },
  { id: "directeur", label: "Directeur de la publication" },
  { id: "hebergeur", label: "Hébergement" },
  { id: "contact", label: "Contact" },
  { id: "propriete", label: "Propriété intellectuelle" },
  { id: "responsabilite", label: "Limitation de responsabilité" },
  { id: "liens", label: "Liens externes" },
  { id: "droit", label: "Droit applicable" }
];

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      badge="Mentions légales"
      title="Mentions légales"
      description="Informations légales relatives à l'édition et à l'hébergement du service RideCloud, conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique."
      lastUpdated="17 mai 2026"
      toc={toc}
    >
      <LegalSection id="editeur" title="1. Éditeur du site">
        <p>Le site et l&apos;application RideCloud, accessibles à l&apos;adresse <strong>https://ridecloud.app</strong>, sont édités par&nbsp;:</p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700">
          <li><strong>Nom commercial</strong> : JavaChrist</li>
          <li><strong>Statut juridique</strong> : Entrepreneur individuel (micro-entreprise)</li>
          <li><strong>Représentant légal</strong> : Christian Grohens</li>
          <li><strong>Adresse postale</strong> : 5 rue Maurice Fonvieille, 31120 Portet-sur-Garonne, France</li>
          <li><strong>SIRET</strong> : 338 593 312 000 30</li>
          <li><strong>SIREN</strong> : 338 593 312</li>
          <li><strong>Code APE / NAF</strong> : 4791A — Vente à distance sur catalogue spécialisé</li>
          <li><strong>TVA intracommunautaire</strong> : non applicable, article 293 B du Code général des impôts (franchise en base de TVA)</li>
          <li><strong>Adresse e-mail</strong> : <a href="mailto:support@javachrist.fr" className="text-blue-700 hover:underline">support@javachrist.fr</a></li>
          <li><strong>Téléphone</strong> : <a href="tel:+33952623171" className="text-blue-700 hover:underline">09 52 62 31 71</a></li>
        </ul>
      </LegalSection>

      <LegalSection id="directeur" title="2. Directeur de la publication">
        <p>
          Le directeur de la publication est <strong>Christian Grohens</strong>, en sa qualité de représentant légal de l&apos;éditeur.
        </p>
      </LegalSection>

      <LegalSection id="hebergeur" title="3. Hébergement">
        <p>
          Le service RideCloud repose sur plusieurs prestataires d&apos;hébergement, tous situés au sein de l&apos;Union européenne&nbsp;:
        </p>

        <LegalSubsection title="Hébergement de l'application web">
          <p>
            <strong>Vercel Inc.</strong> — 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis.<br />
            Les contenus statiques sont distribués via le réseau CDN de Vercel, avec un déploiement principal en région européenne <em>(Frankfurt — fra1)</em>.
          </p>
        </LegalSubsection>

        <LegalSubsection title="Hébergement des données utilisateurs">
          <p>
            <strong>Supabase Inc.</strong> — 970 Toa Payoh North #07-04, Singapore 318992.<br />
            Les données personnelles, l&apos;authentification et le stockage des fichiers sont hébergés par Supabase dans la région <strong>Europe (Frankfurt — eu-central-1)</strong>, conforme RGPD.
          </p>
        </LegalSubsection>

        <LegalSubsection title="Envoi des e-mails transactionnels">
          <p>
            <strong>Resend, Inc.</strong> — 2261 Market Street #5039, San Francisco, CA 94114, États-Unis.<br />
            Les e-mails transactionnels (inscription, réinitialisation de mot de passe, notifications) sont relayés via la région <strong>Europe (Irlande — eu-west-1)</strong>.
          </p>
        </LegalSubsection>

        <LegalSubsection title="Nom de domaine">
          <p>
            <strong>IONOS SE</strong> — Elgendorfer Straße 57, 56410 Montabaur, Allemagne. Registrar du domaine <code>ridecloud.app</code>.
          </p>
        </LegalSubsection>
      </LegalSection>

      <LegalSection id="contact" title="4. Contact">
        <p>
          Pour toute question relative au service, au site ou aux présentes mentions légales, vous pouvez nous contacter à l&apos;adresse&nbsp;:
        </p>
        <p>
          <a href="mailto:support@javachrist.fr" className="font-medium text-blue-700 hover:underline">support@javachrist.fr</a>
        </p>
        <p className="text-sm text-slate-600">
          Pour les demandes liées aux données personnelles, voir la page <a href="/rgpd" className="text-blue-700 hover:underline">RGPD</a>.
        </p>
      </LegalSection>

      <LegalSection id="propriete" title="5. Propriété intellectuelle">
        <p>
          L&apos;ensemble des éléments présents sur RideCloud — incluant sans s&apos;y limiter les textes, le code source, l&apos;interface, les pictogrammes, les illustrations, les logos, les marques et la base de données — sont la propriété exclusive de l&apos;éditeur ou de ses partenaires, et sont protégés par les lois françaises et internationales relatives à la propriété intellectuelle.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication, transmission, dénaturation, totale ou partielle, des éléments du site, quel que soit le procédé utilisé, est interdite sans autorisation écrite préalable de l&apos;éditeur, à l&apos;exception de l&apos;usage privé prévu par l&apos;article L.122-5 du Code de la propriété intellectuelle.
        </p>
        <p>
          La marque <strong>« RideCloud »</strong> et son logo sont la propriété exclusive de l&apos;éditeur. Toute utilisation à titre commercial ou trompeur est strictement interdite.
        </p>
      </LegalSection>

      <LegalSection id="responsabilite" title="6. Limitation de responsabilité">
        <p>
          L&apos;éditeur s&apos;efforce d&apos;assurer au mieux de ses possibilités l&apos;exactitude et la mise à jour des informations diffusées sur RideCloud. Toutefois, il ne peut garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des informations mises à disposition.
        </p>
        <p>
          L&apos;utilisateur reconnaît utiliser RideCloud sous sa seule responsabilité. L&apos;éditeur ne saurait être tenu responsable des dommages directs ou indirects résultant&nbsp;:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700">
          <li>de l&apos;utilisation du service&nbsp;;</li>
          <li>d&apos;un dysfonctionnement technique, d&apos;une indisponibilité temporaire ou d&apos;une perte de données&nbsp;;</li>
          <li>d&apos;une mauvaise interprétation des recommandations d&apos;entretien fournies à titre indicatif&nbsp;;</li>
          <li>d&apos;une action ou inaction d&apos;un tiers en lien avec le service.</li>
        </ul>
        <p>
          Les recommandations et rappels d&apos;entretien proposés par RideCloud sont fournis à titre informatif. Ils ne remplacent en aucun cas l&apos;avis d&apos;un professionnel automobile qualifié, ni les instructions du constructeur de votre véhicule.
        </p>
      </LegalSection>

      <LegalSection id="liens" title="7. Liens vers des sites externes">
        <p>
          Le site RideCloud peut contenir des liens hypertextes pointant vers d&apos;autres sites internet. L&apos;éditeur n&apos;exerce aucun contrôle sur ces sites et ne saurait être tenu responsable de leur contenu, ni des éventuels préjudices qui pourraient résulter de leur consultation.
        </p>
      </LegalSection>

      <LegalSection id="droit" title="8. Droit applicable et juridiction">
        <p>
          Les présentes mentions légales sont régies par le droit français. En cas de litige, et après tentative de résolution amiable, les tribunaux français seront seuls compétents.
        </p>
        <p>
          Conformément aux articles L.611-1 et suivants du Code de la consommation, l&apos;utilisateur consommateur peut recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d&apos;un éventuel litige. Les coordonnées du médiateur désigné par l&apos;éditeur ainsi que les modalités de saisine sont précisées dans les <a href="/cgu#mediateur" className="text-blue-700 hover:underline">Conditions Générales d&apos;Utilisation, section 13</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
