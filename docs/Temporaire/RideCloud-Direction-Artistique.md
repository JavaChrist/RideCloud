# RideCloud — Direction Artistique

> Guide visuel pour tous les supports de communication RideCloud.
> Univers : Linear · Notion · Apple · Stripe · Tesla Dashboard.
> Promesse visuelle : **clarté technologique, calme premium, lisibilité absolue.**
>
> *Version 2.1 · alignée sur l'application en production (Mollie · IA Mistral · modales useConfirm).*

---

## 1. Principes directeurs

Trois règles transversales gouvernent toute la production visuelle RideCloud :

**Clarté avant décoration.**
Aucun élément n'existe sans raison. Chaque pixel sert l'information ou la respiration. Les visuels chargés, les dégradés gratuits, les effets *glassmorphism* clinquants sont proscrits. On cherche le calme d'un dashboard Stripe, pas l'agitation d'une page produit *startup générique*.

**Données mises en scène.**
Les screenshots produit sont les véritables héros visuels — pas les illustrations, pas les photos *stock*. RideCloud est une application qui rend l'invisible (coûts, échéances, historique) visible. Les visuels doivent montrer cette information, pas la suggérer.

**Cohérence systémique.**
Une signature visuelle reconnaissable en une seconde, tous canaux confondus. Même palette, mêmes proportions, même typographie, même grille. La cohérence est la première forme de premium.

---

## 2. Palette visuelle

### Couleurs primaires

| Rôle | Nom | HEX | Usage |
|---|---|---|---|
| Marque | Bleu RideCloud | `#1d4ed8` | CTA, accents, focus, logo |
| Marque hover | Bleu 800 | `#1e40af` | État survol du CTA principal |
| Accent indigo | Indigo 700 | `#4338ca` | Second pôle des gradients de marque |
| Bleu profond | Indigo 950 | `#1e1b4b` | Fonds sombres premium, hero sombres |
| Fond clair | Slate 50 | `#f8fafc` | Fond standard application & marketing |
| Fond pur | Blanc | `#ffffff` | Cartes, modales, mockups |
| Texte principal | Slate 900 | `#0f172a` | Titres, corps de texte |
| Texte secondaire | Slate 600 | `#475569` | Labels, légendes, métadonnées |
| Bordure neutre | Slate 200 | `#e2e8f0` | Séparateurs, contours discrets |

### Couleurs statuts

| Rôle | Nom | HEX | Usage |
|---|---|---|---|
| Succès / À jour | Émeraude 500 | `#10b981` | Statut "À jour", validation, modale `success` |
| Alerte / À anticiper | Ambre 500 | `#f59e0b` | Statut "À anticiper", attention douce, modale `warning` |
| Urgent / En retard | Rouge 500 | `#ef4444` | Statut "En retard", suppression, modale `danger` |
| Info / À prévoir | Sky 500 | `#0ea5e9` | Statut neutre "À prévoir", modale `info` |
| **IA · génération** | **Violet 500 → Indigo 500** | `#8b5cf6 → #6366f1` | **Badges & boutons IA (gradient), modale `ai`** |

### Fonds pastels pour visuels marketing

| Nom | HEX | Usage |
|---|---|---|
| Sky pastel | `#e0f2fe` | Fond de mockup, carousel LinkedIn |
| Slate pastel | `#f1f5f9` | Fond de fiche produit, screenshot framé |
| Indigo pastel | `#eef2ff` | Fond d'illustration, hero secondaire |
| Mint pastel | `#ecfdf5` | Fond pour visuels "valeur économique" |
| **Violet pastel** | `#f5f3ff` | **Fond pour visuels IA (génération Mistral, plan personnalisé)** |
| Amber pastel | `#fffbeb` | Fond pour visuels prévention / anticipation |

### Gradients de marque

Quatre gradients seulement, utilisables sur landing, hero et CTA :

| Nom | Stops | Usage |
|---|---|---|
| `ride-gradient-primary` | `#1d4ed8` → `#4338ca` | CTA principal, en-têtes premium |
| `ride-gradient-dark` | `#1e1b4b` → `#1d4ed8` → `#4338ca` | Hero immersif, sections sombres |
| `ride-gradient-text` | `#1d4ed8` → `#6366f1` → `#1d4ed8` | Titres marketing en `bg-clip-text` |
| `ride-gradient-ai` | `#8b5cf6` → `#6366f1` | Boutons & badges IA exclusivement |

### Règles d'usage couleur

Sur tout visuel marketing, on respecte la règle **70 / 20 / 10** : 70 % de fond neutre (blanc ou pastel), 20 % de couleur produit (bleu marque + texte slate), 10 % d'accent (statut, CTA). Les dégradés sont autorisés uniquement entre les stops listés ci-dessus et toujours en transition douce, jamais saturée. La couleur **violet/IA** est réservée aux éléments liés à la génération automatique de plan d'entretien — elle ne remplace jamais le bleu marque sur un CTA principal.

---

## 3. Typographie

### Polices

Famille principale : **Geist Sans** (alternative : **Inter**).
Famille monospace : **Geist Mono** ou **JetBrains Mono** (pour les valeurs chiffrées dans les visuels data : coût/km, kilométrages, dates techniques).

Une seule famille en sans-serif. Aucun *display font*, aucune fantaisie. La typographie doit disparaître derrière l'information.

### Échelle typographique

| Usage | Taille marketing | Poids | Tracking |
|---|---|---|---|
| Hero title (landing, vidéo) | 56-72 px | 600 | -0.02em |
| Section title | 36-44 px | 600 | -0.015em |
| Sous-titre / accroche | 22-28 px | 500 | -0.01em |
| Corps de texte | 16-18 px | 400 | 0 |
| Légende / métadonnée | 13-14 px | 500 | 0.02em |
| Chiffre vedette (KPI) | 48-64 px | 600 (mono possible) | -0.02em |

### Règles d'usage typographique

Les titres respirent. Interligne minimum 1.1 sur les hero, 1.4 sur le corps. On évite les majuscules sauf pour des micro-labels (KPI, statuts). Les chiffres clés des visuels (coût annuel, kilométrage, prix) sont en *tabular numbers* pour un alignement parfait.

---

## 4. Style screenshots produit

Les screenshots sont le carburant visuel principal de RideCloud. Ils doivent toujours suivre la même grammaire.

**Captures réelles, jamais maquettées en image fixe.**
Toujours générer la capture depuis l'application elle-même (browser DevTools en mode device exact, ou exports Figma synchronisés). Aucune retouche du contenu, aucune fausse donnée.

**Données réalistes mais soignées.**
Les véhicules affichés sont crédibles (Peugeot 3008, Tesla Model Y, Yamaha MT-07, Renault Trafic), les montants sont cohérents (vidange 95 €, pneus 480 €, contrôle technique 78 €), les dates sont récentes. Aucun "Lorem Ipsum", aucun "Vehicule 1".

**Cadrage standardisé.**
Trois cadrages canoniques :

1. **Full dashboard** : interface complète, ratio 16:10, idéal landing et LinkedIn.
2. **Zoom composant** : un bloc précis (KPI coûts, plan d'entretien, rappel), ratio 4:3, idéal carousels et stories.
3. **Mobile portrait** : capture iPhone 15 Pro 1179×2556, idéal Reels et Instagram.

**Frame & ombrage.**
Coins arrondis **16 px (cartes)** ou **12 px (boutons, badges)** — système `ride-*` officiel. Ombre par défaut : `ride-md` pour cartes au repos, `ride-lg` pour cartes survolées et modales, `ride-glow` pour CTA Premium et plan recommandé, `ride-float` pour les hero marketing. Aucun *device frame* skeuomorphique (pas de bezel d'iPhone dessiné). Le composant flotte sur son fond pastel.

**Recadrage agressif.**
Sur les visuels sociaux, on coupe sans hésiter pour montrer l'information utile. Un screenshot complet ne raconte rien — un détail bien cadré raconte tout.

---

## 5. Style mockups

Les mockups (compositions produit pour landing, hero, posts) suivent une mise en scène cohérente.

**Composition à deux écrans.**
Combinaison desktop + mobile, l'un derrière l'autre, légèrement décalés. Le desktop pose le contexte (vue d'ensemble), le mobile démontre l'ubiquité (PWA dans la poche).

**Aucun *device frame* photoréaliste.**
Pas de Mac doré, pas d'iPhone vu en 3/4 façon Apple Keynote 2014. À la place : carte propre, ombre `ride-float`, coins arrondis 20 px. L'écran *est* le mockup.

**Fond pastel uni ou très subtil dégradé.**
Le fond ne distrait jamais. Si dégradé, il reste entre deux teintes voisines (`#eef2ff` → `#f8fafc` par exemple), orienté du coin haut-gauche au bas-droite.

**Accent typographique en surimpression.**
Sur les visuels hero, un titre court (3 à 6 mots, poids 600, taille 56-72 px) flotte au-dessus ou à côté du mockup, jamais par-dessus l'interface. Espace généreux entre titre et mockup.

**Inspirations directes** : pages produit Linear (`linear.app`), Notion (`notion.so/product`), Stripe (`stripe.com/payments`).

---

## 6. Style illustrations

RideCloud utilise peu d'illustrations. Quand elles apparaissent, elles suivent un cadre strict.

**Pas de personnages génériques en couleurs vives.**
Aucune illustration *Storyset / Undraw*. Aucun personnage flottant en isométrique. Ces styles dégradent immédiatement la perception premium.

**Icônes Lucide ou systèmes équivalents.**
Pour les pictogrammes : ligne fine 1.5 px, coins arrondis, palette monochrome (slate 700 ou bleu marque). Cohérence avec le produit.

**Schémas data plutôt qu'illustrations.**
Quand on doit illustrer un concept (coût/km, plan d'entretien, dossier de revente), on dessine un **schéma data** plutôt qu'une scène. Lignes fines, valeurs réelles, typographie produit. C'est plus crédible, plus premium, et plus fidèle au produit.

**Photographie lifestyle ponctuelle, jamais stock.**
Pour les communications plus lifestyle (Instagram), on autorise la photo véhicule en environnement réel : parking d'immeuble, garage perso, route de week-end. Lumière naturelle, grain léger, palette désaturée. Aucune photo *stock photo* surexposée et souriante.

---

## 6 bis. Modales contextuelles & dialogues système

Toutes les confirmations critiques de l'application passent par le hook unique `useConfirm()` — il n'existe **aucun** `window.confirm()` dans le code de production. Cinq variantes seulement, jamais plus :

| Variante | Icône Lucide | Accent | Cas d'usage |
|---|---|---|---|
| `info` | `Info` | Sky 500 | Exports, opérations neutres, informations enrichies |
| `success` | `CheckCircle2` | Émeraude 500 | "Marquer comme à jour", validations positives |
| `warning` | `AlertTriangle` | Ambre 500 | Kilométrage incohérent, action atypique mais non destructive |
| `danger` | `Trash2` ou `AlertOctagon` | Rouge 500 | Suppression de véhicule, suppression de compte (RGPD) |
| `ai` | `Sparkles` | Gradient violet → indigo | Génération de plan d'entretien Mistral |

**Règles strictes** :

- Une seule variante par modale. Pas de mélange (ex. ne jamais styler un bouton `danger` rouge dans une modale `warning` ambre).
- L'icône à gauche est **toujours** Lucide, jamais émoji.
- Le footer porte une bande colorée (de la même teinte pastel que l'icône) qui rappelle le `variant` — c'est la signature visuelle des dialogues RideCloud.
- Titre court (≤ 8 mots), description ≤ 2 lignes, deux boutons seulement : **Annuler** (ghost) à gauche, **action principale** (variant) à droite.

---

## 6 ter. Visuels IA — génération de plan Mistral

L'IA est le seul élément de l'expérience où l'on s'autorise une couleur en dehors du bleu marque. Elle a son propre vocabulaire visuel, cohérent et reconnaissable :

**Couleur dédiée.** Tout ce qui touche à l'IA utilise le gradient `#8b5cf6 → #6366f1` (`ride-gradient-ai`) ou son pastel `#f5f3ff` (`bg-ai` / `bg-violet-50`). Jamais sur un autre contexte.

**Icône signature.** L'étincelle Lucide `Sparkles` est l'icône canonique de l'IA RideCloud. Elle apparaît sur :
- Le bouton "Générer avec l'IA" (gradient violet, à droite de l'icône),
- Le badge "Plan généré par IA" (pastel violet, à gauche du texte),
- L'en-tête de la modale `ai` (icône blanche sur fond gradient).

**Discours.** L'IA est présentée comme un assistant, jamais comme une intelligence autonome. On dit "Plan généré par l'IA", "Suggestion IA", "Génération en cours…" — jamais "L'IA pense", "L'IA recommande". Le ton reste utilitaire, en français, sobre.

**Transparence.** Tout plan généré par IA porte un badge visible "Plan généré par IA" sur les cartes concernées. L'utilisateur sait toujours d'où vient l'information.

---

## 7. Style vidéo (Reels / TikTok / motion)

### Grammaire générale

**Format vertical 9:16, 1080×1920.**
Toutes les vidéos sociales en vertical natif, jamais en recadrage *post-hoc* d'une vidéo horizontale.

**Durée cible : 15 à 45 secondes.**
Au-delà, on perd la rétention. En dessous, on n'a pas le temps de démontrer.

**Rythme : 2 à 4 secondes par plan.**
Coupes nettes, sans transitions fantaisistes. Aucun *swipe coloré*, aucune transition zoom flou.

### Visuel

**Fonds pastels en motion.**
Quand on insère un screenshot dans une vidéo, il flotte sur un fond pastel uni (ou très légèrement animé en parallaxe lente). Ombre douce. Coins arrondis.

**Texte en surimpression sobre.**
Geist Sans 600, blanc sur fond sombre ou slate 900 sur fond clair. Taille minimum 64 px pour rester lisible mobile. Apparition en *fade up* 200 ms, jamais en *bounce* ou en *typewriter*.

**Pas de zoom dramatique sur les screenshots.**
Le screenshot reste stable ou bouge par micro-translations (8-12 px). Ce qui parle, c'est ce qui est montré, pas l'effet.

### Audio

**Voix-off claire, calme, en français.**
Débit posé. Aucune voix synthétique TikTok par défaut. Si pas de voix-off : musique instrumentale minimaliste (piano, synthé doux, type *Tycho* ou *Bonobo* en plus discret).

**Pas de musique virale courante.**
RideCloud n'épouse pas les tendances audio TikTok. Le son est neutre, élégant, oubliable — ce qui fait que le contenu reste, lui, mémorable.

---

## 8. Direction par canal

### Landing page

**Esprit visuel** : Stripe + Linear.
Hero clair, mockup produit central, ombrage doux, typographie large et aérée. Sections séparées par de larges respirations verticales (120-160 px sur desktop). Aucune section en couleur saturée pleine largeur. Un seul accent fort (CTA bleu marque) par section.

**Composants visuels récurrents** :
Cartes blanches sur fond `#f8fafc`, bordure 1 px `#e2e8f0`, radius 16 px, ombre subtile. Tableaux comparatifs avec colonnes strictement alignées, valeurs en monospace si chiffrées.

### LinkedIn

**Esprit visuel** : carrousel Notion + transparence build-in-public.
Format préféré : carrousel PDF 1080×1350, 6 à 10 slides. Première slide = hook visuel fort (titre + mockup ou KPI), slides suivantes = développement structuré, dernière slide = CTA discret + signature visuelle RideCloud.

**Mise en page slides** : marge 80 px, titre 44 px en haut, contenu structuré, jamais plus de 30 mots par slide. Image ou screenshot occupant 50 à 70 % de la slide quand pertinent.

**Posts texte simple** : pas de visuel imposé, mais si visuel, alors screenshot produit cadré serré sur l'élément discuté, fond pastel, sans frame.

### Instagram

**Esprit visuel** : Apple + lifestyle automobile maîtrisé.
Grille pensée comme un *moodboard* cohérent : alternance posts produit (screenshots framés sur pastel), posts lifestyle (photo véhicule en environnement réel, désaturée), posts typographiques (citation ou slogan sur fond uni).

**Format** : carré 1080×1080 pour le feed, 1080×1920 pour les stories et reels. Filtres : aucun preset Instagram natif, traitement custom (légère baisse de saturation, gain de contraste doux, point noir relevé pour éviter l'effet *brut*).

**Stories** : une ligne typographique forte par story, fond uni pastel ou slate 50, jamais de *stickers* animés Instagram natifs. Si interactif, sondage ou question discret, en fin de série.

### Reels / TikTok

**Esprit visuel** : démonstration produit calme + texte percutant.
Voir section 7. Cadre commun : ouverture forte texte plein écran (0-3 s), démonstration produit screen-recording (3-25 s), signature finale logo + slogan (25-30 s).

**Tonalité** : on ne crie pas, on ne fait pas de "POV", on n'utilise pas de jargon TikTok. La marque parle à des adultes propriétaires de véhicules — pas à un algorithme.

---

## 9. Inspirations visuelles

### Linear (`linear.app`)

À retenir : la respiration verticale entre sections, le contraste sombre/clair maîtrisé, la typographie Inter / Geist large, les screenshots produit héros qui *flottent* sur un fond légèrement coloré.

### Notion (`notion.so`)

À retenir : les illustrations *plates* réservées aux pages support (jamais sur la landing principale), la palette pastel douce, la composition très aérée, les screenshots toujours en contexte d'usage réel.

### Apple (`apple.com`)

À retenir : le silence visuel autour de l'objet, la typographie large en *display*, le mockup produit central sans distraction, l'absence quasi totale d'illustrations décoratives. La grille Apple est la référence ultime du "moins mais mieux".

### Stripe (`stripe.com`)

À retenir : la mise en scène des données (dashboards, métriques, valeurs concrètes en arrière-plan de hero), les dégradés très subtils en pastel, la rigueur typographique, l'effet "interface qui respire".

### Tesla Dashboard

À retenir : la palette sombre premium (indigo profond, blanc, accent unique), la mise en valeur des données critiques, l'épuration extrême de l'interface, le sentiment de *contrôle calme*. Source d'inspiration directe pour les visuels de fonctionnalités "suivi des coûts" et "passeport numérique du véhicule".

---

## 10. Références UI

Composants et patterns à étudier et adapter pour RideCloud :

| Référence | Élément à reprendre |
|---|---|
| Linear — page d'accueil | Hero épuré, mockup principal, sections fonctionnalités alternées |
| Notion — page templates | Cartes produit avec aperçu, hiérarchie titre/sous-titre/CTA |
| Stripe — Dashboard Atlas | Mise en scène data, blocs KPI, graphiques épurés |
| Vercel — page d'accueil | Dégradés très subtils, dark mode premium, blocs comparatifs |
| Apple Wallet | Cartes empilées, ombres douces, organisation des données critiques |
| Tesla — page Model 3 | Vue produit pleine largeur, typographie large, palette sombre disciplinée |
| Raycast — landing | Animations discrètes, démos produit intégrées, typographie sans-serif disciplinée |
| Arc Browser | Pastel saturé maîtrisé, motion subtile, hero typographique |

Chacune de ces références est à consulter comme un *corpus* — pas à copier littéralement.

---

## 11. Guidelines branding

### Logo (en attente de design final)

Construction recommandée : marque mot **RideCloud** en Geist Sans 600, sans logotype illustré complexe. Possibilité d'un picto compact (forme nuage stylisée + accent bleu marque) en complément. Aucune ombre, aucun dégradé sur le logo.

**Espace de protection** : minimum la hauteur de la lettre "R" autour du logo dans toute composition.

**Versions autorisées** :
Logo couleur (bleu marque sur fond clair), logo blanc (sur fond sombre), logo monochrome slate 900 (sur fond pastel). Trois versions, pas plus.

### Ton de communication visuel

Sur tout visuel RideCloud :

- Une seule idée par visuel. Si on doit en dire deux, on fait deux visuels.
- Aucune promesse exagérée affichée ("Économisez 5 000 € par an", "L'app n°1 du marché").
- Pas de superlatifs gratuits ("incroyable", "révolutionnaire").
- Préférer les chiffres concrets et vérifiables (coût/km, 60 secondes d'onboarding, 200 modèles).
- Tutoyer dans l'interface produit, vouvoyer dans le marketing institutionnel et les emails.

### Anti-patterns à éviter absolument

- Photographies *stock* type *Shutterstock corporate* (mains qui tapent sur clavier, équipe souriante, voiture rouge sur route déserte au coucher de soleil).
- Illustrations isométriques colorées de personnages flottants.
- Dégradés saturés type *néon* ou *cyberpunk*.
- *Emojis* dans les visuels institutionnels (landing, hero LinkedIn, emails formels). Tolérés très ponctuellement sur Instagram/TikTok seulement.
- Effets *glassmorphism* / *neumorphism* sur l'interface ou les mockups.
- Captures iPhone avec encoche dessinée façon mockup générique.
- Vidéos en mode *jump cut* ultra-rapide style TikTok 2022.
- Voix synthétiques TikTok par défaut.
- Sons viraux non liés au sujet.
- Sur-emploi du logo (logo géant en fond, watermark agressif).

### Patterns à privilégier systématiquement

- Une couleur d'accent unique par composition (le bleu marque, ou une couleur statut, jamais les deux).
- Beaucoup d'espace blanc / pastel.
- Données réelles, jamais factices.
- Screenshots produit comme héros, illustrations comme support.
- Typographie large, hiérarchie nette, alignement strict à gauche (sauf hero center quand pertinent).
- Animation lente et contenue (200-400 ms, easing *ease-out*, jamais *bounce*).

---

## 12. Checklist de production

Avant de publier ou livrer un visuel RideCloud, vérifier :

- Le visuel respecte la palette officielle (pas de couleur hors charte).
- La typographie est Geist Sans (ou Inter en *fallback*), aucune autre.
- L'éventuel screenshot contient des données réalistes et vérifiables.
- Il n'y a qu'une seule idée par visuel.
- Le titre fait moins de 8 mots.
- Aucune promesse exagérée n'est affichée.
- Le visuel reste lisible en miniature (preview LinkedIn, Instagram grid).
- Le visuel fonctionne sans le logo RideCloud (la signature visuelle doit suffire).
- Si dégradé : il reste entre deux stops listés en section 2 (primary, dark, text, ai).
- Si mockup : pas de *device frame* photoréaliste, ombre `ride-float`.
- Si modale : variante `useConfirm` cohérente (info / success / warning / danger / ai) avec icône Lucide.
- Si visuel IA : gradient violet → indigo uniquement, icône `Sparkles`, badge "Plan généré par IA" visible.
- Si vidéo : durée < 45 s, voix-off française si présente, pas de son viral.
- Si CTA : libellé production ("Créer mon compte gratuit", "Découvrir les tarifs"), pas de "Rejoindre la bêta".

---

*Direction artistique RideCloud · Cohérence visuelle multi-canal · v2.1 production.*
*Référencé sur la Product Sheet officielle, la landing page et le Design System.*
*Univers : Linear · Notion · Apple · Stripe · Tesla Dashboard.*
