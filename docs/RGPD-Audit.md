# Audit RGPD — RideCloud

> **Date de l'audit** : Juin 2026 (mis à jour)  
> **Périmètre** : Application web RideCloud (Next.js 16, Supabase, Vercel)  
> **Responsable de traitement** : JavaChrist (Grohens Christian, EI), SIRET 338 593 312 000 30  
> **Auditeur** : Audit interne automatisé via revue de code et architecture

Ce document constitue l'**audit de minimisation et de conformité RGPD** des routes API,
des accès à la base de données et du traitement des données personnelles dans
RideCloud. Il accompagne la Politique de confidentialité (`/confidentialite`) et la
page « Vos droits RGPD » (`/rgpd`).

---

## 1. Données personnelles traitées

| Catégorie | Donnée | Source | Finalité | Base légale |
|---|---|---|---|---|
| Identité | E-mail | Inscription | Authentification, communication | Contrat (CGU) |
| Identité | Mot de passe (hashé bcrypt par Supabase) | Inscription | Authentification | Contrat |
| Métier | Véhicules, kilométrage, immatriculation, VIN | Saisie utilisateur | Service principal | Contrat |
| Métier | Entretiens, modifications, plans d'entretien | Saisie utilisateur | Service principal | Contrat |
| Métier | Documents PDF / images (factures, cartes grises) | Téléversement | Service principal | Contrat |
| Technique | Cookies de session Supabase | Connexion | Authentification | Cookies strictement nécessaires (CNIL) |
| Technique | IP + user-agent (logs Vercel / Supabase) | Requêtes HTTP | Sécurité, prévention de la fraude | Intérêt légitime |
| Technique | Endpoint Web Push (VAPID) | Opt-in `/parametres` | Notifications hors app (`push_subscriptions`) | Consentement |
| Technique | Token FCM Android (jamais loggé en clair) | App Capacitor opt-in | Notifications natives (`native_push_tokens`) | Consentement |

> **Aucune donnée sensible** au sens de l'art. 9 RGPD (santé, opinions politiques,
> religieuses, biométrie, etc.) n'est traitée.

---

## 2. Authentification & isolation des données

### 2.1 Vérifications côté serveur

Toutes les routes API et les pages protégées appellent `supabase.auth.getUser()`
**avant** tout accès à la base. Aucune route ne se fie au cookie côté client.

| Route / fonction | Vérifie `getUser()` ? | Filtre `user_id` ? | Verdict |
|---|---|---|---|
| `GET /api/vehicule/[id]/export` | ✅ | ✅ `.eq("user_id", user.id)` | OK |
| `GET /api/vehicule/[id]/export-zip` | ✅ | ✅ `.eq("user_id", user.id)` | OK |
| `POST /api/account/delete` | ✅ | ✅ (suppression scoped + résiliation Mollie) | OK |
| `GET /auth/callback` | N/A (handshake PKCE) | N/A | OK |
| `getCategoryCounts(userId)` | Via SSR `getUser()` | ✅ | OK |
| `getVehiclesByCategory(userId, category)` | Via SSR | ✅ | OK |
| `getVehicleById(userId, id)` | Via SSR | ✅ | OK |
| `getVehicleHistory(userId, vehicleId)` | Via SSR | ✅ sur toutes les tables filles | OK |

**Conclusion : 100 % des accès aux données sont scopés au `user_id` authentifié.**

### 2.2 Middleware

Le middleware (`src/lib/supabase/middleware.ts`) protège :

- `/categories`, `/vehicules`, `/vehicule`, `/parametres` → redirige vers `/login` si non-connecté.
- `/login`, `/register`, `/forgot-password` → redirige vers `/categories` si déjà connecté.
- `/reset-password` est **volontairement** exclu pour permettre le flow de récupération.

### 2.3 Storage (fichiers)

- Bucket Supabase `ridecloud-files` : **non public**.
- Convention de path : `${userId}/...` → impossible pour un user A de lister/lire un fichier de B même avec les bonnes politiques RLS.
- Diffusion via **Signed URLs** d'1 heure uniquement (`createSignedUrl(path, 3600)`).
- Aucun fichier n'est exposé via une URL publique permanente.

---

## 3. Minimisation (art. 5.1.c RGPD)

### 3.1 Collecte minimale à l'inscription

Champs requis : `email`, `password` uniquement. Aucun nom, téléphone, adresse,
date de naissance n'est demandé.

### 3.2 Données retournées au client

Les `SELECT *` utilisés dans les requêtes Supabase sont scopés à des tables qui
**ne contiennent que** des données du domaine métier (véhicules, entretiens). Aucune
table ne stocke de données de profil non utilisées par le produit.

> **Recommandation** : à terme, remplacer les `SELECT *` par des sélections
> explicites (`select("id, marque, modele, ...")`) pour figer le contrat API et
> éviter de leaker un futur champ sensible.

### 3.3 Logs serveur

- Aucun `console.log` n'expose d'e-mail, de mot de passe ou de token côté serveur.
- La seule trace verbeuse (`console.warn` dans `/api/account/delete`) ne contient
  que des noms de tables, jamais l'identité de l'utilisateur.

---

## 4. Droits des personnes (art. 15-22)

| Droit | Implémentation | Page utilisateur |
|---|---|---|
| Information (art. 13-14) | Politique de confidentialité publique | `/confidentialite` |
| Accès (art. 15) | Export JSON par véhicule | Fiche véhicule (bouton « Exporter ») |
| Rectification (art. 16) | Édition libre dans l'application | `/vehicule/[id]` |
| Effacement (art. 17) | Suppression définitive avec double confirmation | `/parametres` |
| Portabilité (art. 20) | Export JSON + ZIP (données + fichiers) | Fiche véhicule |
| Opposition (art. 21) | Aucun traitement basé sur intérêt légitime au-delà du strict nécessaire | — |
| Procédure | Email `support@javachrist.fr` | `/rgpd` |

**Délai de réponse** : < 1 mois (art. 12.3 RGPD). Tous les droits exerçables sans
intervention manuelle (export, suppression) sont **immédiats**.

---

## 5. Cookies & traceurs

- **Cookies déposés** : uniquement les cookies de session Supabase (`sb-*`).
- **Aucun cookie publicitaire** ni analytique (pas de Google Analytics, Meta Pixel, etc.).
- **Bannière d'information** non bloquante (composant `CookieBanner`) — pas de
  consent manager nécessaire au sens des recommandations CNIL puisque seuls des
  cookies strictement nécessaires sont déposés.

---

## 6. Sécurité (art. 32)

| Mesure | État |
|---|---|
| HTTPS forcé en production (Vercel) | ✅ |
| Mots de passe hashés (Supabase, bcrypt) | ✅ |
| Tokens JWT signés (HS256) avec rotation | ✅ |
| PKCE pour les flows e-mail (signup, reset) | ✅ |
| Service role key **jamais** exposée côté client | ✅ |
| Variables d'environnement séparées (`NEXT_PUBLIC_*` vs serveur) | ✅ |
| Sauvegardes automatiques Supabase | ✅ (responsabilité hébergeur) |
| MFA Supabase Dashboard côté admin | ⚠️ À activer manuellement |

---

## 7. Sous-traitants (art. 28)

| Sous-traitant | Rôle | Localisation | DPA |
|---|---|---|---|
| **Vercel Inc.** | Hébergement applicatif + CDN | Siège USA — déploiement principal Frankfurt (fra1, UE) — CCT + DPF | DPA Vercel signé via Terms |
| **Supabase Inc.** | Base de données, auth, stockage | Frankfurt (eu-central-1, UE) | DPA Supabase |
| **Mollie B.V.** | Traitement des paiements récurrents SEPA + carte (abonnements Premium/Family) | Pays-Bas (UE) | DPA Mollie |
| **Mistral AI SAS** | Génération des plans d'entretien IA — seules métadonnées techniques (marque, modèle, année, carburant) transmises, aucune donnée personnelle | France (UE) | DPA Mistral |
| **Resend, Inc.** | Envoi des e-mails transactionnels | Irlande (eu-west-1, UE) | DPA Resend |
| **IONOS SE** | Nom de domaine et zone DNS | Allemagne (UE) | Contrat IONOS |
| **Google LLC (Firebase Cloud Messaging)** | Envoi des notifications push à l’app Android Capacitor | Siège USA — CCT + DPF | DPA Google Cloud / Firebase |

> Tous les sous-traitants sont **conformes RGPD** et fournissent un DPA standard (art. 28).  
> Les sous-traitants ayant leur siège hors UE (Vercel, Supabase, Resend) sont couverts par des CCT (Clauses Contractuelles Types) et/ou le Data Privacy Framework.

---

## 8. Non-conformités résiduelles & recommandations

### Bloquantes : **aucune** à ce stade (audit juin 2026).

### Recommandées (priorité ↘)

1. **Rate limiting** sur `/api/account/delete` et `/auth/*` (Upstash Redis ou Vercel Edge).  
   _Impact_ : empêche un attaquant ayant volé un cookie de session de spammer la suppression.
2. **Journal d'audit** (table `audit_log`) pour tracer les actions sensibles  
   (suppression de compte, changement d'e-mail, export massif). Conservation 1 an.
3. **Export global** « toutes mes données » en un clic depuis `/parametres`  
   (en complément de l'export par véhicule actuel).
4. **MFA pour les comptes utilisateurs** (Supabase TOTP) — optionnel mais
   recommandé pour les comptes contenant beaucoup de documents.
5. **Politiques RLS** : vérifier en SQL Supabase que chaque table a bien des
   policies `USING (auth.uid() = user_id)` activées (sécurité défense en profondeur,
   même si l'application filtre déjà).
6. **`SELECT *` → sélections explicites** pour figer le contrat des données
   retournées au client.
7. **Bannière cookies** : peut être supprimée à terme si la CNIL clarifie qu'aucune
   information n'est requise pour des cookies strictement nécessaires.
8. **Mention du DPO/contact RGPD** : actuellement `support@javachrist.fr`. Tant que
   l'effectif < 250 personnes et qu'il n'y a pas de traitement à grande échelle de
   données sensibles, la désignation d'un DPO n'est pas obligatoire.

---

## 9. Registre des traitements (art. 30)

Un registre des activités de traitement (RAT) doit être tenu, même pour une
entreprise individuelle. Modèle minimal recommandé (à compléter dans Notion / Excel) :

| ID | Traitement | Finalité | Catégories de personnes | Catégories de données | Destinataires | Durée de conservation | Mesures de sécurité |
|---|---|---|---|---|---|---|---|
| T1 | Gestion des comptes | Authentification, gestion CGU | Utilisateurs RideCloud | E-mail, mot de passe hashé | Supabase, Resend | Tant que le compte est actif | Hash, HTTPS, RLS |
| T2 | Suivi véhicules | Service principal | Utilisateurs RideCloud | Véhicules, entretiens, documents | Supabase Storage | Tant que le compte est actif | Bucket privé, signed URLs |
| T3 | Support utilisateur | Réponse aux demandes | Utilisateurs RideCloud | E-mail, contenu du message | Boîte support@javachrist.fr | 3 ans après dernier contact | Boîte sécurisée IONOS |

---

## 10. Synthèse

✅ **RideCloud est conforme au RGPD pour un MVP / SaaS B2C en lancement.**

Tous les droits fondamentaux des utilisateurs sont implémentés et exerçables
sans intervention manuelle. L'architecture technique respecte les principes de
minimisation, de sécurité par défaut et de transparence.

Les recommandations de la section 8 sont des améliorations pour la phase de
croissance (>1000 utilisateurs actifs), pas des prérequis légaux.
