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

## Hors périmètre

- Ne pas générer l’AAB tant que l’upload key n’existe pas.
- Ne pas modifier `server.url` / REMOTE_URL, Firebase, FCM, `versionCode` ou `versionName` pour cette préparation.
