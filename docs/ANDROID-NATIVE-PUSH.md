# Push Android natif — état au 25/08/2026

> **Statut : VALIDÉ EN PRODUCTION**  
> Appareil réel : **SHARK 9**  
> Bundle web : `https://ridecloud.app` (Capacitor `server.url`)  
> Commit de référence du correctif thenable : `51b5b1d`

Ce document clôt le chantier Push Android avant Google Play Closed Testing.
Ne pas modifier le setup Firebase / Capacitor sans besoin identifié.

---

## Architecture livrée

Deux canaux indépendants, orchestrés par `sendToUser` :

| Canal | Stockage | Client |
| --- | --- | --- |
| Web Push VAPID | `push_subscriptions` | Navigateur / PWA |
| Android FCM | `native_push_tokens` | App Capacitor Android |

- Package Android / Firebase : `fr.javachrist.ridecloud`
- Plugin : `@capacitor/push-notifications@8.1.2`
- Channel Android : `ridecloud-default`
- APIs : `POST /api/push/native/register`, `POST /api/push/native/unregister`
- Client : `src/lib/push/native-client.ts` via wrapper `src/lib/push/native-push-bridge.ts`

`google-services.json` reste **local** et **exclu de Git**. Les secrets serveur Firebase
(`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) sont
configurés sur Vercel Production. Jamais de `NEXT_PUBLIC_*` Firebase.

---

## Incident `PushNotifications.then()` — résolu

**Symptôme (Logcat SHARK 9)** :

```txt
Uncaught (in promise) Error: "PushNotifications.then()" is not implemented on android
```

Permission Android accordée, mais aucun événement `registration`,
`/api/push/native/register` jamais appelée, `native_push_tokens` vide.

**Cause** : `getPushPlugin()` retournait le proxy Capacitor `PushNotifications`
depuis un helper `async`. JavaScript assimilait le proxy à un thenable et
appelait `.then()`, interprété comme méthode native inexistante.

**Correction** : ne jamais résoudre / retourner le proxy plugin depuis une Promise.
Le loader `loadNativePushBridge()` enveloppe le plugin dans un **objet JS plat**
(`checkPermissions`, `requestPermissions`, `register`, `addListener`, …).

**Commit** : `51b5b1d` — `fix(android): wrap Capacitor push plugin to stop PushNotifications.then()`

**Déploiement** : correctif JS uniquement, livré via le bundle web distant.
Aucun `cap sync` ni rebuild APK n’était nécessaire.

---

## Smoke tests réels — 25/08/2026 — PASS

Appareil : SHARK 9, Production `https://ridecloud.app`.

| Scénario | Résultat |
| --- | --- |
| Application complètement fermée → notification Android reçue | PASS |
| Application en arrière-plan → notification reçue | PASS |
| Application ouverte au premier plan → notification reçue | PASS |
| Token FCM enregistré dans `native_push_tokens` | PASS |
| Plus d’erreur `PushNotifications.then()` | PASS |

Ne jamais afficher le token dans les logs, tickets ou documentation.

---

## Flux d’enregistrement

```txt
Réessayer / Activer
→ checkPermissions()
→ register()
→ événement registration
→ token FCM
→ POST /api/push/native/register
→ native_push_tokens
```

Logs attendus (Logcat) :

```txt
[native-push] register:start
[native-push] registration:event
```

---

## Règles de maintenance

- Ne pas retourner un proxy plugin Capacitor depuis une fonction `async`.
- Ne pas lancer `cap sync` ni reconstruire l’APK pour un changement web seul.
- Ne pas modifier Firebase, `google-services.json`, `AndroidManifest`, le channel,
  le backend FCM, les payloads, la RLS, le cron ou Web Push sans besoin identifié.
- Prochaine étape produit : **Google Play Closed Testing** (AAB / Play Console).
  Signature : **Google Play App Signing** + upload key locale — voir
  [`ANDROID-RELEASE-SIGNING.md`](ANDROID-RELEASE-SIGNING.md).
