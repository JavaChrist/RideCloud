# RideCloud — Product Sheet

> Le carnet d'entretien intelligent de tous vos véhicules, dans le cloud.

---

## 1. Informations générales

| Champ | Valeur |
| --- | --- |
| Nom de l'application | RideCloud |
| Type d'application | SaaS web responsive + PWA installable |
| Catégorie | Productivité / Automobile / Lifestyle |
| Langue | Français (FR) — internationalisation prévue |
| Statut du projet | MVP fonctionnel avancé — pré-bêta privée |
| Plateformes | Web (desktop), Mobile (PWA iOS/Android), Tablette |
| Domaine cible | `ridecloud.app` (ou `ridecloud.fr`) |

### Description courte

RideCloud est l'application SaaS qui centralise la vie, l'entretien et les coûts de tous vos véhicules — voiture, moto, scooter, utilitaire — dans un carnet numérique intelligent, accessible partout.

### Description détaillée

RideCloud est une plateforme web et PWA en français qui remplace les carnets d'entretien papier, les classeurs de factures et les rappels manuels sur smartphone. L'application centralise l'historique complet de chaque véhicule (entretiens, modifications, documents, coûts) et génère automatiquement un **plan d'entretien personnalisé** par marque, modèle et catégorie, avec calcul des prochaines échéances en kilomètres et en jours.

Chaque utilisateur dispose d'un espace sécurisé où il peut :

- suivre plusieurs véhicules en parallèle,
- recevoir des rappels intelligents (urgent / important / normal),
- visualiser ses coûts (mensuel, annuel, total, coût/km),
- exporter son dossier véhicule en JSON, ZIP ou PDF,
- importer un dossier existant pour migrer ses données,
- archiver tous ses documents (carte grise, assurance, factures).

L'objectif : que vendre, acheter, entretenir ou transmettre un véhicule devienne aussi simple qu'envoyer un lien.

### Statut du projet

- **Phase actuelle** : MVP fonctionnel avancé, pré-bêta privée.
- **Couverture fonctionnelle** : authentification, CRUD complet, plan d'entretien intelligent, exports, imports, PWA.
- **Prochaine étape** : ouverture bêta privée (200-500 testeurs sélectionnés).

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

### Valeur ajoutée

- **Plan d'entretien intelligent** par marque/modèle, pas un simple calendrier générique.
- **Multi-véhicules natif** dès le MVP (voiture, moto, scooter, utilitaire).
- **Export / import portable** : l'utilisateur reste propriétaire de ses données.
- **PWA installable** : zéro friction, pas de store, mise à jour instantanée.
- **UI premium en français**, conçue pour le grand public, pas pour des garagistes.

### Différenciation

| Critère | RideCloud | Apps concurrentes (Drivvo, Fuelio, MyCarTracks…) | Carnet papier / Excel |
| --- | --- | --- | --- |
| Plan d'entretien par marque/modèle | Oui | Rare / générique | Non |
| Multi-catégories (auto + moto + utilitaire) | Oui, natif | Partiel | Manuel |
| Export ZIP / PDF / JSON portable | Oui | Très limité | Non |
| PWA sans store | Oui | Non (apps natives lourdes) | — |
| UI moderne, premium, française | Oui | UI vieillissante / anglaise | — |
| Rappels segmentés (urgent / important / normal) | Oui | Basique | Non |
| KPI coûts (mois / an / total / km) | Oui | Partiel | Non |
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

### Besoins utilisateurs

- Centraliser tous les véhicules au même endroit.
- Ne plus rien oublier (vidange, contrôle technique, assurance, pneus).
- Avoir un historique complet et exportable.
- Visualiser ses dépenses réelles.
- Stocker ses documents (carte grise, assurance, factures) en sécurité.
- Accéder à ses données partout, hors-ligne si besoin.

### Frustrations utilisateurs

- Carnets papier perdus ou oubliés chez le garagiste.
- Apps existantes moches, anglaises, lentes ou trop techniques.
- Rappels génériques inutiles.
- Aucun moyen propre de transmettre l'historique lors d'une revente.
- Sentiment de ne pas maîtriser le coût réel de son véhicule.

### Cas d'utilisation

1. **Onboarding** : "J'ajoute ma voiture, RideCloud génère son plan d'entretien."
2. **Quotidien** : "Je reçois un rappel : pneus à changer dans 800 km."
3. **Après un passage au garage** : "J'ajoute la facture, je marque la vidange comme effectuée."
4. **Fin de mois** : "Je consulte mes coûts du mois sur tous mes véhicules."
5. **Revente** : "J'exporte le dossier complet en PDF pour l'acheteur."
6. **Achat d'occasion** : "Le vendeur m'envoie son dossier RideCloud, je l'importe."
7. **Pro** : "Je gère ma flotte de 3 utilitaires depuis un seul tableau de bord."

---

## 4. Fonctionnalités

### Fonctionnalités MVP prioritaires (livrées)

- Authentification Supabase (login, register, mot de passe oublié, reset).
- Catégories de véhicules : voitures, motos, scooters, utilitaires.
- Ajout / édition / suppression d'un véhicule.
- Onglets fiche véhicule : **Historique**, **Plan d'entretien**, **Chronologie**, **Informations**, **Modifications**, **Documents**.
- CRUD complet : entretiens effectués, entretiens à prévoir, modifications, documents.
- Plan d'entretien intelligent par marque/modèle avec fallback catégorie.
- Calcul automatique des prochaines échéances (km + date).
- Statuts dynamiques : `À venir`, `Bientôt dû`, `En retard`.
- Bloc KPI **Coûts du véhicule** (mois / année / total / coût au km).
- Bloc **Rappels d'entretien** (urgent / important / normal).
- Export JSON / ZIP / PDF.
- Import d'un dossier `.json`.
- UI 100 % française, responsive, PWA installable.

### Fonctionnalités principales (V1 — court terme)

- Notifications push & email pour rappels urgents.
- Recherche et filtres avancés sur historique et chronologie.
- Multi-utilisateurs par véhicule (partage conjoint / famille).
- Statistiques multi-véhicules (coût global, comparaison annuelle).
- Tags personnalisables sur les entretiens et modifications.
- Mode hors-ligne complet (PWA + cache Supabase).

### Fonctionnalités secondaires

- Galerie photo par véhicule.
- Suivi des pleins de carburant + consommation moyenne.
- Suivi des trajets (km mensuels, usage pro / perso).
- Rappels personnalisés ad hoc ("changer batterie clé").
- Carnet de bord (notes libres, événements).
- Mode sombre / clair / système.

### Fonctionnalités premium futures (monétisation)

- **RideCloud Pro** : flotte multi-véhicules pro (≥ 3 véhicules) avec rôles.
- **RideCloud Family** : partage familial illimité.
- **Templates constructeurs étendus** : couverture exhaustive (> 200 modèles).
- **OCR factures** : photo d'une facture → entrée auto dans l'historique.
- **Intégration assurance / contrôle technique** : rappels officiels.
- **Estimation de valeur de revente** dynamique (cote Argus / La Centrale).
- **Marketplace de revente** : publier le dossier complet en 1 clic.
- **Assistant IA RideCloud** : "Quand dois-je changer ma chaîne ?" → réponse contextuelle.
- **Export comptable** (PDF / CSV) pour indépendants.
- **API publique** pour pros et garages partenaires.

---

## 5. Expérience utilisateur

### Style UI/UX

- **Design system** : shadcn/ui + Radix + Tailwind, composants accessibles.
- **Typographie** : sans-serif moderne (Geist / Inter), hiérarchie claire.
- **Densité d'information maîtrisée** : cartes, KPI, onglets, sans surcharge.
- **Micro-interactions** discrètes (animations Tailwind, transitions douces).
- **Iconographie** : Lucide React, ligne fine, cohérente.

### Ambiance visuelle

- **Premium mais accessible** : ni austère, ni gadget.
- **Bleu profond confiance** (`#1d4ed8`) + **fond très clair** (`#f8fafc`).
- Touches d'accent **ambre / vert / rouge** pour les statuts (à venir / bientôt / en retard).
- Inspiration : **Linear**, **Notion**, **Stripe Dashboard**, **Apple Wallet**.

### Expérience mobile

- PWA installable, plein écran, splash screen propre.
- Navigation pensée d'abord pour le pouce (bottom-friendly).
- Lecture rapide des KPI dès l'ouverture.
- Ajout d'un entretien en moins de 30 secondes.
- Support hors-ligne progressif.

### Expérience desktop

- Layout large, multi-colonnes (sidebar catégories + détail véhicule).
- Tableaux denses pour historique et chronologie.
- Raccourcis clavier (V1).
- Idéal pour la saisie annuelle ou l'export avant revente.

### Navigation

- **Top-level** : Catégories → Liste véhicules → Détail véhicule.
- **Détail véhicule** : système d'onglets (Historique par défaut).
- **Globale** : barre top avec compte utilisateur + déconnexion.
- **Profondeur maximum** : 3 clics pour atteindre n'importe quelle donnée.

### Accessibilité

- Composants Radix : ARIA + navigation clavier natifs.
- Contrastes WCAG AA respectés.
- Labels explicites sur tous les champs (français naturel).
- Tailles de police adaptatives, focus visible.
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

- **Fiable** : on ne perd pas vos données.
- **Élégante** : une app qu'on a plaisir à ouvrir.
- **Indépendante** : pas liée à un constructeur, neutre.
- **Européenne** : hébergement EU, RGPD natif.

### Valeurs transmises

- **Maîtrise** : reprendre le contrôle de ses véhicules.
- **Sérénité** : ne plus rien oublier.
- **Transparence** : connaître ses vrais coûts.
- **Liberté** : vos données sont exportables.
- **Durabilité** : entretenir, c'est prolonger la vie d'un véhicule.

---

## 7. Marketing

### Proposition de valeur

**RideCloud, c'est le carnet d'entretien intelligent de tous vos véhicules — un seul endroit pour suivre, anticiper et valoriser ce que vous conduisez.**

### Slogans possibles

- *La vie de vos véhicules, enfin dans le cloud.*
- *Conduisez. On s'occupe du reste.*
- *Votre carnet d'entretien, en mieux.*
- *Un véhicule. Une histoire. Un cloud.*
- *Tous vos véhicules, une seule app.*
- *Ne ratez plus jamais un entretien.*
- *Maîtrisez chaque kilomètre.*

### Arguments marketing

1. Un plan d'entretien sur mesure pour **votre** modèle, pas un calendrier générique.
2. Voiture, moto, scooter, utilitaire — tout dans la même app.
3. PWA : zéro store, zéro mise à jour pénible, installation en 3 secondes.
4. Vos données vous appartiennent : export ZIP / PDF / JSON à tout moment.
5. Conçu en France, hébergé en Europe, RGPD by design.
6. Interface premium pensée pour le quotidien, pas pour les pros.

### Bénéfices utilisateur (avant / après)

| Avant | Avec RideCloud |
| --- | --- |
| Factures perdues dans des tiroirs | Dossier numérique complet |
| Rappels d'entretien oubliés | Plan intelligent automatique |
| Vente difficile, valeur cassée | Dossier transférable, véhicule valorisé |
| Pas de visibilité sur les coûts | KPI clairs mois / an / km |
| Charge mentale élevée | Sérénité automatisée |

### Promesse produit

> Vous ajoutez votre véhicule en 60 secondes. RideCloud s'occupe de tout le reste — pour la vie du véhicule.

### Angles marketing possibles

- **Angle pratique** : "Ne plus jamais oublier une vidange."
- **Angle financier** : "Combien vous coûte vraiment votre voiture ?"
- **Angle revente** : "Vendre 1 500 € de plus grâce à un dossier propre."
- **Angle famille** : "Trois véhicules à la maison ? Une seule app."
- **Angle pro** : "Votre flotte, sans Excel."
- **Angle passion** : "Pour ceux qui aiment leurs véhicules."
- **Angle data-ownership** : "Vos données. Exportables. Pour toujours."

---

## 8. Technique

### Stack technique

| Couche | Technologie |
| --- | --- |
| Framework | Next.js 16 (App Router, RSC) |
| Langage | TypeScript |
| UI | TailwindCSS + shadcn/ui + Radix UI |
| Icônes | Lucide React |
| Formulaires | React Hook Form + Zod |
| Dates | date-fns |
| Notifications UI | Sonner (toasts) |
| Backend / BDD | Supabase (Postgres, Auth, Storage, RLS) |
| Auth | Supabase Auth (`@supabase/ssr`) |
| PWA | next-pwa, manifest, icons multi-tailles |
| Export ZIP | JSZip |
| Linting | ESLint 9 + eslint-config-next |

### Frontend

- App Router avec routes segmentées `(auth)` / `(protected)`.
- Server Components par défaut, Client Components ciblés.
- Validation Zod côté formulaires + côté serveur (defense in depth).
- Composants shadcn co-localisés dans `src/components/ui`.
- Logique métier dans `src/lib` (data, validators, utils, supabase).

### Backend

- Pas de serveur custom : tout passe par Supabase + Server Actions Next.js.
- Tables principales : `vehicles`, `maintenance_records`, `maintenance_plan_entries`, `modifications`, `documents`, `categories`.
- RLS Postgres stricte : chaque utilisateur ne voit que ses données.
- Stockage des documents / factures dans Supabase Storage avec policies dédiées.
- Resolver côté serveur pour les templates d'entretien constructeur.

### Hébergement

- **Frontend** : Vercel (édition Pro à terme), edge runtime quand pertinent.
- **Backend & Storage** : Supabase (région EU).
- **Domaine** : Cloudflare DNS, certificat TLS automatique.
- **Monitoring** : Vercel Analytics + Supabase logs + (à venir) Sentry.

### Authentification

- Email + mot de passe via Supabase Auth.
- Pages : `/login`, `/register`, `/forgot-password`, `/reset-password`.
- Middleware Next.js pour protéger les routes `(protected)`.
- Roadmap : OAuth (Google, Apple), magic links, 2FA.

### Base de données

- Postgres managé Supabase.
- Schéma versionné dans `supabase/schema.sql`.
- Row Level Security activée sur toutes les tables.
- Index sur `user_id`, `vehicle_id`, dates d'échéance.
- Migrations futures via Supabase CLI.

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

**Freemium SaaS** avec montée en gamme par usage et fonctionnalités premium.

### Freemium ou abonnement

| Plan | Prix indicatif | Cible | Inclus |
| --- | --- | --- | --- |
| Free | 0 € | Découverte | 1 véhicule, fonctionnalités essentielles, export limité |
| Plus | 3,99 €/mois ou 39 €/an | Particulier engagé | 5 véhicules, rappels avancés, exports illimités, OCR factures |
| Family | 6,99 €/mois ou 69 €/an | Familles | Véhicules illimités, partage 4 comptes |
| Pro | 12,99 €/mois et + | Indépendants / TPE | Flotte, rôles, export comptable, API |

### Public visé

- **B2C principal** : particuliers FR 25-55 ans, 1 à 3 véhicules.
- **B2C secondaire** : familles multi-véhicules, passionnés moto.
- **B2B léger** : indépendants, TPE avec 1 à 10 utilitaires.
- **Marché géographique** : France d'abord, puis Belgique, Suisse, Luxembourg, puis UE (DE, ES, IT).

### Stratégie de lancement

1. **Phase 0 — Pré-lancement (M0)**
    - Landing page + liste d'attente.
    - Communauté Discord / Telegram (early users).
    - Capture des emails via offre "Founders" (lifetime ou 50 % à vie).
2. **Phase 1 — Bêta privée (M1 → M2)**
    - 200-500 utilisateurs sélectionnés.
    - Feedback intensif, itération hebdomadaire.
    - NPS et activation comme métriques principales.
3. **Phase 2 — Bêta publique (M3 → M5)**
    - Ouverture du Free illimité.
    - Activation freemium (Plus à 3,99 €).
    - Product Hunt + IndieHackers + presse tech FR.
4. **Phase 3 — Croissance (M6+)**
    - SEO long-tail (templates par marque/modèle = pages d'atterrissage).
    - Affiliation (concessionnaires indépendants, garages partenaires).
    - Contenu social (TikTok / Reels / LinkedIn).
    - Acquisition payante ciblée (Meta Ads, Google).

### Évolution future

- Plans Pro et Family activés à T+6 mois.
- Intégrations partenaires (assurances, contrôle technique, cote véhicule).
- Lancement EU multi-langue (EN, DE, ES, IT) à T+12 mois.
- API publique + Marketplace de dossiers à T+18 mois.
- Vision : devenir le **passeport numérique du véhicule**, transférable et reconnu.

---

## 10. Réseaux sociaux

### Style de contenu LinkedIn

- **Posture** : fondateur + équipe, "Building RideCloud in public".
- **Formats** : carrousels (8-10 slides), posts texte, behind-the-scenes.
- **Sujets** : décisions produit, choix de stack, métriques d'activation, retours utilisateurs.
- **Ton** : pédagogique, transparent, premium.
- **Cadence** : 2 à 3 posts / semaine.

### Style de contenu Instagram

- **Posture** : "L'app qui prend soin de vos véhicules."
- **Formats** : reels courts, carrousels visuels, stories produit.
- **Sujets** : avant / après historique, tips d'entretien, screenshots beaux, lifestyle automobile.
- **Ton** : inspirant, esthétique, posé.
- **Cadence** : 3 à 5 posts / semaine + stories quotidiennes.

### Style de contenu TikTok / Reels

- **Posture** : "Saviez-vous que…" + démos express produit.
- **Formats** : vidéos 15-45 s, screen recordings, voix-off claire.
- **Sujets** :
    - "Combien vous coûte vraiment votre voiture ? On a calculé."
    - "3 entretiens que 80 % des gens oublient."
    - "Comment vendre sa voiture 1 500 € plus cher en 1 export."
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
| Updates produit / changelog | Rétention | Newsletter + LinkedIn |
| UGC (utilisateurs montrant leur dashboard) | Social proof | Instagram, TikTok |

---

## 11. Roadmap

### MVP (livré / en finalisation)

- Authentification complète (Supabase).
- Multi-catégories : voitures, motos, scooters, utilitaires.
- CRUD véhicule + entretiens + modifications + documents.
- Plan d'entretien intelligent par marque/modèle.
- Onglets fiche véhicule (Historique, Plan, Chronologie, Infos, Modifications, Documents).
- KPI coûts + rappels segmentés.
- Export JSON / ZIP / PDF + import JSON.
- PWA installable, UI française complète.

### Version 1 (3 à 6 mois)

- Notifications email + push (rappels urgents).
- Recherche & filtres avancés sur chronologie / historique.
- Mode hors-ligne robuste.
- Statistiques multi-véhicules (dashboard global).
- Galerie photo par véhicule.
- Suivi carburant + consommation.
- OAuth Google / Apple + magic links.
- Mode sombre.
- Internationalisation EN.

### Fonctionnalités futures (Version 2 — 6 à 12 mois)

- RideCloud Plus & Family payants.
- Partage multi-utilisateurs par véhicule.
- OCR factures → entrée auto.
- Estimation de cote dynamique (Argus / La Centrale).
- Intégration contrôle technique officielle.
- Export comptable indépendants.
- Templates constructeurs étendus (200+ modèles).

### Évolutions possibles (Version 3 et au-delà — 12 à 24 mois)

- RideCloud Pro (flotte légère < 50 véhicules).
- API publique + écosystème partenaires.
- Marketplace de dossiers / revente facilitée.
- Assistant IA contextuel par véhicule.
- Expansion EU multi-langue.
- Apps natives iOS / Android (si pertinent vs PWA).
- "Passeport numérique du véhicule" — standard partagé entre acheteurs / vendeurs.
- Partenariats constructeurs (intégration officielle des plans d'entretien).
- Partenariats assurances (réductions sur dossier propre).
- Programme "RideCloud Verified" pour véhicules d'occasion.
- Données agrégées anonymisées (insights marché automobile).
- Hub communautaire (forums modèles, tutos entretien).

---

## Annexe — Identité technique synthétique

```text
Produit       : RideCloud
Stack         : Next.js 16 · TypeScript · TailwindCSS · shadcn/ui · Supabase · PWA
Statut        : MVP fonctionnel — pré-bêta privée
Couleur clé   : #1d4ed8
Domaine       : ridecloud.app
Modèle        : Freemium SaaS
Marchés       : FR → BE / CH / LU → UE
```
