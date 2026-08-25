# Signature Android Release — Google Play App Signing

RideCloud utilise **Google Play App Signing**.

Le fichier local est uniquement une **UPLOAD KEY** (clé d’importation).
Google Play conserve et utilise l’**app signing key** distribuée aux utilisateurs.

Ne jamais commiter le `.jks` / `.keystore`.
Conserver une sauvegarde sécurisée du `.jks` hors machine de build.
Conserver l’alias et les mots de passe dans le gestionnaire de mots de passe.
Réutiliser **la même upload key** pour toutes les futures releases RideCloud.

---

## Emplacements (hors Git)

| Élément | Emplacement |
| --- | --- |
| Upload keystore | `%USERPROFILE%\.android\ridecloud-upload.jks` |
| Propriétés Gradle locales | `android/keystore.properties` (ignoré par Git) |

`android/keystore.properties` n’est **pas** fourni dans le dépôt. Le créer localement, sans le committer :

```properties
storeFile=%USERPROFILE%\.android\ridecloud-upload.jks
storePassword=
keyAlias=ridecloud-upload
keyPassword=
```

Remplir les mots de passe localement uniquement. Jamais dans `build.gradle`, Git, ou cette documentation.

---

## Création manuelle de l’upload key

1. Choisir et enregistrer **deux mots de passe** (store + clé) dans le gestionnaire de mots de passe.
2. Créer le keystore **hors repo**, en interactif (keytool demandera les secrets, ne pas les passer en ligne de commande) :

```bat
keytool -genkeypair -v -keystore "%USERPROFILE%\.android\ridecloud-upload.jks" -alias ridecloud-upload -keyalg RSA -keysize 2048 -validity 10000
```

3. Créer `android/keystore.properties` avec le chemin ci-dessus, l’alias `ridecloud-upload`, et les mots de passe locaux.
4. Sauvegarder le `.jks` dans un coffre hors machine.

Un build Release **sans** cette configuration échoue explicitement. Aucun fallback vers la clé debug.

---

## État au 25/08/2026

Upload key locale configurée. Premier AAB Release (`versionCode` 1 / `versionName` 1.0)
signé, vérifié (`jarsigner` PASS), uploadé. **Google Play App Signing actif.**
Internal Testing validé — voir [`ANDROID-GOOGLE-PLAY.md`](ANDROID-GOOGLE-PLAY.md).

Réutiliser **la même upload key** pour les AAB suivants. Incrémenter `versionCode`
uniquement pour un nouvel upload Play.

## Hors périmètre

- Ne pas modifier `server.url` / REMOTE_URL, Firebase, FCM sans besoin identifié.
- Ne pas régénérer l’AAB `1.0` / `versionCode` 1 sans besoin identifié.
