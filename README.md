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
- Requêtes Supabase avec fallback de démonstration pour prévisualiser rapidement l'UI
- SQL complet avec RLS dans `supabase/schema.sql`

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

- CRUD complet pour historique, modifications et documents
- Upload documents/factures et visualisation avancée
- Rappels automatiques d'entretien (date/km)
- Filtres/recherche avancés
- Tableau de bord coûts et maintenance
