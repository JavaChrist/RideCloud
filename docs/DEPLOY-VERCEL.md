# Déploiement RideCloud sur Vercel

> Guide pas-à-pas pour mettre en production `ridecloud.app` sur Vercel avec le DNS
> IONOS. À suivre dans l'ordre. Compter **30 à 45 minutes** la première fois.

---

## 0. Pré-requis

- [x] Code poussé sur GitHub (branche `main` à jour)
- [x] Compte Vercel (gratuit ou Pro) — créez-le si besoin sur https://vercel.com/signup avec votre compte GitHub
- [x] Accès au DNS IONOS (`https://login.ionos.fr` → Domaines → `ridecloud.app` → Configurer DNS)
- [x] Service role Supabase à portée de main (Dashboard → Project Settings → API → `service_role`)

---

## 1. Importer le projet sur Vercel

1. https://vercel.com/new
2. **Import Git Repository** → sélectionnez `RideCloud`
3. Vercel détecte automatiquement Next.js, framework preset = **Next.js**
4. **Root Directory** : laisser `./`
5. **Build & Output Settings** : laisser par défaut (`next build` / `.next`)
6. **Ne pas cliquer Deploy tout de suite** → configurer les variables d'env d'abord

---

## 2. Variables d'environnement

Dans la page d'import, section **Environment Variables**, ajoutez :

| Nom | Valeur | Environnements |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zjwwakyhvszojtakvfpb.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_…` (votre anon key) | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ…` (clé service_role — **secret**) | Production uniquement |

> ⚠️ La clé `SUPABASE_SERVICE_ROLE_KEY` ne doit JAMAIS être exposée côté client.
> Vercel la garde côté serveur tant que son nom ne commence pas par `NEXT_PUBLIC_`.

Cliquez **Deploy**. Le premier build prend 2-3 minutes.

---

## 3. Configurer le domaine personnalisé

Une fois le premier déploiement réussi (sur `ridecloud.vercel.app`) :

1. **Project Settings → Domains → Add**
2. Saisir `ridecloud.app` → **Add**
3. Vercel propose une des deux options :
   - **Option A (recommandée) :** Pointer un enregistrement A vers `76.76.21.21`
   - **Option B (nameservers Vercel) :** Déléguer toute la zone à Vercel (plus risqué si vous utilisez les e-mails IONOS)
4. Choisissez **A record** pour garder vos e-mails IONOS et Resend opérationnels.
5. Ajoutez aussi `www.ridecloud.app` → Vercel proposera un CNAME vers `cname.vercel-dns.com`

---

## 4. Configurer le DNS chez IONOS

Dans IONOS → Domaines → `ridecloud.app` → **Configurer DNS** :

### 4.1 Apex (`ridecloud.app`)

| Type | Hôte | Valeur | TTL |
|---|---|---|---|
| `A` | `@` (ou vide) | `76.76.21.21` | 3600 |

> ⚠️ Si IONOS avait un enregistrement A par défaut pointant vers leur landing
> page, **supprimez-le** avant d'ajouter celui de Vercel.

### 4.2 Sous-domaine `www`

| Type | Hôte | Valeur | TTL |
|---|---|---|---|
| `CNAME` | `www` | `cname.vercel-dns.com.` (avec le point final) | 3600 |

### 4.3 Vérifier que les enregistrements suivants restent intacts

| Type | Hôte | Valeur | Rôle |
|---|---|---|---|
| `MX` | `@` | Serveurs IONOS Mail | E-mails entrants @ridecloud.app |
| `TXT` | `@` | `v=spf1 include:_spf.perfora.net include:_spf.kundenserver.de include:amazonses.com -all` | SPF (IONOS + Resend) |
| `TXT` | `resend._domainkey` | `p=…` (clé DKIM Resend) | Signature DKIM Resend |
| `TXT` | `_dmarc` | `v=DMARC1; p=none; rua=mailto:support@javachrist.fr` | DMARC |

> Si vous n'avez pas encore mis en place SPF/DKIM côté Resend, voyez le guide
> `docs/email-templates/README.md`.

### 4.4 Délai de propagation

5 à 30 minutes en pratique, jusqu'à 24 h en théorie. Vérifiez l'état dans
**Vercel → Project → Domains** : le pastille devient **verte** quand le DNS est OK.
Vercel émet automatiquement un certificat TLS Let's Encrypt.

---

## 5. Configurer Supabase pour la production

### 5.1 Site URL & Redirect URLs

Supabase Dashboard → **Authentication → URL Configuration** :

- **Site URL** : `https://ridecloud.app`
- **Redirect URLs** (ajoutez TOUTES ces entrées) :
  - `https://ridecloud.app/auth/callback`
  - `https://ridecloud.app/reset-password`
  - `https://www.ridecloud.app/auth/callback`
  - `http://localhost:3000/auth/callback` (pour le dev local)
  - `https://*.vercel.app/auth/callback` (pour les Preview deployments)

### 5.2 SMTP (déjà configuré avec Resend)

Vérifiez dans **Project Settings → Authentication → SMTP Settings** :

- **Sender email** : `noreply@ridecloud.app`
- **Sender name** : `RideCloud`
- **Host** : `smtp.resend.com`
- **Port** : `465`
- **Username** : `resend`
- **Password** : votre `RESEND_API_KEY`

### 5.3 Email Templates

Toujours actifs (vous les avez personnalisés depuis `docs/email-templates/`).
Aucune action requise.

---

## 6. Vérifications post-déploiement

1. **Ouvrez `https://ridecloud.app`** → la landing page premium s'affiche
2. **Créez un nouveau compte test** → vérifiez la réception du mail Resend
3. **Cliquez le lien de confirmation** → vous arrivez sur `/categories`
4. **Allez sur `/parametres`** → cliquez « Supprimer mon compte » → confirmez avec votre e-mail → vérifiez que le compte est bien supprimé (réessayez de vous connecter avec ces identifiants : refus)
5. **Testez `https://www.ridecloud.app`** → doit rediriger vers `ridecloud.app` (Vercel le fait automatiquement)
6. **Vérifiez les headers de sécurité** :
   ```bash
   curl -sI https://ridecloud.app | grep -iE "strict-transport|x-frame|content-type|referrer|permissions"
   ```
   Vous devriez voir `Strict-Transport-Security`, `X-Frame-Options: DENY`, etc.

---

## 7. Workflow de mise à jour (à partir de maintenant)

Tout push sur la branche `main` déclenche automatiquement :
1. Un build Vercel (sur `cdg1`, région Paris)
2. Un déploiement sur `https://ridecloud.app` (si la branche est `main`)

Les pull requests sont déployées en **Preview** sur des URLs temporaires
`ridecloud-git-<branch>.vercel.app`, idéales pour relire un changement avant
merge.

---

## 8. Surveillance

- **Logs Vercel** : Project → Deployments → cliquez un build → **Functions** / **Edge logs**
- **Logs Supabase** : Dashboard → Logs Explorer (auth, postgres, storage)
- **Logs Resend** : https://resend.com/logs (statut d'envoi des e-mails)
- **Analytics Vercel** : Project → Analytics (Core Web Vitals) — gratuit, **0 cookie de tracking**

---

## 9. Coûts estimés

| Service | Plan actuel | Coût | Limites |
|---|---|---|---|
| **Vercel** | Hobby | 0 € | 100 GB-h, 100 GB bandwidth/mois |
| **Supabase** | Free | 0 € | 500 MB DB, 1 GB Storage, 50 000 MAU |
| **Resend** | Free | 0 € | 3 000 e-mails/mois, 1 domaine |
| **IONOS** | Domaine + mail | ~15 €/an | Domaine `ridecloud.app` |

> Total annuel pour démarrer : **~15 €/an** uniquement pour le domaine.

À surveiller à terme : passage Supabase Pro (25 $/mois) au-delà de 500 MB DB ou
si vous voulez des sauvegardes journalières.

---

## 10. Rollback en cas de pépin

1. Vercel → Project → Deployments
2. Trouvez le déploiement précédent (`✓ Ready`)
3. Cliquez **`⋯` → Promote to Production**

Le rollback est instantané, sans rebuild.
