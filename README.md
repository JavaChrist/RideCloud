# RideCloud

> La vie de vos véhicules, enfin dans le cloud.

RideCloud est une **PWA SaaS française** pour suivre l'entretien et la vie complète de vos véhicules — voitures, motos, scooters, utilitaires. Hébergée en Europe, conforme RGPD, avec génération de plan d'entretien assistée par IA.

🌐 **Production** : [https://ridecloud.app](https://ridecloud.app)

---

## Fonctionnalités

### Suivi véhicule
- Multi-catégories (voitures, motos, scooters, utilitaires) avec sélection visuelle mobile-first.
- Onglets dédiés par véhicule : Historique, Plan d'entretien, Chronologie, Modifications, Documents, Informations.
- Édition inline des informations véhicule et du compteur kilométrique (modale dédiée avec increments rapides).
- Bouton **"Marquer comme à jour"** pour les véhicules d'occasion (recale l'ensemble du plan sur le kilométrage actuel).
- CRUD complet sur entretiens, échéances, modifications et documents.
- Photos véhicules et factures (Supabase Storage).

### Plan d'entretien intelligent
- Templates de base par catégorie + templates avancés par marque/modèle.
- Calcul automatique des prochaines échéances (km + date) et statut (`À venir`, `Bientôt dû`, `En retard`, `Effectué`).
- Synchronisation automatique : marquer un entretien comme effectué met à jour le plan.
- Réglage des seuils d'alerte par tâche.

### IA — Plan d'entretien assisté
- **Mistral AI** pour générer un plan complet pour les marques/modèles non couverts par les templates.
- Cache partagé (`maintenance_template_cache`) : un même véhicule rare n'est généré qu'une fois pour tous les utilisateurs.
- Réservé aux plans Premium / Family.

### Coûts & rappels
- Carte KPI **Coûts** : total, mois en cours, année, coût/km.
- Carte **Rappels** : tri par urgence (urgent / important / normal).
- Chronologie unifiée des événements (entretiens + échéances + modifications + documents).

### Import / Export
- Export d'un véhicule en **JSON**, **ZIP** (JSON + fichiers) ou **PDF imprimable**.
- Import d'un dossier RideCloud `.json` depuis l'ajout véhicule.
- Cession véhicule complète (export + suppression).

### UI / UX
- Mode **clair / sombre** sur toute l'application.
- Modales de confirmation modernes colorées (5 variants : info / success / warning / danger / ai).
- PWA installable (manifest + service worker).
- Design system documenté (`/design-system` en dev).

### Billing — Mollie
- 3 plans : **Free** (1 véhicule), **Premium** (5 véhicules, 3,99 €/mois ou 39,99 €/an, IA incluse), **Family** (10 véhicules).
- Webhook Mollie pour synchronisation auto + bouton "Resynchroniser mon abonnement" pour les rares ratés webhook.
- Création de profil idempotente côté serveur (`ensureProfile`) : aucun utilisateur orphelin possible.
- Annulation en 1 clic, sans engagement.

### Programme Membres Fondateurs
- **100 places limitées**, numérotées 1..100, attribuées atomiquement (advisory lock Postgres).
- En échange d'un questionnaire de 5 minutes dans les 30 jours : **Premium à vie** + **badge Fondateur** affiché dans l'app.
- Tout passe par des RPC Supabase `SECURITY DEFINER` — aucun bypass client possible.
- Page admin `/admin/founders` avec synthèse NPS (promoteurs / passifs / détracteurs).
- Remplace l'ancien programme bêta-testeurs.

### Conformité légale
- Pages CGU, Confidentialité, Mentions légales, RGPD complètes.
- Médiateur consommateur référencé (obligation française).
- Bannière cookies + suppression de compte effective.
- Tous les emails transactionnels via Resend SMTP.

---

## Stack technique

- **Frontend** : Next.js 15 (App Router, Server Components), TypeScript, TailwindCSS, shadcn/ui (Radix), Lucide
- **Backend** : Supabase (Postgres 17, Auth, Storage, RLS, RPC `SECURITY DEFINER`)
- **Paiement** : Mollie (subscriptions SEPA + carte)
- **IA** : Mistral AI (`mistral-small` / `mistral-large` selon config)
- **Emails** : Resend (SMTP custom Supabase Auth)
- **Hosting** : Vercel (CDN + Edge)
- **PWA** : next-pwa
- **Forms** : React Hook Form + Zod

---

## Installation locale

```bash
git clone https://github.com/<vous>/ridecloud.git
cd ridecloud
npm install
cp .env.example .env.local
npm run dev
```

Application : [http://localhost:3000](http://localhost:3000)

## Variables d'environnement

Créer `.env.local` :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_publique
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role

# Mollie (production / sandbox)
MOLLIE_API_KEY=live_xxx_ou_test_xxx
MOLLIE_WEBHOOK_URL=https://votre-domaine/api/billing/webhook

# Mistral AI (plan d'entretien généré par IA)
MISTRAL_API_KEY=votre_cle
MISTRAL_MODEL=mistral-small-latest

# Admin (liste blanche pour /admin/founders, séparés par virgule)
ADMIN_EMAILS=votre@email.fr

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Configuration Supabase

1. Créer un projet Supabase (région EU recommandée).
2. Ouvrir SQL Editor.
3. Appliquer dans l'ordre :
   - `supabase/schema.sql` (schéma de base)
   - Toutes les migrations dans `supabase/migrations/` (par ordre chronologique du nom de fichier)
4. Configurer Auth > URL Configuration :
   - Site URL : URL de production
   - Redirect URLs : `https://votre-domaine/auth/callback`, `https://votre-domaine/reset-password`
5. Configurer SMTP custom (Resend recommandé) pour la délivrabilité des emails de confirmation.

## Configuration Mollie

1. Créer un compte Mollie + générer une clé API.
2. Webhook → pointer sur `https://votre-domaine/api/billing/webhook`.
3. Créer 2 abonnements (mensuel + annuel) avec les références utilisées dans `src/lib/billing/plans.ts`.

---

## Structure du projet

```text
src/
  app/
    (auth)/                  # login, register, forgot-password, reset-password
    (protected)/             # categories, vehicules, vehicule/[id], parametres
      fondateur/             # programme Membres Fondateurs
      admin/founders/        # tableau de bord interne (env ADMIN_EMAILS)
    api/
      billing/               # checkout, webhook, sync, cancel (Mollie)
      maintenance/           # generate-plan (IA Mistral)
      vehicles/[id]/         # mark-maintenance-current, ...
    auth/callback/           # PKCE callback Supabase
  components/
    auth/                    # formulaires login/register
    billing/                 # boutons checkout, sync, subscription-section
    categories/              # cartes catégories
    common/                  # logo, theme-toggle, layout helpers
    documents/               # gestion fichiers
    founder/                 # banner, badge, welcome, questionnaire
    history/                 # plan d'entretien, chronologie, sections
    layout/                  # protected-header, protected-shell
    modifications/           # CRUD modifications véhicule
    providers/               # confirm-provider (modales modernes)
    ui/                      # shadcn/ui primitives
    vehicles/                # cards, forms, mileage modal, actions
  lib/
    admin.ts                 # helper isAdminEmail (env ADMIN_EMAILS)
    ai/                      # client Mistral + prompt
    billing/                 # limits, ensure-profile, plans, founder-program
    data/                    # accès données métier
    hooks/                   # use-founder-program, ...
    supabase/                # client, server, admin, middleware, env
    utils.ts
  types/
    database.ts              # types complets de la base
supabase/
  schema.sql                 # schéma de base (entités principales)
  migrations/                # migrations idempotentes datées
docs/
  RideCloud-Product-Sheet.md
  RideCloud-Landing-Page.md
  AI-MAINTENANCE-PLAN.md
  email-templates/
```

---

## Tests des cas limites — Programme Fondateurs

Une fois la migration appliquée, voici les tests à exécuter dans le SQL Editor Supabase.

**Test "100 places atteintes"** :

```sql
insert into public.founder_members (user_id, slot, joined_at, status)
select gen_random_uuid(), s, now(), 'pending'
from generate_series(1, 100) as s
on conflict do nothing;

select public.claim_founder_slot();
-- → {"ok": false, "reason": "program_full"}

-- Cleanup
delete from public.founder_members where user_id not in (select id from auth.users);
```

**Test "deadline dépassée"** :

```sql
update public.founder_members
   set joined_at = now() - interval '31 days'
 where user_id = auth.uid();

select public.submit_founder_questionnaire('Test', 9, 'Aucun', 'Plan IA', 'yes_current');
-- → {"ok": false, "reason": "expired"}
```

**Test "réservation idempotente"** :

```sql
select public.claim_founder_slot();
-- 1er appel : {"ok": true, "slot": N, "alreadyMember": false}
select public.claim_founder_slot();
-- 2e appel : {"ok": true, "slot": N, "alreadyMember": true}
```

---

## Roadmap

- Notifications push pour les rappels urgents.
- Enrichissement des templates constructeur (plus de marques/modèles hardcodés).
- Vue statistiques multi-véhicules (tendances annuelles, comparaisons).
- Filtres et recherche avancés sur la chronologie.
- Application mobile native (Capacitor / React Native).

---

## Licence

© 2026 RideCloud · Tous droits réservés. Édité par [Javachrist](https://javachrist.fr).
