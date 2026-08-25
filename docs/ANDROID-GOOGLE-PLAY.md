# Google Play — RideCloud Android

Référence opérationnelle pour le versioning, l’AAB, la signature, Internal Testing,
Closed Testing et les releases suivantes.

Package : `fr.javachrist.ridecloud`  
Frontend Android : **REMOTE_URL** `https://ridecloud.app` (volontaire, ne pas changer sans besoin)  
Signature : **Google Play App Signing** + upload key locale hors Git — voir
[`ANDROID-RELEASE-SIGNING.md`](ANDROID-RELEASE-SIGNING.md).

---

## GOOGLE PLAY INTERNAL TESTING = PASS

Validé le **25/08/2026** sur appareil réel **SHARK 9**.

| Élément | État |
| --- | --- |
| Premier AAB Release | `versionCode` **1** / `versionName` **1.0** |
| Build Release | PASS |
| Signature AAB (`jarsigner`) | PASS |
| Google Play App Signing | Actif (Play conserve l’app signing key) |
| Upload key | Locale, hors Git |
| Test interne publié | « RideCloud 1.0 - Test interne 1 » |
| Installation depuis Play | `installerPackageName=com.android.vending` |
| minSdk / targetSdk | 24 / 36 |
| Lancement depuis la version Play | PASS |
| Push FCM app complètement fermée | PASS |
| Notification Android visible | PASS |
| Inbox / cloche RideCloud | PASS |
| Chaîne Play → Android → FCM → RideCloud | PASS |

Commits de configuration signature :

- `243fa2d` — `build(android): configure release signing`
- `87157df` — `fix(android): fix release signing validation closure`

Le test interne Google Play est **considéré validé**. Ne pas régénérer l’AAB
`1.0` / `versionCode 1` sans besoin identifié.

---

## Versioning Android

| Champ | Emplacement | Internal Testing 1 |
| --- | --- | --- |
| `applicationId` | `android/app/build.gradle` | `fr.javachrist.ridecloud` |
| `versionCode` | idem | `1` (entier, +1 à chaque AAB uploadé) |
| `versionName` | idem | `1.0` (affiché sur Play) |

`package.json` (`0.1.0`) est la version web npm, **pas** la version Play.
Chaque nouvel AAB Play exige un `versionCode` strictement supérieur.

---

## Génération AAB (rappel, ne pas exécuter sans demande)

Prérequis : `android/keystore.properties` + upload keystore hors repo.
Sans cette config, Gradle **échoue** (aucun fallback debug).

```bat
cd android
gradlew.bat bundleRelease
```

Artefact typique : `android/app/build/outputs/bundle/release/app-release.aab`  
(`*.aab` est gitignoré.)

Vérifier la signature localement avant upload Play (`jarsigner -verify`).
Ne jamais afficher ni committer de secret, mot de passe ou token FCM.

---

## Internal Testing — procédure validée

1. Uploader l’AAB Release signé (upload key) dans Play Console.
2. Activer **Google Play App Signing** (déjà actif pour RideCloud).
3. Publier une release Internal Testing (ex. « RideCloud 1.0 - Test interne 1 »).
4. Installer **depuis Google Play** (pas un sideload). Contrôle :
   `installerPackageName=com.android.vending`.
5. Smoke : lancement, push FCM app fermée, notif système, inbox / cloche.

---

## Prochaine étape — GOOGLE PLAY CLOSED TESTING

À préparer avant ouverture Closed Testing (fiche + conformité, pas un nouvel AAB
tant que `1.0` / `versionCode 1` suffit) :

- Configuration complète de la fiche Play
- Accès à l’application (Closed Testing + liste de testeurs)
- Règles de confidentialité / **Data safety**
- Classification du contenu
- Public cible
- Présence de publicités
- Informations de contact
- Fiche Play Store (textes, visuels, catégorie)
- Liste réelle de bêta-testeurs
- Lien Closed Testing
- Procédure Beta Club

Référence technique push : [`ANDROID-NATIVE-PUSH.md`](ANDROID-NATIVE-PUSH.md).

---

## Suppression de compte — URL officielle Google Play

URL publique permanente (sans connexion) :

**https://ridecloud.app/suppression-compte**

À renseigner dans Play Console → **Sécurité des données** (et toute question
demandant une URL web de suppression de compte).

| Élément | Réponse réelle |
| --- | --- |
| Suppression depuis l’app | **Paramètres → Supprimer mon compte** (confirmation par e-mail du compte, pas le mot de passe) |
| Suppression sans l’app | E-mail prérempli vers `support@javachrist.fr` depuis la page publique |
| Endpoint applicatif | `POST /api/account/delete` (session authentifiée uniquement — ne pas exposer comme API publique) |
| Mot de passe demandé | **Non** |
| « Les utilisateurs peuvent-ils demander la suppression de certaines ou de toutes leurs données sans devoir supprimer leur compte ? » | **Oui** |

Justification Play Console (question facultative) : **Oui** — l’utilisateur peut
déjà supprimer un véhicule, un entretien, une échéance, un document, une
modification, une notification, ou désactiver les notifications push, **sans**
supprimer le compte. Ce n’est pas une demande globale d’effacement : chaque
action retire uniquement l’élément choisi. La suppression de **toutes** les
données du compte passe par la suppression de compte.

Pages liées : `/confidentialite`, `/rgpd`.

---

## Dette à traiter avant Closed Testing / Production Play

Ne pas modifier le code applicatif dans ce chantier. À planifier :

| Sujet | État | Quand |
| --- | --- | --- |
| Landing / Kit-Contenu « PWA sans store » | Copy marketing encore vraie pour le web ; le shell Play existe | Avant Production store (ou Closed si la fiche promet le store) |
| Page `/confidentialite` | Mise à jour 25/08/2026 (FCM, jeton, désactivation, suppression) | Relire avant Data safety |
| Page `/rgpd` | Mise à jour 25/08/2026 (section notifications natives + lien suppression) | Relire avant Data safety |
| Page `/suppression-compte` | Page publique 25/08/2026 | **URL Data safety Play** |
| Suppression de compte | UI + API existantes ; tokens en `ON DELETE CASCADE` | Vérifier le libellé Data safety |
| Data safety Play | Formulaire Console à remplir (notifications, identifiants d’appareil, URL suppression) | **Avant Closed Testing** |

---

## Règles

- Même upload key pour toutes les releases RideCloud.
- Ne pas committer `.jks`, `keystore.properties`, `google-services.json`.
- Ne pas modifier REMOTE_URL, Firebase, Capacitor, `versionCode` / `versionName`
  sans besoin identifié.
- Ne pas lancer `cap sync` pour un changement web seul.
