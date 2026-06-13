# RideCloud — Product Sheet

> Le carnet d'entretien intelligent de tous vos véhicules, dans le cloud — augmenté par l'IA.

---

## 1. Informations générales

| Champ | Valeur |
| --- | --- |
| Nom de l'application | RideCloud |
| Type d'application | SaaS web responsive + PWA installable |
| Catégorie | Productivité / Automobile / Lifestyle |
| Langue | Français (FR) — internationalisation prévue |
| Statut du projet | **En production** — bêta publique ouverte |
| Plateformes | Web (desktop), Mobile (PWA iOS/Android), Tablette |
| Domaine | `ridecloud.app` (DNS IONOS, TLS automatique Vercel) |
| Modèle économique | Freemium SaaS — paiements Mollie (SEPA + carte) |
| Hébergement | Vercel (frontend, EU) + Supabase (DB, EU) |
| IA embarquée | Plan d'entretien personnalisé via Mistral AI |

### Description courte

RideCloud est l'application SaaS qui centralise la vie, l'entretien et les coûts de tous vos véhicules — voiture, moto, scooter, utilitaire — dans un carnet numérique intelligent, augmenté par l'IA et accessible partout.

### Description détaillée

RideCloud est une plateforme web et PWA en français qui remplace les carnets d'entretien papier, les classeurs de factures et les rappels manuels sur smartphone. L'application centralise l'historique complet de chaque véhicule (entretiens, modifications, documents, coûts) et **génère automatiquement un plan d'entretien personnalisé par marque, modèle et année** — via une base de règles constructeur en dur, complétée à la demande par une **IA Mistral** pour les modèles non couverts.

Chaque utilisateur dispose d'un espace sécurisé où il peut :

- suivre plusieurs véhicules en parallèle (1 en Free, 5 en Premium, 15 en Family),
- recevoir des rappels intelligents segmentés (urgent / important / normal),
- mettre à jour le compteur kilométrique à tout moment (modale dédiée avec incréments rapides),
- marquer toutes les révisions périodiques comme à jour en 1 clic (utile pour véhicules d'occasion),
- visualiser ses coûts (mois / année / total / coût au km),
- exporter son dossier véhicule en JSON, ZIP ou PDF,
- importer un dossier existant pour migrer ses données,
- archiver tous ses documents (carte grise, assurance, factures),
- supprimer son compte et toutes ses données en 1 clic (RGPD by design).

L'objectif : que vendre, acheter, entretenir ou transmettre un véhicule devienne aussi simple qu'envoyer un lien.

### Statut du projet

- **Phase actuelle** : **production ouverte**, bêta publique.
- **Couverture fonctionnelle** : authentification PKCE, CRUD complet multi-catégories, plan d'entretien intelligent + IA, exports/imports, paiements récurrents Mollie, conformité RGPD complète, emails transactionnels personnalisés.
- **Disponibilité** : `https://ridecloud.app` — accessible à tout utilisateur disposant d'un email.
- **Prochaine étape** : campagne d'acquisition + onboarding optimisé + premières intégrations partenaires.

---

## 2. Positionnement produit

### Vision du produit

Devenir le carnet d'entretien numérique de référence pour les conducteurs européens — celui qui suit le véhicule toute sa vie, change de propriétaire avec lui, et transforme la possession d'un véhicule en expérience claire, sereine et valorisante.

### Objectif principal

Permettre à n'importe quel propriétaire de véhicule, sans expertise mécanique, de **savoir exactement ce que son véhicule a vécu, ce qu'il doit faire, et combien il lui coûte**, en moins de 10 secondes par jour.

### Problèmes résolus

- **Perte d'historique** : factures perdues, carnet papier oublié, données dispersées entre garages.
- **Oubli des entretiens** : pas de rappels intelligents adaptés au modèle.
- **Manque de visibilité financière** : impossible de connaître le vrai coût annuel de son véhicule.
- **Revente dévalorisée** : sans historique propre, un véhicule perd 10 à 20 % de sa valeur.
- **Charge mentale** : multiplier les véhicules (voiture + moto + utilitaire pro) = chaos administratif.
- **Migration complexe** : impossible aujourd'hui de transférer son historique d'un outil à un autre.
- **Données figées par marque** : la plupart des apps couvrent mal les modèles moins courants. RideCloud comble ce trou avec **un plan IA généré à la volée**.

### Valeur ajoutée

- **Plan d'entretien intelligent hybride** : règles constructeur en dur + génération IA pour les modèles non couverts, avec **cache partagé** entre utilisateurs (1 appel LLM ↔ N utilisateurs du même modèle).
- **Multi-véhicules natif** dès le MVP (voiture, moto, scooter, utilitaire).
- **Export / import portable** : l'utilisateur reste propriétaire de ses données.
- **PWA installable** : zéro friction, pas de store, mise à jour instantanée.
- **UI premium en français**, conçue pour le grand public, pas pour des garagistes.
- **Modales modernes colorées** (système global typé par variante : info, warning, danger, success, IA).
- **Conformité RGPD bout-en-bout** : suppression de compte effective, export portable, mentions légales LCEN, médiateur de la consommation, bannière cookies, hébergement EU.

### Différenciation

| Critère | RideCloud | Apps concurrentes (Drivvo, Fuelio, MyCarTracks…) | Carnet papier / Excel |
| --- | --- | --- | --- |
| Plan d'entretien par marque/modèle | Oui (hardcoded + IA) | Rare / générique | Non |
| Génération IA pour modèles rares | **Oui (Mistral, cache partagé)** | Non | Non |
| Multi-catégories (auto + moto + utilitaire) | Oui, natif | Partiel | Manuel |
| Export ZIP / PDF / JSON portable | Oui | Très limité | Non |
| Import dossier RideCloud (.json) | Oui | Non | Non |
| PWA sans store | Oui | Non (apps natives lourdes) | — |
| UI moderne, premium, française | Oui | UI vieillissante / anglaise | — |
| Rappels segmentés (urgent / important / normal) | Oui | Basique | Non |
| KPI coûts (mois / an / total / km) | Oui | Partiel | Non |
| Marquer véhicule d'occasion comme à jour | Oui (1 clic) | Non | Non |
| Paiements SEPA + carte (Mollie) | Oui | Variable | — |
| Conformité RGPD totale (suppr. compte effective) | Oui | Variable | — |
| Pensé pour la revente / transmission | Oui (dossier transférable) | Non | Non |

---

## 3. Cible utilisateur

### Utilisateurs principaux

1. **Particuliers passionnés ou méticuleux** (25-55 ans) possédant 1 à 3 véhicules.
2. **Motards & scootéristes urbains** très attachés à l'entretien et aux mods.
3. **Indépendants / TPE** (artisans, livreurs, coursiers) avec 1 à 5 utilitaires.
4. **Familles multi-véhicules** (voiture principale + voiture secondaire + scooter ado).
5. **Revendeurs particuliers** qui veulent maximiser la valeur de revente.

### Personas utilisateurs

**Persona 1 — Thomas, 34 ans, ingénieur**

- Possède une Peugeot 3008, une moto Yamaha MT-07, un scooter Vespa.
- Méticuleux, garde toutes ses factures dans un classeur.
- Frustration : ne sait jamais quel véhicule est en retard d'entretien.
- Veut : une vue unifiée, des rappels fiables, un export propre à la revente.

**Persona 2 — Léa, 28 ans, livreuse indépendante**

- Roule 30 000 km/an avec un Renault Kangoo.
- Frustration : oublie ses vidanges, perd ses factures pour la compta.
- Veut : suivi des coûts pour ses notes de frais, rappels automatiques.

**Persona 3 — Marc, 47 ans, père de famille**

- Une Tesla Model Y, une Citroën C3 pour sa femme, un scooter pour son fils.
- Frustration : gère seul l'administratif des 3 véhicules.
- Veut : déléguer la charge mentale à une app simple, pas technique.

**Persona 4 — Karim, 38 ans, artisan plombier**

- Trois utilitaires Renault Trafic.
- Frustration : pas le temps de tenir un carnet, mais redoute les pannes.
- Veut : plan d'entretien auto-piloté pour sa flotte légère.

**Persona 5 — Sophie, 31 ans, acheteuse d'occasion**

- Vient d'acheter une Yamaha Tracer 9 2018 avec 50 000 km.
- Le vendeur a un carnet d'entretien sérieux mais aucun outil numérique.
- Veut : créer un dossier propre dès l'achat, repartir d'un état "tout à jour", et suivre les futures révisions sans surcharger l'app de tâches en retard fictives.

### Besoins utilisateurs

- Centraliser tous les véhicules au même endroit.
- Ne plus rien oublier (vidange, contrôle technique, assurance, pneus).
- Avoir un historique complet et exportable.
- Visualiser ses dépenses réelles.
- Stocker ses documents (carte grise, assurance, factures) en sécurité.
- Accéder à ses données partout, hors-ligne si besoin.
- **Maîtriser ses données** : pouvoir tout exporter ou tout supprimer en 1 clic.

### Frustrations utilisateurs

- Carnets papier perdus ou oubliés chez le garagiste.
- Apps existantes moches, anglaises, lentes ou trop techniques.
- Rappels génériques inutiles.
- Aucun moyen propre de transmettre l'historique lors d'une revente.
- Sentiment de ne pas maîtriser le coût réel de son véhicule.
- Suppression de compte impossible ou cachée dans la plupart des apps.

### Cas d'utilisation

1. **Onboarding** : "J'ajoute ma voiture, RideCloud génère son plan d'entretien automatiquement."
2. **Modèle non couvert (Premium)** : "Mon Honda Civic Type R 2024 n'a pas de plan en dur → bouton **Générer avec l'IA** → 12 tâches en quelques secondes."
3. **Quotidien** : "Je reçois un rappel : pneus à changer dans 800 km."
4. **Mise à jour compteur** : "Je clique sur la jauge, je tape mes 15 230 km du mois, modale validée en 2 secondes."
5. **Achat d'occasion** : "J'ajoute ma moto à 50 000 km, je clique sur **Marquer comme à jour** : toutes les révisions périodiques repartent de zéro à partir d'aujourd'hui."
6. **Après un passage au garage** : "J'ajoute la facture, je marque la vidange comme effectuée."
7. **Fin de mois** : "Je consulte mes coûts du mois sur tous mes véhicules."
8. **Revente** : "J'exporte le dossier complet en PDF + ZIP pour l'acheteur."
9. **Achat d'occasion via dossier** : "Le vendeur m'envoie son dossier RideCloud .json, je l'importe en 1 clic."
10. **Pro** : "Je gère ma flotte de 3 utilitaires depuis un seul tableau de bord."
11. **Sortie du service** : "Je supprime mon compte en 1 clic, toutes mes données sont effacées immédiatement (RGPD art. 17)."

---

## 4. Fonctionnalités

### Fonctionnalités MVP livrées (production)

#### Authentification & comptes
- Auth Supabase **PKCE** (`@supabase/ssr`) : login, register, mot de passe oublié, reset.
- **Acceptation CGU/RGPD** obligatoire à l'inscription (checkbox + lien vers les pages).
- **Confirmation email** via Resend SMTP custom (template HTML premium).
- Bouton **"Renvoyer l'e-mail de confirmation"** sur `/login` pour les comptes non vérifiés.
- Filets de sécurité : `ensureProfile()` à chaque login + trigger SQL `handle_new_user` renforcé.

#### Véhicules
- Catégories : voitures, motos, scooters, utilitaires.
- Ajout / édition / suppression d'un véhicule (modale de confirmation rouge `danger`).
- Onglets fiche véhicule : **Historique**, **Plan d'entretien**, **Chronologie**, **Informations**, **Modifications**, **Documents**.
- CRUD complet : entretiens effectués, entretiens à prévoir, modifications, documents.
- **Mise à jour du compteur** via modale dédiée (incréments rapides : +100 / +500 / +1 000 / +5 000 km), confirmation si valeur < km actuel.
- Photo véhicule (Supabase Storage, format préservé, `object-contain`).

#### Plan d'entretien (cœur produit)
- **Resolver hardcoded** : règles constructeur par marque/modèle pour les modèles populaires.
- **Resolver IA (Premium / Family)** : génération via Mistral AI (`mistral-small-latest`) avec validation Zod stricte (3 à 15 tâches, priorités contraintes, intervalles km/mois).
- **Cache partagé** dans `maintenance_template_cache` : 1 appel LLM par couple `(marque, modèle, année)` → réutilisé par tous les utilisateurs du même véhicule.
- **Bouton "Générer avec l'IA"** dans l'onglet Plan d'entretien (modale violette `ai`).
- **Bouton "Marquer comme à jour"** : initialise `last_done_km` et `last_done_date` sur toutes les tâches périodiques pour un véhicule d'occasion entretenu (modale verte `success`).
- Calcul automatique des prochaines échéances (km + date) basé sur `last_done_*` + `interval_*`.
- Statuts dynamiques : `À venir`, `Bientôt dû`, `En retard`, `À jour`.
- Badges visuels par tâche : statut, source (template/manuel), origine (hardcoded/IA), priorité.

#### Visualisation & rappels
- Bloc KPI **Coûts du véhicule** (mois / année / total / coût au km / cumul entretien / cumul modifications).
- Bloc **Rappels d'entretien** (urgent / important / normal).
- Chronologie unifiée historique + modifications + documents.

#### Exports & imports
- Export **JSON** complet par véhicule (depuis l'API ou l'UI).
- Export **PDF** propre (page dédiée prête à imprimer).
- Export **ZIP** : JSON + PDF + photos + documents joints.
- **Import** d'un dossier RideCloud `.json` (avec fichiers embarqués en base64) → migration complète à la création d'un véhicule.

#### Paiements & abonnement
- Intégration **Mollie** (SEPA + carte) avec subscriptions récurrentes.
- 3 plans : Free / Premium / Family (cf. section 9).
- Page `/tarifs` avec switch mensuel/annuel.
- Webhook `/api/billing/webhook` pour activations automatiques.
- Bouton **"Resynchroniser mon abonnement"** (filet de sécurité : si webhook raté, recherche customer Mollie par email, replie subscription existante, met à jour le profil).
- **Auto-sync post-paiement** : `/parametres?billing=success` déclenche un sync Mollie + toast de confirmation.
- **Rétrogradation automatique** vers Free à l'expiration d'un abonnement annulé (détection à la lecture + cron nightly 02h00 UTC).
- **Résiliation Mollie** automatique lors de la suppression de compte (RGPD art. 17).
- Annulation d'abonnement en 1 clic (plan reste actif jusqu'à la fin de période).
- Badge **"Plan en attente / Actif / Annulé"** dans `/parametres`.

#### Confidentialité & RGPD
- **Bannière cookies** premium (3 niveaux : accepter tout / refuser tout / personnaliser).
- **Suppression de compte effective** (RGPD art. 17) : cascade Supabase + Storage + auth.users.
- Pages légales complètes :
  - **CGU** conformes LCEN + médiateur de la consommation référencé.
  - **Mentions légales**.
  - **Politique de confidentialité** (cookies, finalités, sous-traitants, droits, contact DPO).
  - Page **`/rgpd`** détaillant les droits d'accès, rectification, effacement, portabilité, opposition.
- Hébergement **EU only** (Vercel EU + Supabase EU).
- Service Mistral AI : appelé uniquement avec les métadonnées du véhicule (marque/modèle/année/carburant), aucune donnée personnelle envoyée.

#### Système UI / UX
- **Modales modernes** unifiées via `useConfirm()` (5 variantes colorées : info bleu, warning ambré, danger rouge, success vert, ai violet).
- Animations fade + zoom via `tailwindcss-animate`.
- Toasts Sonner avec couleurs sémantiques.
- Badges `whitespace-nowrap` + auto-wrap intelligent sur longs titres.
- Design system avec tokens dédiés (`ride-gradient-card`, `shadow-ride-sm/xs`, etc.).

### Fonctionnalités principales (V1 — court terme)

- Notifications push & email pour rappels urgents.
- Recherche et filtres avancés sur historique et chronologie.
- Multi-utilisateurs par véhicule (partage conjoint / famille).
- Statistiques multi-véhicules (coût global, comparaison annuelle).
- Tags personnalisables sur les entretiens et modifications.
- Mode hors-ligne complet (PWA + cache Supabase).
- OAuth Google / Apple, magic links.

### Fonctionnalités secondaires

- Galerie photo par véhicule.
- Suivi des pleins de carburant + consommation moyenne.
- Suivi des trajets (km mensuels, usage pro / perso).
- Rappels personnalisés ad hoc ("changer batterie clé").
- Carnet de bord (notes libres, événements).
- Mode sombre / clair / système.

### Fonctionnalités premium futures (monétisation V2+)

- **RideCloud Pro** : flotte multi-véhicules pro (≥ 5 véhicules) avec rôles.
- **Templates constructeurs étendus** : couverture exhaustive (> 500 modèles).
- **Plans IA validés humainement** : badge "Plan certifié" via workflow d'approbation.
- **OCR factures** : photo d'une facture → entrée auto dans l'historique.
- **Intégration assurance / contrôle technique** : rappels officiels.
- **Estimation de valeur de revente** dynamique (cote Argus / La Centrale).
- **Marketplace de revente** : publier le dossier complet en 1 clic.
- **Assistant IA RideCloud** : "Quand dois-je changer ma chaîne ?" → réponse contextuelle par véhicule.
- **Export comptable** (PDF / CSV) pour indépendants.
- **API publique** pour pros et garages partenaires.

---

## 5. Expérience utilisateur

### Style UI/UX

- **Design system** : shadcn/ui + Radix UI + Tailwind, composants accessibles, tokens custom `ride-*`.
- **Typographie** : Plus Jakarta Sans (Google Fonts), hiérarchie claire.
- **Densité d'information maîtrisée** : cartes arrondies (2xl/3xl), KPI, onglets, sans surcharge.
- **Micro-interactions** discrètes (animations Tailwind, transitions douces, modales fade+zoom).
- **Iconographie** : Lucide React, ligne fine, cohérente.
- **Modales unifiées** : 5 variantes sémantiques couvrent 100 % des confirmations.

### Ambiance visuelle

- **Premium mais accessible** : ni austère, ni gadget.
- **Bleu profond confiance** (`#1d4ed8`) + **fond très clair** (`#f8fafc`).
- Touches d'accent **émeraude / ambre / rose / violet** pour les statuts et actions sémantiques.
- Inspiration : **Linear**, **Notion**, **Stripe Dashboard**, **Apple Wallet**.

### Expérience mobile

- PWA installable, plein écran, splash screen propre.
- Navigation pensée d'abord pour le pouce (bottom-friendly).
- Lecture rapide des KPI dès l'ouverture.
- Ajout d'un entretien en moins de 30 secondes.
- Modales adaptatives (full-width mobile, max-w-lg desktop).
- Support hors-ligne progressif.

### Expérience desktop

- Layout large, multi-colonnes (sidebar catégories + détail véhicule).
- Tableaux denses pour historique et chronologie.
- Raccourcis clavier (V1).
- Idéal pour la saisie annuelle ou l'export avant revente.

### Navigation

- **Top-level** : Catégories → Liste véhicules → Détail véhicule.
- **Détail véhicule** : système d'onglets (Historique par défaut).
- **Globale** : barre top avec Paramètres + Déconnexion.
- **Profondeur maximum** : 3 clics pour atteindre n'importe quelle donnée.
- **Page Paramètres** centralise : abonnement, compte, RGPD, suppression, export.

### Accessibilité

- Composants Radix : ARIA + navigation clavier natifs (Esc, Tab, focus trap dans modales).
- Contrastes WCAG AA respectés.
- Labels explicites sur tous les champs (français naturel).
- Tailles de police adaptatives, focus visible.
- Modales fermables par Esc, clic backdrop, bouton X.
- Roadmap : mode contraste élevé, support lecteurs d'écran complet.

---

## 6. Branding

### Couleurs principales

| Rôle | Couleur | HEX |
| --- | --- | --- |
| Primaire (marque) | Bleu RideCloud | `#1d4ed8` |
| Fond clair | Slate 50 | `#f8fafc` |
| Texte principal | Slate 900 | `#0f172a` |
| Succès / À jour | Émeraude | `#10b981` |
| Alerte / Bientôt dû | Ambre | `#f59e0b` |
| Urgent / En retard | Rouge | `#ef4444` |
| IA / Premium | Violet → Indigo | `#7c3aed → #4f46e5` |
| Neutre / Bordures | Slate 200 | `#e2e8f0` |

### Ton de communication

- **Clair, posé, expert sans être pédant.**
- Vouvoiement par défaut côté marketing, tutoiement côté UI produit.
- Phrases courtes, verbes d'action.
- Pas de jargon mécanique inutile.
- Bienveillant : on déculpabilise l'utilisateur ("Ce n'est jamais trop tard pour reprendre le contrôle").

### Style marketing

- **Tech premium + lifestyle automobile**.
- Photos lifestyle : véhicules dans des environnements réels (parking immeuble, garage perso, balade week-end).
- Visuels produit : screenshots dashboard sur fond pastel.
- Vidéos courtes verticales pour réseaux.

### Image de marque

- **Fiable** : on ne perd pas vos données, et on vous les rend en 1 clic.
- **Élégante** : une app qu'on a plaisir à ouvrir.
- **Indépendante** : pas liée à un constructeur, neutre.
- **Européenne** : hébergement EU, RGPD natif, paiements SEPA.

### Valeurs transmises

- **Maîtrise** : reprendre le contrôle de ses véhicules.
- **Sérénité** : ne plus rien oublier.
- **Transparence** : connaître ses vrais coûts.
- **Liberté** : vos données sont exportables et supprimables.
- **Durabilité** : entretenir, c'est prolonger la vie d'un véhicule.

---

## 7. Marketing

### Proposition de valeur

**RideCloud, c'est le carnet d'entretien intelligent de tous vos véhicules — un seul endroit pour suivre, anticiper et valoriser ce que vous conduisez, augmenté par l'IA.**

### Slogans possibles

- *La vie de vos véhicules, enfin dans le cloud.*
- *Conduisez. On s'occupe du reste.*
- *Votre carnet d'entretien, en mieux.*
- *Un véhicule. Une histoire. Un cloud.*
- *Tous vos véhicules, une seule app.*
- *Ne ratez plus jamais un entretien.*
- *Maîtrisez chaque kilomètre.*
- *L'entretien préventif, expliqué par l'IA.*

### Arguments marketing

1. Un plan d'entretien sur mesure pour **votre** modèle, pas un calendrier générique — et **généré par IA** si votre véhicule est rare.
2. Voiture, moto, scooter, utilitaire — tout dans la même app.
3. PWA : zéro store, zéro mise à jour pénible, installation en 3 secondes.
4. Vos données vous appartiennent : export ZIP / PDF / JSON à tout moment, suppression effective en 1 clic.
5. Conçu en France, hébergé en Europe, **RGPD by design**, paiements SEPA via Mollie.
6. Interface premium pensée pour le quotidien, pas pour les pros.
7. Tarifs honnêtes : Free utilisable, Premium à 3,99 €/mois.

### Bénéfices utilisateur (avant / après)

| Avant | Avec RideCloud |
| --- | --- |
| Factures perdues dans des tiroirs | Dossier numérique complet |
| Rappels d'entretien oubliés | Plan intelligent automatique + IA |
| Vente difficile, valeur cassée | Dossier transférable, véhicule valorisé |
| Pas de visibilité sur les coûts | KPI clairs mois / an / km |
| Charge mentale élevée | Sérénité automatisée |
| Données prisonnières d'une app | Export portable + suppression effective |

### Promesse produit

> Vous ajoutez votre véhicule en 60 secondes. RideCloud s'occupe de tout le reste — pour la vie du véhicule.

### Angles marketing possibles

- **Angle pratique** : "Ne plus jamais oublier une vidange."
- **Angle financier** : "Combien vous coûte vraiment votre voiture ?"
- **Angle revente** : "Vendre 1 500 € de plus grâce à un dossier propre."
- **Angle famille** : "Trois véhicules à la maison ? Une seule app."
- **Angle pro** : "Votre flotte, sans Excel."
- **Angle passion** : "Pour ceux qui aiment leurs véhicules."
- **Angle data-ownership** : "Vos données. Exportables. Supprimables. Pour toujours."
- **Angle IA** : "Votre Honda CB650R 2023 n'est pas dans nos bases ? L'IA s'en occupe en 5 secondes."

---

## 8. Technique

### Stack technique

| Couche | Technologie |
| --- | --- |
| Framework | Next.js 16 (App Router, RSC, Server Actions) |
| Langage | TypeScript strict |
| UI | TailwindCSS + shadcn/ui + Radix UI + `tailwindcss-animate` |
| Icônes | Lucide React |
| Formulaires | React Hook Form + Zod |
| Dates | date-fns |
| Notifications UI | Sonner (toasts) + système de modales custom `useConfirm` |
| Backend / BDD | Supabase (Postgres, Auth, Storage, RLS) |
| Auth | Supabase Auth PKCE (`@supabase/ssr`) |
| Paiements | **Mollie API** (`@mollie/api-client`) — SEPA + carte |
| **IA** | **Mistral AI** (`mistral-small-latest`) via REST + Zod validation |
| Emails transactionnels | **Resend SMTP** (custom) via Supabase Auth |
| PWA | next-pwa, manifest, icons multi-tailles |
| Export ZIP | JSZip |
| Linting | ESLint 9 + eslint-config-next |

### Frontend

- App Router avec routes segmentées `(auth)` / `(protected)` / public marketing.
- Server Components par défaut, Client Components ciblés.
- Validation Zod côté formulaires + côté serveur (defense in depth).
- Composants shadcn co-localisés dans `src/components/ui`.
- Logique métier dans `src/lib` (data, validators, utils, supabase, billing, ai, maintenance).
- `ConfirmProvider` monté dans le root layout → modales globales accessibles partout via `useConfirm()`.

### Backend & APIs

Aucune infra serveur custom : tout passe par **Supabase + Routes API Next.js**.

**Tables principales (RLS activée partout)** :

- `profiles` (id, email, plan, plan_status, plan_interval, plan_renews_at, mollie_customer_id, mollie_subscription_id…)
- `vehicles` (categorie, marque, modele, annee, kilometrage, photo_url, etc.)
- `maintenance_entries` (entretiens effectués, lié optionnellement à `maintenance_plan_entry_id`)
- `maintenance_plan_entries` (plan d'entretien : titre, catégorie, intervalles, last_done_*, next_due_*, status, source, **template_source** : hardcoded / ai / community / approved)
- `maintenance_template_cache` (cache partagé des plans IA par couple marque/modèle/année)
- `upcoming_maintenance` (échéances manuelles)
- `modifications` (mods et tuning)
- `documents` (carte grise, assurance, factures avec storage)

**Routes API custom** :

- `POST /api/billing/checkout` — démarrage d'un paiement Mollie
- `POST /api/billing/webhook` — webhook Mollie (activation/renouvellement/échec)
- `POST /api/billing/cancel` — annulation abonnement
- `POST /api/billing/sync` — resynchronisation manuelle (filet de sécurité webhook)
- `POST /api/maintenance/generate-plan` — génération IA (Premium/Family only)
- `POST /api/vehicles/[id]/mark-maintenance-current` — marquer toutes les révisions à jour
- `POST /api/account/delete` — suppression compte RGPD (cascade complète + résiliation Mollie)
- `GET /api/vehicule/[id]/export` — export JSON
- `GET /api/vehicule/[id]/export-zip` — export ZIP complet
- `GET /api/cron/notifications` — cron push quotidien (08h00 UTC)
- `GET /api/cron/downgrade-expired` — cron rétrogradation abos expirés (02h00 UTC)
- `GET /auth/callback` — callback PKCE Supabase + `ensureProfile()`

### IA — Maintenance Generator

- **Modèle** : `mistral-small-latest` (configurable via `MISTRAL_MODEL`).
- **Prompt** : système expert maintenance constructeur, contraintes JSON strictes (3-15 tâches, priorités `normal/important/urgent`, intervalles entiers positifs ou null).
- **Validation Zod** stricte côté serveur sur la réponse LLM (refus si format invalide).
- **Cache partagé** : index unique `(category, marque_normalized, modele_normalized)` → 1 seul appel LLM par couple véhicule pour toute la base utilisateurs.
- **RLS** : lecture du cache ouverte aux utilisateurs authentifiés ; écriture restreinte au `service_role`.
- **Pas de PII envoyée à Mistral** : uniquement marque, modèle, année, carburant.

### Paiements — Mollie

- Customers Mollie liés aux utilisateurs Supabase (`profiles.mollie_customer_id`).
- Workflow : first payment SEPA/carte → mandate → recurring subscription.
- **3 filets de sécurité contre les profils orphelins** :
  1. Trigger SQL `handle_new_user` renforcé (EXCEPTION WHEN OTHERS).
  2. Helper `ensureProfile()` appelé dans checkout, webhook, sync, callback auth.
  3. Bouton **"Resynchroniser mon abonnement"** UX visible sur `/parametres`.
- Resync sait retrouver un customer Mollie par email si `mollie_customer_id` manque en DB.
- Resync sait relier une subscription existante au lieu d'en créer une nouvelle (évite l'erreur "duplicate description").

### Hébergement

- **Frontend** : Vercel (production, EU), edge runtime quand pertinent, déploiement continu via GitHub.
- **Backend & Storage** : Supabase (région EU).
- **Domaine** : `ridecloud.app` (DNS IONOS, A/AAAA + CNAME → Vercel).
- **TLS** : automatique via Vercel (Let's Encrypt).
- **Emails** : Resend (SMTP custom configuré dans Supabase Auth + DNS DKIM/SPF chez IONOS).
- **Monitoring** : Vercel Analytics + Supabase logs + (à venir) Sentry.

### Authentification

- Email + mot de passe via Supabase Auth, **flow PKCE** complet.
- Pages : `/login`, `/register` (avec checkbox CGU/RGPD), `/forgot-password`, `/reset-password`.
- Callback `/auth/callback` qui :
  - Échange le code contre une session.
  - Appelle `ensureProfile()` en filet de sécurité (création de la row `profiles` si absente).
- Middleware Next.js pour protéger les routes `(protected)` + nettoyage des cookies `sb-*` orphelins.
- Roadmap : OAuth (Google, Apple), magic links, 2FA.

### Base de données

- Postgres managé Supabase.
- Schéma versionné dans `supabase/schema.sql`.
- Migrations dans `supabase/migrations/` (ex: AI maintenance plan, backfill profiles, harden trigger).
- Row Level Security activée sur toutes les tables.
- Index sur `user_id`, `vehicle_id`, dates d'échéance, `(category, marque_normalized, modele_normalized)` pour le cache IA.
- Migrations futures via Supabase CLI.

### Conformité légale

- CGU complètes intégrant **médiateur de la consommation** (obligation française).
- Mentions légales LCEN complètes.
- Politique de confidentialité référençant tous les sous-traitants (Supabase, Vercel, Mollie, Mistral, Resend, IONOS).
- Bannière cookies avec 3 niveaux de consentement granulaire.
- Email de support : `support@javachrist.fr`.
- Droit à l'oubli : suppression de compte effective en cascade.

### Fonctionnement PWA

- Manifest `public/manifest.webmanifest` (nom, icônes, couleurs, `display: standalone`).
- Service worker via `next-pwa` (cache stratégique).
- Icônes multi-tailles (16 → 512 px) + Apple touch icon.
- Installation iOS / Android / desktop sans store.
- Mise à jour transparente (déploiement Vercel = release immédiate).
- Roadmap : cache offline complet (Workbox), background sync pour les rappels.

---

## 9. Business

### Modèle économique

**Freemium SaaS** avec montée en gamme par usage et fonctionnalités premium. **Paiements récurrents Mollie** (SEPA + carte bancaire).

### Plans tarifaires (actifs en production)

| Plan | Prix mensuel | Prix annuel | Cible | Inclus |
| --- | --- | --- | --- | --- |
| **Free** | 0 € | 0 € | Découverte | **1 véhicule**, fonctionnalités essentielles, export complet, suppression compte effective |
| **Premium** | **3,99 €/mois** | **39 €/an** (-18 %) | Particulier engagé | **5 véhicules**, **plan d'entretien IA**, exports illimités, support prioritaire |
| **Family** | **7,99 €/mois** | **79 €/an** (-18 %) | Familles | **10 véhicules**, IA incluse, partage à venir |

> Note : un plan **RideCloud Pro** (flotte ≥ 15 véhicules, rôles, export comptable, API) est prévu en V2.

### Public visé

- **B2C principal** : particuliers FR 25-55 ans, 1 à 3 véhicules.
- **B2C secondaire** : familles multi-véhicules, passionnés moto.
- **B2B léger** : indépendants, TPE avec 1 à 10 utilitaires (cible plan Family aujourd'hui, Pro demain).
- **Marché géographique** : France d'abord, puis Belgique, Suisse, Luxembourg, puis UE (DE, ES, IT).

### Stratégie de lancement

1. **Phase 0 — Pré-lancement (livré)**
    - Landing page + déploiement Vercel + DNS configuré.
    - Plans tarifaires + paiements Mollie en production.
    - Conformité légale complète.
2. **Phase 1 — Bêta publique ouverte (en cours)**
    - Ouverture à tout utilisateur disposant d'un email.
    - Feedback actif via support@javachrist.fr.
    - Itération hebdomadaire sur l'UX produit.
    - NPS et activation comme métriques principales.
3. **Phase 2 — Acquisition organique (M+1 → M+3)**
    - SEO long-tail (chaque modèle = page d'atterrissage avec son plan IA).
    - Product Hunt + IndieHackers + presse tech FR.
    - Contenu social (TikTok / Reels / LinkedIn).
4. **Phase 3 — Croissance (M+3 et au-delà)**
    - Affiliation (concessionnaires indépendants, garages partenaires).
    - Acquisition payante ciblée (Meta Ads, Google).
    - Intégrations partenaires (assurances, contrôle technique).

### Évolution future

- Plan **Pro** activé à T+6 mois.
- Intégrations partenaires (assurances, contrôle technique, cote véhicule).
- Plans IA validés par expert humain (badge "Plan certifié").
- Lancement EU multi-langue (EN, DE, ES, IT) à T+12 mois.
- API publique + Marketplace de dossiers à T+18 mois.
- Vision : devenir le **passeport numérique du véhicule**, transférable et reconnu.

---

## 10. Réseaux sociaux

### Style de contenu LinkedIn

- **Posture** : fondateur + équipe, "Building RideCloud in public".
- **Formats** : carrousels (8-10 slides), posts texte, behind-the-scenes.
- **Sujets** : décisions produit, choix de stack, métriques d'activation, retours utilisateurs, IA Mistral, conformité RGPD.
- **Ton** : pédagogique, transparent, premium.
- **Cadence** : 2 à 3 posts / semaine.

### Style de contenu Instagram

- **Posture** : "L'app qui prend soin de vos véhicules."
- **Formats** : reels courts, carrousels visuels, stories produit.
- **Sujets** : avant / après historique, tips d'entretien, screenshots beaux, lifestyle automobile, démo IA en action.
- **Ton** : inspirant, esthétique, posé.
- **Cadence** : 3 à 5 posts / semaine + stories quotidiennes.

### Style de contenu TikTok / Reels

- **Posture** : "Saviez-vous que…" + démos express produit.
- **Formats** : vidéos 15-45 s, screen recordings, voix-off claire.
- **Sujets** :
    - "Combien vous coûte vraiment votre voiture ? On a calculé."
    - "3 entretiens que 80 % des gens oublient."
    - "Comment vendre sa voiture 1 500 € plus cher en 1 export."
    - "Ma moto rare n'est dans aucune app… sauf une, grâce à l'IA."
    - Démos rapides : "Ajouter un véhicule en 30 secondes."
- **Ton** : direct, dynamique, jamais condescendant.
- **Cadence** : 4 à 7 vidéos / semaine.

### Types de publications possibles

| Type | Objectif | Canal principal |
| --- | --- | --- |
| Démo produit (screen capture) | Conversion | Reels, TikTok, LinkedIn |
| Tips d'entretien par catégorie | SEO + autorité | Instagram, TikTok, blog |
| Témoignages utilisateurs | Preuve sociale | LinkedIn, Instagram |
| Coulisses build-in-public | Communauté | LinkedIn, X |
| Comparatifs (papier vs RideCloud) | Différenciation | TikTok, Reels |
| Posts éducatifs (coût/km, revente) | Acquisition | LinkedIn, Instagram |
| Démos IA en action | WOW effect | TikTok, LinkedIn |
| Updates produit / changelog | Rétention | Newsletter + LinkedIn |
| UGC (utilisateurs montrant leur dashboard) | Social proof | Instagram, TikTok |

---

## 11. Roadmap

### MVP (livré et déployé en production)

- Authentification PKCE complète (Supabase) + filets de sécurité profil.
- Multi-catégories : voitures, motos, scooters, utilitaires.
- CRUD véhicule + entretiens + modifications + documents.
- Plan d'entretien intelligent : hardcoded par marque/modèle + génération IA Mistral avec cache partagé.
- Bouton "Marquer comme à jour" pour véhicules d'occasion.
- Mise à jour du compteur via modale dédiée.
- KPI coûts + rappels segmentés.
- Export JSON / ZIP / PDF + import JSON.
- **Paiements Mollie** (Free / Premium / Family).
- Système de modales modernes (5 variantes colorées).
- **Conformité RGPD complète** (CGU, mentions, politique, cookies, suppression).
- **Emails transactionnels** Resend (templates HTML premium).
- **Déployé en production** sur `ridecloud.app`.
- PWA installable, UI française complète.

### Version 1 (1 à 3 mois)

- Notifications email + push (rappels urgents).
- Recherche & filtres avancés sur chronologie / historique.
- Mode hors-ligne robuste.
- Statistiques multi-véhicules (dashboard global).
- Galerie photo par véhicule.
- Suivi carburant + consommation.
- OAuth Google / Apple + magic links.
- Mode sombre.
- Onboarding guidé (tooltips, vidéos courtes).

### Version 2 (3 à 6 mois)

- Partage multi-utilisateurs par véhicule (plan Family).
- Templates IA validés par expert humain (badge "Plan certifié").
- OCR factures → entrée auto dans l'historique.
- Estimation de cote dynamique (Argus / La Centrale).
- Intégration contrôle technique officielle.
- Export comptable indépendants.
- Internationalisation EN.

### Version 3 et au-delà (6 à 18 mois)

- **RideCloud Pro** (flotte légère ≥ 15 véhicules).
- API publique + écosystème partenaires.
- Marketplace de dossiers / revente facilitée.
- Assistant IA contextuel par véhicule (questions/réponses).
- Expansion EU multi-langue (DE, ES, IT, EN).
- Apps natives iOS / Android (si pertinent vs PWA).
- "Passeport numérique du véhicule" — standard partagé entre acheteurs / vendeurs.
- Partenariats constructeurs (intégration officielle des plans d'entretien).
- Partenariats assurances (réductions sur dossier propre).
- Programme "RideCloud Verified" pour véhicules d'occasion.
- Données agrégées anonymisées (insights marché automobile).
- Hub communautaire (forums modèles, tutos entretien).

---

## 12. Conformité légale & RGPD

### Cadre réglementaire

- **RGPD** (UE 2016/679) — base juridique du traitement, droits des utilisateurs, exercice effectif.
- **LCEN** (Loi pour la Confiance dans l'Économie Numérique) — mentions légales obligatoires.
- **Code de la consommation** — référence d'un médiateur de la consommation (CGU).
- **Directive ePrivacy** — bannière cookies avec consentement granulaire.

### Pages publiques disponibles

- `/cgu` — Conditions Générales d'Utilisation.
- `/mentions-legales` — Mentions légales LCEN complètes.
- `/confidentialite` — Politique de confidentialité (cookies, finalités, sous-traitants, droits, contact DPO).
- `/rgpd` — Détail des droits d'accès, rectification, effacement, portabilité, opposition.

### Sous-traitants déclarés

| Sous-traitant | Fonction | Localisation |
| --- | --- | --- |
| Supabase Inc. | Base de données, auth, storage | UE (Frankfurt) |
| Vercel Inc. | Hébergement frontend + CDN | UE (Frankfurt) |
| Mollie B.V. | Paiements récurrents SEPA + carte | UE (Pays-Bas) |
| Mistral AI SAS | Génération de plans d'entretien IA (métadonnées techniques uniquement) | UE (France) |
| Resend, Inc. | Emails transactionnels | UE (Irlande) |
| IONOS SE | DNS du domaine | UE (Allemagne) |

### Droits utilisateurs effectifs

- **Accès** : export JSON / ZIP / PDF complet en 1 clic depuis la fiche véhicule.
- **Rectification** : édition libre de toutes les données depuis l'UI.
- **Effacement** : suppression de compte avec cascade Supabase + Storage + auth.users en quelques secondes.
- **Portabilité** : export JSON/ZIP transférable vers tout autre outil.
- **Opposition** : refus des cookies non essentiels via bannière à 3 niveaux.
- **Contact DPO/support** : `support@javachrist.fr`.

### Sécurité technique

- TLS 1.3 systématique (HSTS).
- Row Level Security (RLS) sur toutes les tables Supabase.
- Service role key utilisé uniquement côté serveur, jamais exposé.
- Webhooks signés (Mollie).
- Mots de passe hashés via Supabase Auth.
- Bouton de déconnexion explicite.
- Tokens orphelins nettoyés automatiquement par le middleware.

---

## Annexe — Identité technique synthétique

```text
Produit       : RideCloud
URL           : https://ridecloud.app
Stack         : Next.js 16 · TypeScript · TailwindCSS · shadcn/ui · Supabase · PWA
IA            : Mistral AI (mistral-small-latest) avec cache partagé
Paiements     : Mollie (SEPA + carte) — Free / Premium 3,99 € / Family 7,99 €
Emails        : Resend SMTP custom
Statut        : En production · bêta publique ouverte
Couleur clé   : #1d4ed8 (bleu) · #7c3aed → #4f46e5 (gradient IA)
Domaine       : ridecloud.app (DNS IONOS, TLS Vercel)
Modèle        : Freemium SaaS récurrent
Conformité    : RGPD · LCEN · ePrivacy · médiateur de la consommation
Marchés       : FR → BE / CH / LU → UE
Support       : support@javachrist.fr
```
