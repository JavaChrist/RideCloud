# RideCloud — Plugins Figma indispensables

> Sélection ciblée pour exécuter le brief Design System RideCloud.
> Tous les plugins listés sont gratuits ou freemium.
> Ordre = priorité d'installation.
>
> *Version 2.1 · aligné sur l'application en production (Mollie · IA Mistral · modales useConfirm).*

---

## Tier 1 — Indispensables (à installer avant de commencer)

### 1. Tokens Studio for Figma

**Usage** : Importer le fichier `RideCloud-Design-Tokens.json` v2.1 et générer automatiquement **~40 variables couleur** (avec statuts complets info/AI, bordures de badges), **8 styles typographiques**, **7 niveaux d'ombre `ride-*`**, **8 gradients de marque** et **les tokens de composants** (button-primary, button-ai, badge-*, dialog-*, plan-card-*).

**Pourquoi celui-là** : Permet de synchroniser tes tokens Figma avec ton code (Tailwind config `ride-*`, CSS variables). Si tu modifies une couleur dans Figma, tu peux exporter un JSON et le pousser dans ton repo Next.js. C'est le seul plugin qui fait le pont design ↔ code proprement.

**Action immédiate** : Plugin → *File* → *Load from File* → sélectionner `RideCloud-Design-Tokens.json` → *Apply*. Les étapes 1 et 3 du brief Figma sont faites en 30 secondes. Bien activer la section `component.*` pour récupérer les variantes de boutons et de modales.

---

### 2. Iconify

**Usage** : Insérer les icônes **Lucide** directement dans Figma (référence officielle RideCloud, alignée sur ton stack React).

**Pourquoi celui-là** : Iconify contient toute la librairie Lucide (1000+ icônes) à jour, en SVG natif Figma. Tu peux les coller comme composants, ce qui te permet de les remplacer en masse si Lucide met à jour une icône.

**Action immédiate** : Plugin → barre de recherche → taper `lucide-` puis le nom (ex. `lucide-car`, `lucide-bell`, `lucide-wrench`) → insérer. Crée une page `🧩 Icons` dans ton fichier pour stocker les icônes les plus utilisées comme composants.

**Pack signature RideCloud v2.1** à importer en priorité :
- `lucide-sparkles` (IA · génération de plan)
- `lucide-info`, `lucide-check-circle-2`, `lucide-alert-triangle`, `lucide-trash-2` (modales `useConfirm`)
- `lucide-car`, `lucide-bike`, `lucide-truck`, `lucide-zap` (catégories véhicules)
- `lucide-wrench`, `lucide-gauge`, `lucide-bell`, `lucide-file-text`, `lucide-shield-check`, `lucide-trending-up` (fonctionnalités)

---

### 3. Autoflow

**Usage** : Tracer des connecteurs entre frames pour documenter des flows utilisateur (onboarding RideCloud, parcours de revente, etc.).

**Pourquoi celui-là** : Plus rapide et plus propre que les connecteurs natifs FigJam. Génère des flèches courbes lisibles entre tes mockups.

**Action immédiate** : Garde-le sous la main pour le moment où tu documenteras l'onboarding RideCloud sur la page `📐 Landing page` ou une page dédiée `🔁 User flows`.

---

## Tier 2 — Accélérateurs de production

### 4. Mockuuups Studio (ou Artboard Studio Mockups)

**Usage** : Habiller un screenshot RideCloud d'un *device frame* propre (iPhone, MacBook, Pixel) pour les visuels marketing.

**Pourquoi celui-là** : Génère des mockups premium type Apple Keynote en 2 clics, avec ombres et angles réalistes. Indispensable pour les frames sociaux Instagram et LinkedIn où tu veux montrer la PWA installée.

**Action immédiate** : Sélectionner une frame mobile RideCloud → plugin → choisir un device (iPhone 15 Pro recommandé, neutre) → insérer le mockup à côté.

> Rappel charte : la direction artistique RideCloud déconseille les device frames photoréalistes sur la landing. Réserve ces mockups aux supports sociaux et campagnes visuelles uniquement.

---

### 5. Unsplash

**Usage** : Photos lifestyle pour les frames Instagram lifestyle (véhicule en environnement réel, garage perso, parking immeuble).

**Pourquoi celui-là** : Banque libre de droits, qualité éditoriale, intégré directement à Figma. Plus rapide que de télécharger et importer manuellement.

**Action immédiate** : Plugin → rechercher `car parking`, `garage workshop`, `motorbike city` → glisser dans une frame Instagram. Pense à désaturer légèrement après insertion (Effects → fill avec opacité) pour respecter la charte.

> Rappel charte : aucune photo type *Shutterstock corporate*. On veut du lifestyle posé, désaturé, jamais le sourire trop blanc.

---

### 6. Content Reel

**Usage** : Générer du contenu réaliste (noms français, dates, montants, adresses) pour remplir les screenshots produit dans les mockups.

**Pourquoi celui-là** : Évite les `Lorem ipsum` et les `Véhicule 1` dans tes mockups, ce qui est explicitement banni par la direction artistique RideCloud ("Données réalistes mais soignées").

**Action immédiate** : Sélectionner un champ texte → plugin → choisir le type (nom, date, prix) → générer. Particulièrement utile pour le tableau "Historique" dans les screenshots de fiche véhicule.

---

## Tier 3 — Qualité & finition

### 7. Stark

**Usage** : Vérifier l'accessibilité (contraste WCAG AA, navigation clavier, simulation de daltonisme).

**Pourquoi celui-là** : RideCloud vise WCAG AA dès le départ (cf. Product Sheet § 5). Stark vérifie automatiquement chaque contraste texte/fond et te signale si une combinaison passe sous le seuil. Critique pour les statuts colorés (success/warning/danger/info/**ai**) — vérifier en particulier le couple `text-violet-800` sur `bg-violet-50` pour le badge IA.

**Action immédiate** : Sélectionner un texte sur un fond coloré → plugin → vérifier le score. Si <4.5:1 → ajuster le contraste.

---

### 8. Variables to CSS (ou CSSGen)

**Usage** : Exporter les variables Figma RideCloud en CSS variables ou Tailwind config, pour les coller dans ton projet Next.js.

**Pourquoi celui-là** : Évite la double saisie. Tu définis les couleurs une fois dans Figma, tu génères un fichier `tokens.css` ou `tailwind.config.ts` prêt à coller.

**Action immédiate** : À utiliser quand le Design System v1 sera stabilisé. Plugin → *Export variables* → CSS ou JSON.

---

### 9. Figma to Code (Builder.io)

**Usage** : Générer un premier squelette React + Tailwind à partir d'une frame Figma.

**Pourquoi celui-là** : Pas pour produire du code final, mais pour gagner 70 % du HTML/JSX répétitif sur les sections landing. Tu reprends ensuite à la main pour respecter ton architecture Next.js 16 App Router.

**Action immédiate** : À utiliser une fois la landing finalisée en Figma → générer le squelette React → l'intégrer dans `src/app/(public)/page.tsx`.

> Attention : ce plugin produit du code générique. Ne l'utilise pas comme source de vérité, seulement comme accélérateur.

---

## Tier 4 — Optionnels (selon ton workflow)

### 10. LottieFiles

**Usage** : Insérer des micro-animations Lottie dans les frames sociales ou hero animé.

**Pourquoi celui-là** : Si tu veux ajouter une animation discrète (icône qui pulse, KPI qui s'incrémente) sur un Reel ou une story Instagram. Le format Lottie est léger et bien supporté.

**Action recommandée** : À utiliser avec parcimonie. La charte RideCloud privilégie le silence visuel — pas plus d'une animation par visuel.

---

### 11. Remove BG

**Usage** : Détourer rapidement un véhicule ou un objet pour l'intégrer proprement à un visuel marketing.

**Pourquoi celui-là** : Si tu veux superposer une moto ou une voiture sur un fond pastel uni. Plus rapide que Photoshop pour les cas simples.

---

## Récap d'installation minimale

Si tu ne devais installer que **trois plugins** pour démarrer ce week-end :

1. **Tokens Studio for Figma** — pour importer tes tokens en 30 secondes.
2. **Iconify** — pour avoir Lucide directement dans Figma.
3. **Stark** — pour vérifier l'accessibilité dès la construction des composants.

Le reste s'ajoute au fur et à mesure, selon les frames que tu construis.

---

## Anti-recommandations

À **éviter** dans le contexte RideCloud :

- **Wireframe / Whiteboard plugins** colorés style *Mira Whiteboard* : cassent la cohérence visuelle premium.
- **Plugins d'illustrations isométriques** (Blush, Humaaans, etc.) : direction artistique explicitement contre.
- **Plugins de gradient générateurs flashy** : la charte ne tolère que les 4 gradients officiels (`primary`, `dark`, `text`, `ai`).
- **Plugins UI Kit "Material Design" ou "Bootstrap"** : on construit notre propre système, pas un assemblage générique.
- **Plugins IA générateurs de visuels** (Midjourney/DALL·E embedders) : les visuels marketing RideCloud sont toujours des screenshots produit réels — jamais des illustrations IA. La cohérence avec l'application est non négociable.

---

*Sélection plugins RideCloud v2.1 · alignée avec la charte, la stack technique (Next.js, Tailwind, Lucide) et l'état de production (Mollie, IA Mistral, modales useConfirm).*
