# RideCloud

RideCloud est une application SaaS web en français pour suivre la vie des véhicules et leur maintenance (voitures, motos, scooters, utilitaires).

## Fonctionnalités livrées

- Authentification Supabase (`/login`, `/register`, `/forgot-password`, `/reset-password`)
- Flux UX demandé :
  - Connexion
  - Catégories de véhicules
  - Liste d'une catégorie
  - Détail véhicule
  - Onglet **Historique** actif par défaut
- UI entièrement en français
- Pages catégories, liste véhicules, détail, ajout véhicule
- Branding/PWA câblés sur les icônes existantes de `public/icons`
- SQL complet avec RLS dans `supabase/schema.sql`
- CRUD complet pour :
  - entretiens déjà effectués
  - entretiens à prévoir
  - modifications
  - documents
- Export véhicule en :
  - JSON
  - ZIP complet (JSON + fichiers)
  - PDF (vue d'export imprimable)
- Import d'un dossier RideCloud (`.json`) depuis `Ajouter un véhicule`
- Suppression d'un véhicule avec suppression des données associées
- Plan d'entretien intelligent :
  - templates de base par catégorie (`voitures`, `motos`, `scooters`, `utilitaires`)
  - templates avancés par marque/modèle avec fallback catégorie
  - calcul automatique des prochaines échéances km/date
  - statut automatique (`À venir`, `Bientôt dû`, `En retard`)
  - résumé global en tête de fiche véhicule
  - onglet dédié `Plan d'entretien`
  - affichage du profil d'entretien actif
  - réglage des seuils d'alerte par tâche (km/jours)
  - action `Marquer comme effectué`
- Onglet `Informations` éditable pour compléter/modifier un véhicule après création
- Champ `Carburant` en menu déroulant (création + édition)
- Bouton `Modifier` ajouté sur les éléments existants de l'onglet `Modifications`
- Nouvel onglet `Chronologie` (vue unifiée : entretiens, échéances, modifications, documents)
- Bloc KPI `Coûts du véhicule` (mois, année, total, coût/km)
- Bloc `Rappels d'entretien` (urgent/important/normal) sur la fiche véhicule

## Nouveautés récentes

- Ajout d'une structure `maintenance_plan_entries` côté TypeScript + SQL.
- Ajout des utilitaires métier de maintenance :
  - `calculateNextMaintenanceDue()`
  - `getMaintenanceStatus()`
  - `getVehicleMaintenanceSummary()`
- Ajout de la gestion des coûts :
  - `getVehicleCostSummary()`
  - carte KPI coûts intégrée à la fiche véhicule
- Ajout de la gestion des rappels :
  - `getVehicleReminderSummary()`
  - carte rappels intégrée à la fiche véhicule
- Ajout d'un resolver de templates constructeur (`maintenance-template-resolver`) et règles dédiées.
- Ajout d'une chronologie unifiée des événements véhicule.
- Déduplication des entrées de plan et tri métier des échéances.
- Ajout de l'édition inline des informations véhicule et des modifications existantes.
- Harmonisation des statuts entre résumé, plan d'entretien et historique.

## Stack technique

- Next.js 15+ (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui
- Lucide React
- Supabase (Auth, Postgres, Storage)
- React Hook Form
- Zod
- date-fns

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Variables d'environnement

Créer `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_publique
```

## Configuration Supabase

1. Ouvrir votre projet Supabase.
2. Exécuter `supabase/schema.sql` dans SQL Editor.
3. Vérifier que les policies RLS sont créées.
4. Configurer Auth > URL Configuration :
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/reset-password`

## Lancement local

```bash
npm run dev
```

Application : [http://localhost:3000](http://localhost:3000)

## Structure du projet

```text
src/
  app/
    (auth)/
    (protected)/
  components/
    auth/
    categories/
    vehicles/
    history/
    documents/
    modifications/
    ui/
  lib/
    supabase/
    data/
    validators/
    utils.ts
  types/
  hooks/
supabase/
  schema.sql
```

## Prochaines évolutions

- Notifications externes (email/push) pour les rappels urgents.
- Enrichissement massif des templates constructeur (plus de marques/modèles).
- Vue statistiques avancées (coûts multi-véhicules, tendances annuelles).
- Filtres/recherche avancés sur chronologie et historique.
- Assistant de migration/import constructeur (données entretien existantes).
