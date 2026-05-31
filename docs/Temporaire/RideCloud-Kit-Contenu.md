# RideCloud — Kit de contenu marketing

> Kit dérivé de la landing page RideCloud — version 2.1.
> Ton : moderne, premium, accessible, orienté bénéfices utilisateur.
> Pas de marketing agressif, pas de promesses exagérées.
>
> *RideCloud est désormais en production, ouvert à tous (Free / Premium 3,99 €/mois / Family 6,99 €/mois).*

---

## 1. Cinq posts LinkedIn — Build-in-public

### Post 1 — L'ouverture publique

> **RideCloud est ouvert. Gratuitement, pour tout le monde.**
>
> Pendant des années, j'ai gardé mes factures de garage dans un classeur.
> Mes rappels d'entretien dans Notes.
> Mes documents véhicules dans 3 dossiers Drive différents.
>
> Et à chaque fois que je devais retrouver une vidange ou préparer une revente : 30 minutes perdues à fouiller.
>
> Le problème, ce n'est pas l'organisation. C'est l'outil.
>
> Aucune app existante ne fait correctement ces trois choses ensemble :
>
> – Suivre **plusieurs véhicules** (auto, moto, utilitaire) au même endroit.
> – Générer un **plan d'entretien adapté à chaque modèle**, même les plus rares — grâce à l'IA pour les véhicules non couverts par nos règles constructeur.
> – Vous laisser **exporter vos données** quand vous voulez, sans verrouillage.
>
> C'est ce qu'on a construit avec **RideCloud**.
> Un carnet d'entretien intelligent, en français, premium, hébergé en Europe.
>
> En production. Ouvert à tous. Le plan Free permet déjà de suivre un véhicule complet — pas de carte bancaire demandée pour commencer.
>
> Premium à 3,99 €/mois (5 véhicules + plan d'entretien généré par IA), Family à 6,99 €/mois (15 véhicules). Annulation en 1 clic, paiements Mollie sécurisés.
>
> #BuildInPublic #SaaS #ProductBuilding

---

### Post 2 — Une décision produit (carrousel possible)

> **Pourquoi RideCloud n'est pas une app native iOS / Android.**
>
> La question revient à chaque conversation : "Vous serez sur l'App Store ?"
>
> Réponse courte : non.
>
> RideCloud est une **PWA** — une application web installable.
> Trois raisons derrière ce choix :
>
> 1. **Friction d'installation quasi nulle.**
>    L'utilisateur clique sur "Installer", l'app arrive sur son écran d'accueil. 3 secondes. Zéro store.
>
> 2. **Mises à jour instantanées.**
>    Un déploiement = une release. Pas de validation Apple, pas de versions fragmentées.
>
> 3. **Une seule base de code.**
>    iOS, Android, desktop, tablette — tout est servi par la même application Next.js.
>    L'énergie va dans le produit, pas dans la duplication.
>
> Limite assumée : les notifications push iOS sont plus capricieuses qu'en natif.
> Pari : la PWA est aujourd'hui largement assez mature pour 95 % des cas d'usage de RideCloud.
>
> Si un jour la traction l'exige, on basculera. Pas avant.
>
> #BuildInPublic #PWA #ProductDecisions

---

### Post 3 — Behind-the-scenes technique

> **Le moment où RideCloud a vraiment commencé à se sentir comme une app premium.**
>
> Ce n'est pas quand on a ajouté le dashboard.
> Ce n'est pas quand on a fini l'authentification.
>
> C'est quand on a remplacé **toutes** les `window.confirm()` par un système de modales contextuelles maison.
>
> Cinq variantes seulement, chacune avec sa couleur, son icône Lucide, son ton :
>
> – `info` (sky 500) pour les exports
> – `success` (émeraude) pour "marquer comme à jour"
> – `warning` (ambre) pour les kilométrages incohérents
> – `danger` (rouge) pour les suppressions
> – `ai` (gradient violet → indigo) pour les générations Mistral
>
> Détail technique ? Oui. Impact perçu ? Énorme.
>
> Un produit "premium", ce n'est pas une fonctionnalité spectaculaire.
> C'est la somme de 200 micro-décisions sur la friction, le rythme, le silence visuel.
>
> Quelques exemples qui ont changé l'expérience RideCloud :
>
> – Transitions Tailwind 150-200 ms (easing `ride-spring`) sur tous les composants.
> – Icônes Lucide alignées au pixel, stroke 1.75.
> – Champs de formulaire validés en live avec Zod, pas après le submit.
> – Focus visible et navigation clavier sur chaque dialogue Radix.
> – Hiérarchie typographique stricte : 3 tailles, jamais 7.
> – Ombres `ride-*` à 5 niveaux pour rythmer la profondeur sans saturer.
>
> Le résultat : une app qu'on a plaisir à ouvrir.
> Et dans le SaaS, ça change tout.
>
> #BuildInPublic #UX #DesignSystem

---

### Post 4 — Le pari de l'IA

> **On a branché Mistral sur RideCloud. Voilà ce que ça change.**
>
> Un problème qui me suivait depuis le début : on ne peut pas écrire à la main un plan d'entretien pour les **6 000+ modèles** auto/moto/utilitaire en circulation.
>
> Solution naïve : se cantonner aux 20 modèles populaires.
> Solution coûteuse : engager un mécano pour les autres.
> Solution RideCloud : **Mistral**.
>
> Quand un utilisateur Premium ajoute un véhicule non couvert par nos règles constructeur en dur, un bouton apparaît : "Générer un plan personnalisé".
>
> En ~10 secondes, l'IA propose 8 à 12 tâches d'entretien préventif avec intervalles km/mois et priorités. Validation par schéma strict côté serveur — pas de tâche fantaisiste qui passe.
>
> Trois choix techniques qui font la différence :
>
> 1. **Modèle européen** (Mistral) — pas de Big 4 US dans le pipeline.
> 2. **Cache partagé entre utilisateurs** du même modèle — on génère une fois, on sert mille.
> 3. **Toujours en complément des règles constructeur** quand elles existent. L'IA n'écrase jamais une donnée vérifiée.
>
> Coût marginal par génération : quelques centimes. Couverture instantanée : illimitée. Et plus on a d'utilisateurs, plus la couverture s'enrichit pour les suivants.
>
> #BuildInPublic #AI #Mistral #SaaS

---

### Post 5 — Vision / positionnement

> **Ce que RideCloud essaie vraiment de devenir.**
>
> À court terme, RideCloud, c'est un carnet d'entretien intelligent.
> Multi-véhicules, multi-catégories, exportable, premium.
>
> Mais ce n'est pas la fin de l'histoire.
>
> La vision derrière le produit, c'est le **passeport numérique du véhicule**.
>
> Un standard, transférable, reconnu, dans lequel chaque véhicule porte son histoire avec lui — au-delà de son propriétaire actuel.
>
> Concrètement, ça veut dire :
>
> – L'acheteur d'occasion reçoit le dossier complet, daté, vérifiable. Avec RideCloud, il peut même l'importer en 1 clic dans son propre compte.
> – Le vendeur valorise son véhicule de 10 à 20 % grâce à un historique propre.
> – Les assureurs peuvent récompenser un entretien rigoureux.
> – L'écosystème (garages, contrôle technique, cote véhicule) se branche dessus via API.
>
> On n'y est pas encore. On y va.
>
> Étape par étape : MVP → bêta → production publique (✅ on y est) → V1 partage familial → partenaires API.
>
> Si cette vision résonne, le moment idéal pour entrer, c'est maintenant. Plan Free, sans engagement, données exportables à tout moment.
>
> #BuildInPublic #Vision #SaaS

---

## 2. Trois scripts Reels / TikTok — 30 secondes

### Script 1 — "Combien vous coûte vraiment votre voiture ?"

**Format** : Screen recording dashboard + voix-off + texte en surimpression.
**Durée** : 30 s.

| Temps | Visuel | Voix-off / Texte |
|---|---|---|
| 0-3 s | Plan rapproché d'un tableau de bord de voiture, compteur kilométrique qui défile. | **"Combien vous coûte vraiment votre voiture ?"** *(texte plein écran, fond sombre)* |
| 3-8 s | Zoom sur une calculatrice et un classeur de factures en désordre. | "La plupart des gens répondent un chiffre rond. La vraie réponse est ailleurs." |
| 8-18 s | Screen recording RideCloud : ouverture du véhicule, scroll vers le bloc KPI Coûts. Affichage : coût du mois, de l'année, coût/km. | "RideCloud calcule tout. Au mois. À l'année. Au kilomètre. À partir de ce que vous saisissez en 30 secondes." |
| 18-25 s | Bascule rapide entre la fiche d'une voiture, d'une moto, d'un utilitaire. | "Et pour chaque véhicule que vous possédez." |
| 25-30 s | Logo RideCloud + texte de CTA. | **"RideCloud. Gratuit. Ouvert à tous."** *Lien en bio.* |

---

### Script 2 — "Vendre sa voiture 1 500 € plus cher"

**Format** : Talking head + insert screen recording.
**Durée** : 30 s.

| Temps | Visuel | Voix-off / Texte |
|---|---|---|
| 0-3 s | Talking head, ton calme, regard caméra. Texte fort en surimpression. | **"Une voiture sans historique perd 10 à 20 % de sa valeur."** |
| 3-8 s | Insert : main qui feuillette un carnet d'entretien papier corné, factures froissées. | "Carnet papier perdu, factures dispersées, dates oubliées. Le vendeur perd. L'acheteur doute." |
| 8-20 s | Screen recording RideCloud : clic sur "Exporter le dossier" → génération PDF → aperçu d'un dossier propre et structuré. | "Avec RideCloud, vous exportez votre dossier complet en un clic. Historique daté, factures, documents, modifications. Le tout dans un PDF prêt à transmettre. Ou en JSON, pour qu'il l'importe directement dans son propre compte." |
| 20-26 s | Retour talking head, sourire discret. | "Un acheteur qui voit tout, c'est un acheteur qui paie le prix juste." |
| 26-30 s | Logo RideCloud + CTA. | **"RideCloud. Votre véhicule mérite mieux qu'un classeur."** |

---

### Script 3 — "L'IA qui connaît votre moto rare"

**Format** : Démonstration produit · screen recording + texte percutant.
**Durée** : 30 s.

| Temps | Visuel | Voix-off / Texte |
|---|---|---|
| 0-3 s | Texte plein écran sur fond violet pastel, étincelle Lucide animée. | **"Votre moto est trop rare pour les apps classiques."** |
| 3-8 s | Screen recording : ajout d'un véhicule (modèle peu courant) dans RideCloud. | "Vous l'ajoutez. RideCloud cherche dans ses règles constructeur." |
| 8-15 s | Apparition du bouton "Générer un plan personnalisé (IA)" · gradient violet, étincelle. | "Pas couvert ? Un bouton apparaît. L'IA Mistral génère un plan complet en 10 secondes." |
| 15-22 s | Affichage du plan : 10 tâches d'entretien avec intervalles km/mois, badge violet "Plan généré par IA". | "8 à 12 tâches d'entretien préventif. Avec dates. Avec kilométrages. Validées par schéma." |
| 22-28 s | Zoom sur le badge "Plan généré par IA". | "Transparence totale. Vous savez d'où vient chaque information." |
| 28-30 s | Logo RideCloud + CTA. | **"RideCloud Premium. 3,99 €/mois. Inclus."** |

---

## 3. Cinq slogans premium alternatifs

Slogans pensés pour des supports premium (landing, vidéos d'institutionnel, signatures email). Ils complètent — sans remplacer — la baseline officielle *"Le carnet d'entretien intelligent de tous vos véhicules."*

1. **Chaque kilomètre a son histoire. Gardez-la.**
2. **L'intelligence silencieuse derrière chaque trajet.**
3. **Vos véhicules, sous un même ciel.**
4. **Le passeport numérique de ce que vous conduisez.**
5. **Conduire l'esprit clair.**

---

## 4. Trois CTA plus premium

Formulations alternatives aux CTA classiques type *"S'inscrire"*. Pensées pour ne pas crier, pour donner envie d'entrer.

1. **Créer mon compte gratuit →**
2. **Démarrer avec un véhicule →**
3. **Découvrir RideCloud Premium →**

> Conseil d'usage : associer un sous-texte discret du type *"Sans engagement · Sans carte bancaire pour le plan Free · Vos données restent les vôtres"* pour renforcer la légitimité sans pousser.

---

## 5. Trois emails de cycle de vie

Séquence pensée pour les nouveaux comptes RideCloud.
Cadence suggérée : email 1 à l'inscription (immédiat), email 2 à J+3 si aucun véhicule créé, email 3 à J+14 pour proposer Premium aux utilisateurs actifs.

---

### Email 1 — Bienvenue · activation

**Objet** : Bienvenue sur RideCloud — voici comment commencer.
**Préheader** : Vos véhicules, enfin dans le cloud. Trois étapes pour démarrer.

---

Bonjour,

Bienvenue sur **RideCloud**.

Votre compte est actif. Vous pouvez dès maintenant ajouter votre premier véhicule à l'adresse suivante :

→ **[ Accéder à RideCloud ]**

Trois étapes pour bien commencer (compter 2 minutes au total) :

**1. Ajoutez votre véhicule.**
Marque, modèle, année, kilométrage actuel. RideCloud génère automatiquement un plan d'entretien adapté à ce que vous conduisez — pas un calendrier générique.

**2. Saisissez votre dernier entretien.**
Une vidange, un contrôle technique, une révision récente. RideCloud calcule immédiatement les prochaines échéances en kilomètres et en jours.

**3. Installez l'application.**
Un menu "Installer RideCloud" apparaît dans la barre d'adresse de votre navigateur (Chrome, Safari, Firefox). 3 secondes pour avoir l'app sur votre écran d'accueil — iOS, Android, desktop.

Quelques précisions utiles :

- Le plan **Free** suit 1 véhicule avec toutes les fonctionnalités essentielles. C'est suffisant pour démarrer.
- Si vous gérez plusieurs véhicules ou souhaitez le plan d'entretien généré par IA, le plan **Premium** est à 3,99 €/mois (39 €/an, -18 %). Annulable en 1 clic.
- Vos données vous appartiennent. Export JSON / ZIP / PDF à tout moment. Suppression de compte effective en 1 clic depuis vos paramètres.

Bonne route,

**L'équipe RideCloud**
*La vie de vos véhicules, enfin dans le cloud.*

---

### Email 2 — Relance · activation

**Objet** : Votre RideCloud vous attend (un véhicule, 60 secondes).
**Préheader** : Voici exactement à quoi sert l'application, en 3 cas concrets.

---

Bonjour,

Votre compte RideCloud est ouvert depuis quelques jours, mais vous n'avez pas encore ajouté de véhicule.

Pas de pression. Juste trois exemples concrets de ce que ça change, le jour où vous le faites :

**1. À l'ajout du véhicule.**
Vous saisissez marque, modèle, année, kilométrage. RideCloud génère le plan d'entretien complet adapté à votre modèle. Les prochaines échéances apparaissent immédiatement — en kilomètres et en jours.

**2. En fin de mois.**
Sur la fiche du véhicule, vous voyez en un coup d'œil ce qu'il vous a coûté ce mois-ci, cette année, depuis le début, et au kilomètre. Sans tableur, sans saisie manuelle des sommes par catégorie.

**3. Au moment de la revente.**
Un clic sur "Exporter". RideCloud génère un dossier complet en PDF — historique, factures, modifications, documents. Vous le transmettez à l'acheteur. Le véhicule conserve sa valeur.

Pas de carte bancaire à saisir pour le plan Free. Vos données sont stockées en Europe, conformes au RGPD, exportables à tout moment.

→ **[ Ajouter mon premier véhicule ]**

À très vite,

**L'équipe RideCloud**

---

### Email 3 — Découverte Premium · J+14

**Objet** : Passer Premium ? Voici ce que ça change, concrètement.
**Préheader** : 3,99 €/mois. 5 véhicules. Plan d'entretien IA inclus. Pas d'engagement.

---

Bonjour,

Vous utilisez RideCloud depuis quelques jours. Merci.

Si vous gérez **plus d'un véhicule** ou possédez un modèle peu courant, le plan **Premium** a été pensé exactement pour vous.

Voici ce qu'il ajoute, sans superflu :

- **Jusqu'à 5 véhicules suivis** en parallèle (vs. 1 en Free).
- **Plan d'entretien généré par IA (Mistral)** pour les modèles non couverts par nos règles constructeur. ~10 secondes pour un plan complet de 8 à 12 tâches, validé par schéma strict, partagé avec les autres utilisateurs du même modèle.
- **Support email prioritaire.**

Tarif : **3,99 €/mois** ou **39 €/an** (-18 %).
Paiement par carte bancaire ou SEPA via **Mollie**. Annulation immédiate en 1 clic — votre plan reste actif jusqu'à la fin de la période payée, puis retombe automatiquement sur Free. Aucun engagement.

Si vous gérez un foyer ou plus de 5 véhicules, le plan **Family** (6,99 €/mois, 15 véhicules) est le bon choix.

→ **[ Passer Premium ]**     →  **[ Voir tous les plans ]**

Et si Free vous suffit, c'est très bien aussi — il restera disponible aussi longtemps que RideCloud existera.

Bonne route,

**L'équipe RideCloud**
*Chaque kilomètre a son histoire. Gardez-la.*

---

*Kit de contenu v2.1 cohérent avec la landing page RideCloud, la Product Sheet officielle et l'état de production (Mollie · IA Mistral · modales useConfirm).*
*Ton conservé : moderne, premium, accessible, orienté bénéfices utilisateur.*
