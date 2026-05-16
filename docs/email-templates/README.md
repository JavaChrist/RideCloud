# RideCloud — Email Templates premium

Templates HTML responsives, branding RideCloud, à coller dans Supabase Dashboard.

## Fichiers fournis

| Fichier | Template Supabase | Sujet recommandé |
|---|---|---|
| `confirm-signup.html` | Confirm signup | Confirmez votre inscription sur RideCloud |
| `reset-password.html` | Reset password | Réinitialisation de votre mot de passe RideCloud |
| `magic-link.html` | Magic link | Votre lien de connexion sécurisé RideCloud |
| `change-email.html` | Change email address | Confirmation de votre nouvelle adresse e-mail |

## Compatibilité

Testé / compatible :

- Gmail (web, iOS, Android)
- Outlook 2007 → 365 (desktop + web)
- Apple Mail (macOS, iOS)
- IONOS Webmail
- Yahoo Mail
- Thunderbird
- Mode dark/light : neutre (fond clair fixe)

## Variables Supabase utilisées

Les templates utilisent les placeholders Supabase suivants :

- `{{ .ConfirmationURL }}` — URL complète vers laquelle le bouton CTA pointe
- `{{ .Email }}` — adresse e-mail du destinataire (optionnel, non affiché par défaut)
- `{{ .NewEmail }}` — nouvelle adresse (uniquement dans `change-email.html`)

> ⚠️ Ne pas remplacer ces placeholders à la main : Supabase les substitue automatiquement à l'envoi.

## Installation dans Supabase

### 1. Aller dans le bon endroit

1. https://supabase.com/dashboard
2. Sélectionne le projet **RideCloud**
3. Sidebar : **Authentication** → **Emails**
4. Onglet **Templates**

### 2. Pour chaque template

1. Clique sur le template à modifier dans la liste (ex : `Confirm sign up`)
2. **Subject heading** → colle le sujet recommandé du tableau ci-dessus
3. **Message body** → bascule en mode **Source** / **HTML** (si bouton dispo)
4. Sélectionne tout le contenu existant (`Ctrl+A`), supprime
5. Ouvre le fichier `.html` correspondant dans VS Code
6. Copie tout son contenu (`Ctrl+A`, `Ctrl+C`)
7. Colle dans le champ Message body de Supabase
8. Clique **Save changes** en bas

### 3. Tester chaque template

| Template | Comment tester |
|---|---|
| Confirm signup | `/register` → nouveau compte |
| Reset password | `/forgot-password` → demander un reset |
| Magic link | (si activé) page de login → option magic link |
| Change email | Compte connecté → modifier l'e-mail dans les paramètres |

> 💡 Astuce : Resend Logs (https://resend.com/logs) permet de voir chaque envoi en temps réel, y compris un aperçu du rendu HTML.

## Branding

Tous les templates partagent la même base visuelle :

- **Header** : gradient bleu RideCloud (`#1e40af → #2563eb`) + logo "R" + nom du produit
- **Badge** : couleur contextuelle (bleu, ambre, vert, indigo selon le cas)
- **Bouton CTA** : gradient bleu + ombre douce + rounded 14px
- **Lien fallback** : URL complète en monospace pour copier-coller
- **Bloc info** : icône colorée + titre + explication ("vous n'avez pas fait ça ?")
- **Footer** : nom + tagline + copyright + style sobre

## Personnaliser

### Changer le sender

Dans Supabase → Authentication → Emails → **SMTP Settings** :

- **Sender email** : `noreply@ridecloud.app`
- **Sender name** : `RideCloud`

### Changer une couleur partout

Recherche/remplace dans les 4 fichiers :

- `#1d4ed8` → primary (bleu RideCloud)
- `#1e40af` → primary dark (header gauche du gradient)
- `#2563eb` → primary light (header droite du gradient)
- `#0f172a` → text principal (slate-900)
- `#475569` → text secondaire (slate-600)
- `#94a3b8` → text tertiaire (slate-400)
- `#e2e8f0` → border (slate-200)
- `#f8fafc` → background footer (slate-50)
- `#f1f5f9` → background page (slate-100)

### Remplacer le logo "R" par une vraie image

Une fois l'app déployée publiquement sur `https://ridecloud.app`, tu peux remplacer le bloc avec la lettre "R" par une `<img>` :

```html
<img src="https://ridecloud.app/icons/RideCloud.png"
     alt="RideCloud"
     width="48" height="48"
     style="display:block;border-radius:14px;border:0;outline:none;text-decoration:none;" />
```

> ⚠️ L'image doit être hébergée sur une URL publique HTTPS pour que tous les clients mail l'affichent (certains, dont Outlook, bloquent les images embarquées sans URL absolue).

## Maintenance

- Conserver ces fichiers dans Git (`docs/email-templates/`) comme source de vérité
- En cas de modification du branding : éditer ici, puis recoller dans Supabase
- Les modifications dans Supabase Dashboard ne sont pas versionnées : Supabase est juste le runtime
