# RideCloud

RideCloud est une application web (PWA) et une application Android Capacitor pour suivre l’entretien, les coûts, les documents et les échéances de véhicules personnels : voitures, motos, scooters et utilitaires.

Elle s’adresse aux particuliers et aux foyers qui veulent un carnet d’entretien numérique, sans dépendre d’un classeur papier. L’éditeur est **JavaChrist** (micro-entreprise de Christian Grohens). Support : `support@javachrist.fr`.

Site public vérifié : [https://ridecloud.app](https://ridecloud.app)

---

## Fonctionnalités réellement implémentées

### Opérationnelles

- **Compte** : inscription, connexion, mot de passe oublié, confirmation e-mail (Supabase Auth).
- **Véhicules** : création, édition, photo, profil d’usage (estimation kilométrique), compteur, suppression. Quatre catégories : voitures, motos, scooters, utilitaires.
- **Entretiens, échéances, modifications, documents** : ajout, modification et suppression dans la fiche véhicule.
- **Onglets fiche véhicule** : Historique, Chronologie, Plan d’entretien, Modifications, Documents, Informations.
- **Plan d’entretien** : templates par catégorie et règles constructeur pour certains modèles ; calcul des prochaines échéances (km + date) et statuts (à venir, bientôt dû, en retard, effectué) ; bouton « Marquer comme à jour » pour recaler le plan.
- **Plan d’entretien IA (Mistral)** : génération à la demande pour un modèle absent du catalogue, avec cache partagé. Réservé aux plans **Premium** et **Family** dont le statut est `active` (`POST /api/maintenance/generate-plan`).
- **Coûts et rappels** : totaux (global, mois, année, €/km) et carte de rappels triés par urgence.
- **Export** : JSON, ZIP (dossier + fichiers) et page d’export PDF imprimable (« dossier de cession »). Import d’un dossier RideCloud `.json` à l’ajout d’un véhicule.
- **Notifications** : inbox dans l’app ; Web Push (navigateur / PWA) ; push Android FCM dans l’app Capacitor. Activation / désactivation depuis **Paramètres**.
- **Abonnements Mollie** : plans Free / Premium / Family, checkout, webhook, resynchronisation, annulation, cron de rétrogradation des abonnements expirés.
- **Programme Membres Fondateurs** : 100 places, questionnaire sous 30 jours, badge et Premium à vie en base. Page interne `/admin/founders` (liste `ADMIN_EMAILS`).
- **Thème clair / sombre**, PWA (manifest + service worker), pages légales (CGU, mentions, confidentialité, RGPD, suppression de compte).
- **Suppression de compte** : dans l’app (**Paramètres → Supprimer mon compte**) et page publique [https://ridecloud.app/suppression-compte](https://ridecloud.app/suppression-compte).

### Partielles

- **Quota documents** : le plan Free annonce « 1 document par véhicule », mais `documentsUnlimited` n’est **pas appliqué** dans le code documents. Les exports JSON / ZIP / PDF ne sont pas non plus filtrés par plan.
- **Premium Fondateur** : `founder_premium_lifetime` relève la **limite de véhicules** à 5. L’accès IA et le badge « Premium » dans l’interface lisent le champ `profiles.plan` (souvent `free` sans paiement). Un Fondateur n’a donc pas automatiquement toutes les fonctions payantes.
- **Plan Family** : limite à 10 véhicules et mêmes fonctions payantes que Premium. Le **partage entre comptes** annoncé (« 4 comptes ») n’existe pas.
- **Recherche de véhicules** : champ affiché, clairement marqué « placeholder », sans filtrage réel.
- **Hors-ligne** : service worker pour mises à jour PWA ; pas de mode hors-ligne métier complet.
- **Android** : package `fr.javachrist.ridecloud`, URL distante `https://ridecloud.app`. **Google Play Internal Testing = PASS** (25/08/2026). Closed Testing et fiche store publique : non faits.
- **Page `/design-system`** : documentation visuelle interne, publique (pas réservée au mode développement).

### Simulées / marketing uniquement

- Véhicules de démonstration dans `src/lib/data/demo.ts` : **non affichés** dans l’application (code mort).
- Textes de la page d’accueil (« RideCloud Pro », « 200 modèles au lancement », « pas de store ») : **non implémentés** ou **contredits** par l’app Android Capacitor.

### Prévues (code ou docs, pas livrées)

- Partage multi-comptes, statistiques foyer, OCR de factures, API publique, intégration contrôle technique / assurance, onboarding guidé, Closed Testing Google Play.

---

## Plans (source : `src/lib/billing/plans.ts`)

| Plan | Véhicules | Prix affichés |
| --- | --- | --- |
| Free | 1 | Gratuit |
| Premium | 5 | 3,99 € / mois ou 39 € / an |
| Family | 10 | 7,99 € / mois ou 79 € / an |

L’IA d’entretien est réservée à Premium et Family **actifs**. Le partage Family n’est pas implémenté.

---

## Stack

- **Web** : Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, React Hook Form, Zod
- **Données / auth / fichiers** : Supabase (Postgres, Auth, Storage, RLS, RPC)
- **Paiement** : Mollie
- **IA** : Mistral (`MISTRAL_MODEL`, défaut `mistral-small-latest`)
- **E-mails Auth** : SMTP Resend (configuration Supabase, pas de SDK dans ce dépôt)
- **Hébergement** : Vercel (région `cdg1` dans `vercel.json`)
- **PWA** : manifest + service worker
- **Android** : Capacitor 8
- **Push** : Web Push VAPID + Firebase Cloud Messaging (serveur)
- **Tests** : Vitest

---

## Installation locale

```bash
git clone https://github.com/JavaChrist/RideCloud.git
cd RideCloud
npm install
cp .env.example .env.local
```

Renseigner `.env.local` (noms uniquement, jamais de secret dans Git). Puis :

```bash
npm run dev
```

Application locale : [http://localhost:3000](http://localhost:3000)

### Commandes

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm start` | Servir le build |
| `npm test` | Tests Vitest |
| `npm run lint` | ESLint |

Ne pas lancer de déploiement depuis cette documentation. La signature Android Release exige `android/keystore.properties` (hors Git) : voir `docs/ANDROID-RELEASE-SIGNING.md`.

---

## Variables d’environnement

Créer `.env.local` à partir de `.env.example`. **Noms uniquement** — aucune clé ci-dessous n’est une valeur réelle.

| Variable | Usage |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Serveur uniquement (suppression de compte, admin) |
| `MOLLIE_API_KEY` | Paiements (préfixe `test_` en local) |
| `MISTRAL_API_KEY` | Génération de plan IA |
| `MISTRAL_MODEL` | Optionnel (défaut `mistral-small-latest`) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push (navigateur) |
| `VAPID_PRIVATE_KEY` | Web Push (serveur) |
| `VAPID_CONTACT_EMAIL` | Contact VAPID (`mailto:…`) |
| `FIREBASE_PROJECT_ID` | FCM Android (serveur) |
| `FIREBASE_CLIENT_EMAIL` | FCM Android (serveur) |
| `FIREBASE_PRIVATE_KEY` | FCM Android (serveur) |
| `CRON_SECRET` | Autorisation des routes `/api/cron/*` |
| `ADMIN_EMAILS` | Liste blanche `/admin/*` (e-mails séparés par des virgules) |

Vercel injecte aussi, sans les déclarer ici, des identifiants de déploiement utilisés pour la version PWA.

Génération des clés VAPID (à coller ensuite dans `.env.local`, pas dans le dépôt) :

```bash
npx web-push generate-vapid-keys --json
```

---

## Configuration Supabase

1. Créer un projet (région UE recommandée).
2. Appliquer `supabase/schema.sql`, puis les fichiers de `supabase/migrations/` dans l’ordre des noms.
3. Auth → URL Configuration : Site URL et Redirect URLs (`/auth/callback`, `/reset-password`).
4. SMTP (Resend recommandé) pour les e-mails de confirmation.

---

## Configuration Mollie

1. Compte Mollie + clé API.
2. Webhook : `https://<domaine>/api/billing/webhook`.
3. Les montants et libellés envoyés au checkout viennent de `src/lib/billing/plans.ts`.

---

## Notifications

| Canal | Cible | Table |
| --- | --- | --- |
| Web Push VAPID | Navigateur / PWA | `push_subscriptions` |
| FCM Android | App Capacitor | `native_push_tokens` |

Crons (`vercel.json`) :

- `0 8 * * *` UTC → `/api/cron/notifications`
- `0 2 * * *` UTC → `/api/cron/downgrade-expired`

Côté utilisateur : **Paramètres → Notifications**. Détail Android : `docs/ANDROID-NATIVE-PUSH.md`. Détail Play : `docs/ANDROID-GOOGLE-PLAY.md`.

`google-services.json` et le keystore restent **hors Git**.

---

## Structure utile

```text
src/app/
  (auth)/                 login, register, forgot-password, reset-password
  (protected)/            catégories, véhicules, fiche, paramètres, fondateur, admin
  (legal)/                CGU, mentions, confidentialité, RGPD, suppression-compte
  api/                    billing, IA, export, push, cron, suppression compte
  page.tsx                landing publique
src/lib/                  billing, IA, données, push, Supabase
supabase/                 schéma + migrations
docs/                     Play, push Android, RGPD, déploiement
android/                  projet Capacitor
```

---

## Programme Fondateurs — tests SQL (optionnel)

Après migration, dans l’éditeur SQL Supabase (comptes de test uniquement) :

```sql
-- Places pleines
insert into public.founder_members (user_id, slot, joined_at, status)
select gen_random_uuid(), s, now(), 'pending'
from generate_series(1, 100) as s
on conflict do nothing;
select public.claim_founder_slot();
-- attendu : {"ok": false, "reason": "program_full"}
delete from public.founder_members where user_id not in (select id from auth.users);
```

---

## Licence

© 2026 RideCloud. Tous droits réservés. Édité par [JavaChrist](https://javachrist.fr).
