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
  - calcul automatique des prochaines échéances km/date
  - statut automatique (`À venir`, `Bientôt dû`, `En retard`)
  - résumé global en tête de fiche véhicule
  - onglet dédié `Plan d'entretien`
  - action `Marquer comme effectué`
- Onglet `Informations` éditable pour compléter/modifier un véhicule après création
- Champ `Carburant` en menu déroulant (création + édition)
- Bouton `Modifier` ajouté sur les éléments existants de l'onglet `Modifications`

## Nouveautés récentes

- Ajout d'une structure `maintenance_plan_entries` côté TypeScript + SQL.
- Ajout des utilitaires métier de maintenance :
  - `calculateNextMaintenanceDue()`
  - `getMaintenanceStatus()`
  - `getVehicleMaintenanceSummary()`
- Intégration d'un résumé d'entretien intelligent sur la fiche véhicule.
- Ajout de l'édition inline des informations véhicule.
- Ajout de l'édition inline des modifications existantes.
- Harmonisation des statuts affichés entre le résumé et l'onglet `Plan d'entretien`.

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

- Paramétrage avancé des règles `Bientôt dû` par type de tâche/catégorie.
- Bibliothèque de templates constructeur par marque/modèle.
- Notifications/rappels (email, push) pour les échéances importantes.
- Filtres/recherche avancés
- Tableau de bord coûts et maintenance
