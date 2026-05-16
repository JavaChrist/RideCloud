import type { Metadata } from "next";
import { LegalPage, LegalSection, LegalSubsection, LegalCallout } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Vos droits RGPD · RideCloud",
  description:
    "Exercez vos droits sur vos données personnelles : accès, rectification, effacement, portabilité, opposition. Procédure détaillée et délais de réponse.",
  robots: { index: true, follow: false }
};

const toc = [
  { id: "intro", label: "Qu'est-ce que le RGPD ?" },
  { id: "acces", label: "Droit d'accès" },
  { id: "rectification", label: "Droit de rectification" },
  { id: "effacement", label: "Droit à l'effacement" },
  { id: "limitation", label: "Droit à la limitation" },
  { id: "portabilite", label: "Droit à la portabilité" },
  { id: "opposition", label: "Droit d'opposition" },
  { id: "consentement", label: "Retrait du consentement" },
  { id: "directives", label: "Sort des données après décès" },
  { id: "exercer", label: "Comment exercer vos droits" },
  { id: "cnil", label: "Recours auprès de la CNIL" }
];

export default function RgpdPage() {
  return (
    <LegalPage
      badge="RGPD · Vos droits"
      title="Vos droits RGPD"
      description="Découvrez les droits dont vous bénéficiez sur vos données personnelles dans RideCloud, et la procédure pour les exercer."
      lastUpdated="17 mai 2026"
      toc={toc}
    >
      <LegalCallout variant="success">
        Nous nous engageons à répondre à toute demande relative à vos droits dans un délai maximal de <strong>1 mois</strong>, conformément à l&apos;article 12 du RGPD.
      </LegalCallout>

      <LegalSection id="intro" title="1. Qu'est-ce que le RGPD ?">
        <p>
          Le <strong>Règlement Général sur la Protection des Données</strong> (RGPD), entré en application le 25 mai 2018, est un texte réglementaire européen qui encadre le traitement des données personnelles sur le territoire de l&apos;Union européenne. Il vous reconnaît un ensemble de droits visant à garantir le contrôle de vos données et leur protection.
        </p>
        <p>
          RideCloud applique strictement le RGPD ainsi que la loi française <strong>n° 78-17 du 6 janvier 1978 modifiée</strong>, dite « Informatique et Libertés ». Pour comprendre comment vos données sont collectées et traitées, consultez notre <a href="/confidentialite" className="text-blue-700 hover:underline">Politique de confidentialité</a>.
        </p>
      </LegalSection>

      <LegalSection id="acces" title="2. Droit d'accès">
        <p>
          <strong>Article 15 du RGPD</strong>. Vous pouvez à tout moment obtenir la confirmation que des données vous concernant sont traitées par RideCloud, et accéder à ces données dans un format compréhensible.
        </p>
        <p>
          Vous recevrez notamment&nbsp;:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700">
          <li>la liste complète des catégories de données vous concernant&nbsp;;</li>
          <li>les finalités de chaque traitement&nbsp;;</li>
          <li>les destinataires ou catégories de destinataires des données&nbsp;;</li>
          <li>la durée de conservation prévue&nbsp;;</li>
          <li>l&apos;origine des données si elles n&apos;ont pas été collectées directement auprès de vous.</li>
        </ul>
      </LegalSection>

      <LegalSection id="rectification" title="3. Droit de rectification">
        <p>
          <strong>Article 16 du RGPD</strong>. Vous avez le droit de demander la correction de toute donnée inexacte ou incomplète vous concernant. Pour la plupart des informations, la rectification est immédiate via votre interface RideCloud (page de profil, paramètres de compte).
        </p>
        <p>
          Pour les données qui ne sont pas directement modifiables (par exemple l&apos;adresse e-mail principale dans certains cas), adressez-nous une demande à <a href="mailto:support@javachrist.fr" className="text-blue-700 hover:underline">support@javachrist.fr</a>.
        </p>
      </LegalSection>

      <LegalSection id="effacement" title="4. Droit à l'effacement (« droit à l'oubli »)">
        <p>
          <strong>Article 17 du RGPD</strong>. Vous pouvez demander la suppression définitive de l&apos;ensemble des données personnelles vous concernant, lorsque l&apos;une des conditions suivantes est remplie&nbsp;:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700">
          <li>les données ne sont plus nécessaires au regard des finalités initiales&nbsp;;</li>
          <li>vous retirez votre consentement&nbsp;;</li>
          <li>vous vous opposez au traitement sans motif légitime impérieux&nbsp;;</li>
          <li>les données ont fait l&apos;objet d&apos;un traitement illicite.</li>
        </ul>

        <LegalSubsection title="Procédure simplifiée">
          <p>
            Vous pouvez également supprimer vous-même votre compte depuis l&apos;interface du Service&nbsp;: page <em>Paramètres → Compte → Supprimer mon compte</em>. La suppression effective intervient sous <strong>30 jours maximum</strong>.
          </p>
          <p className="text-sm text-slate-600">
            Certaines données peuvent être conservées au-delà de ce délai si la loi nous y oblige (obligations comptables, lutte contre la fraude). Dans ce cas, elles sont strictement isolées et inaccessibles en dehors de ces finalités légales.
          </p>
        </LegalSubsection>
      </LegalSection>

      <LegalSection id="limitation" title="5. Droit à la limitation du traitement">
        <p>
          <strong>Article 18 du RGPD</strong>. Vous pouvez demander la suspension temporaire de l&apos;utilisation de vos données, notamment&nbsp;:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700">
          <li>pendant la vérification de l&apos;exactitude de vos données contestées&nbsp;;</li>
          <li>lorsque vous vous êtes opposé à un traitement, le temps que nous vérifiions nos motifs légitimes&nbsp;;</li>
          <li>en cas de traitement illicite si vous préférez la limitation à l&apos;effacement.</li>
        </ul>
      </LegalSection>

      <LegalSection id="portabilite" title="6. Droit à la portabilité">
        <p>
          <strong>Article 20 du RGPD</strong>. Vous avez le droit de récupérer dans un format structuré, couramment utilisé et lisible par machine, l&apos;ensemble des données que vous avez fournies à RideCloud, afin de les transmettre à un autre service.
        </p>
        <p>
          RideCloud propose nativement, depuis l&apos;interface du Service, l&apos;export complet de vos données aux formats&nbsp;:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700">
          <li><strong>JSON</strong> — structuré, exploitable par tout outil de programmation&nbsp;;</li>
          <li><strong>ZIP</strong> — archive complète incluant documents PDF et photos&nbsp;;</li>
          <li><strong>PDF</strong> — synthèse imprimable pour archive personnelle ou cession de véhicule.</li>
        </ul>
        <p>
          Cet export est disponible à tout moment depuis la fiche de chaque véhicule, sans démarche particulière.
        </p>
      </LegalSection>

      <LegalSection id="opposition" title="7. Droit d'opposition">
        <p>
          <strong>Article 21 du RGPD</strong>. Vous pouvez vous opposer, à tout moment et pour des raisons tenant à votre situation particulière, à un traitement de vos données fondé sur l&apos;intérêt légitime de RideCloud (par exemple, l&apos;analyse statistique d&apos;usage).
        </p>
        <p>
          Vous pouvez également vous opposer sans justification au traitement de vos données à des fins de prospection commerciale, en désactivant les notifications correspondantes dans vos paramètres ou en cliquant sur le lien de désinscription présent dans chaque e-mail concerné.
        </p>
      </LegalSection>

      <LegalSection id="consentement" title="8. Retrait du consentement">
        <p>
          <strong>Article 7 du RGPD</strong>. Lorsque le traitement de vos données repose sur votre consentement (par exemple, l&apos;inscription à la newsletter), vous pouvez le retirer à tout moment, sans avoir à justifier votre décision.
        </p>
        <p>
          Le retrait du consentement n&apos;affecte pas la licéité des traitements effectués avant ce retrait, ni les traitements reposant sur d&apos;autres bases légales (exécution du contrat, obligation légale).
        </p>
      </LegalSection>

      <LegalSection id="directives" title="9. Sort de vos données après votre décès">
        <p>
          <strong>Article 85 de la loi Informatique et Libertés</strong>. Vous pouvez définir des directives relatives à la conservation, l&apos;effacement et la communication de vos données après votre décès. Ces directives peuvent être&nbsp;:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-slate-700">
          <li><strong>générales</strong> et porter sur l&apos;ensemble de vos données personnelles, enregistrées auprès d&apos;un tiers de confiance certifié par la CNIL&nbsp;;</li>
          <li><strong>particulières</strong>, spécifiques à RideCloud, à formuler par e-mail à <a href="mailto:support@javachrist.fr" className="text-blue-700 hover:underline">support@javachrist.fr</a>.</li>
        </ul>
      </LegalSection>

      <LegalSection id="exercer" title="10. Comment exercer vos droits ?">
        <p>
          Pour exercer l&apos;un de ces droits, contactez-nous à l&apos;adresse&nbsp;:
        </p>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 shadow-ride-xs">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
            E-mail dédié
          </p>
          <p className="text-lg font-medium text-blue-900">
            <a href="mailto:support@javachrist.fr" className="hover:underline">support@javachrist.fr</a>
          </p>
          <p className="mt-2 text-sm text-blue-800">
            Précisez <strong>« Demande RGPD »</strong> en objet de votre message.
          </p>
        </div>

        <LegalSubsection title="Pièces à fournir">
          <p>
            Afin de garantir la sécurité et la confidentialité de vos données, nous pouvons être amenés à vous demander&nbsp;:
          </p>
          <ul className="ml-4 list-disc space-y-1 text-slate-700">
            <li>l&apos;adresse e-mail associée à votre compte RideCloud&nbsp;;</li>
            <li>en cas de doute sérieux sur votre identité, une copie d&apos;une pièce d&apos;identité officielle (carte d&apos;identité, passeport). Ce document est utilisé exclusivement pour vérifier votre identité et est supprimé dans un délai maximal de <strong>30 jours</strong>.</li>
          </ul>
        </LegalSubsection>

        <LegalSubsection title="Délais de réponse">
          <p>
            Nous nous engageons à répondre dans un délai d&apos;<strong>un mois</strong> à compter de la réception de votre demande. En cas de demande complexe ou nombreuse, ce délai peut être prolongé de <strong>deux mois</strong> supplémentaires, en vous informant des motifs de la prolongation dans le premier mois.
          </p>
          <p>
            La réponse à vos demandes est gratuite, sauf en cas de demande manifestement infondée ou excessive (notamment du fait de leur caractère répétitif), où des frais raisonnables pourront être facturés ou la demande refusée.
          </p>
        </LegalSubsection>
      </LegalSection>

      <LegalSection id="cnil" title="11. Recours auprès de la CNIL">
        <p>
          Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous avez la possibilité d&apos;introduire une réclamation auprès de la <strong>Commission Nationale de l&apos;Informatique et des Libertés</strong> (CNIL)&nbsp;:
        </p>

        <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-5 shadow-ride-xs">
          <p className="font-semibold text-slate-900">CNIL</p>
          <p className="text-sm text-slate-700">
            3 Place de Fontenoy<br />
            TSA 80715<br />
            75334 Paris Cedex 07<br />
            Tél. : 01 53 73 22 22<br />
            <a
              href="https://www.cnil.fr/fr/plaintes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:underline"
            >
              www.cnil.fr/fr/plaintes
            </a>
          </p>
        </div>
      </LegalSection>
    </LegalPage>
  );
}
