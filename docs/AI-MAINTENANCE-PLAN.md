# Plans d'entretien générés par IA

> Génération automatique de plans d'entretien préventifs personnalisés pour les véhicules absents du catalogue constructeur hardcoded de RideCloud, via Mistral AI.

## Vue d'ensemble

RideCloud combine **deux sources** de plans d'entretien :

1. **Catalogue hardcoded** (rapide, déterministe, gratuit)
   - `src/lib/data/maintenance-templates.ts` — templates génériques par catégorie (motos, voitures, scooters, utilitaires)
   - `src/lib/data/maintenance-manufacturer-templates.ts` — règles spécifiques par marque/modèle (Voge 900DSX, Yamaha MT-07, Peugeot 308…)

2. **Cache IA partagé** (extensible, à la demande, payant)
   - Table `maintenance_template_cache` en base : un plan canonique par couple `(category, marque, modele)` partagé entre tous les utilisateurs
   - Plan généré la **première fois** où un utilisateur Premium/Family demande un véhicule absent du catalogue
   - Les utilisateurs suivants bénéficient instantanément du cache (zéro appel LLM)

Cette architecture garantit :
- **Détermination** pour les modèles populaires (catalogue éditorial)
- **Couverture infinie** pour les modèles obscurs (IA)
- **Coût LLM minimal** grâce au cache partagé
- **Fonctionnement offline** garanti même si Mistral est indisponible (fallback générique)

## Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Création d'un véhicule                         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                ┌──────────────────▼──────────────────┐
                │  resolveMaintenanceTemplatesAsync   │
                └──────────────────┬──────────────────┘
                                   │
            ┌──────────────────────┼──────────────────────┐
            │                      │                      │
            ▼                      ▼                      ▼
   ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
   │  Règle         │    │ Cache IA       │    │ Templates      │
   │  constructeur  │    │ (DB partagée)  │    │ génériques     │
   │  hardcoded     │    │                │    │ par catégorie  │
   └────────┬───────┘    └────────┬───────┘    └────────┬───────┘
            │                      │                      │
            │ Priorité 1           │ Priorité 2           │ Fallback
            └──────────────────────┼──────────────────────┘
                                   │
                                   ▼
                ┌──────────────────────────────────┐
                │   Plan d'entretien du véhicule    │
                │  (avec champ template_source)    │
                └──────────────────────────────────┘
```

## Flux utilisateur

### Auto-génération à la création (Premium/Family)

1. L'utilisateur crée un véhicule (formulaire `/vehicules/nouveau`)
2. Le véhicule est inséré → l'utilisateur est redirigé vers la fiche
3. En arrière-plan, `triggerAiPlanGeneration()` appelle `POST /api/maintenance/generate-plan`
4. Si profil constructeur hardcoded existe → 409 (rien à faire)
5. Sinon : cache lookup → si miss, appel Mistral, écriture cache
6. Les `maintenance_plan_entries` du véhicule sont créées/mises à jour avec `template_source = "ai"`
7. Toast de confirmation à l'utilisateur + `router.refresh()`

### Régénération manuelle

Dans l'onglet **Plan d'entretien** d'une fiche véhicule, un bouton **"Régénérer avec l'IA"** est visible :
- Pour les abonnés Premium/Family : actif
- Pour les abonnés Free : un bouton "IA : passer Premium" redirige vers `/tarifs`

La régénération met à jour les descriptions, intervalles, seuils mais **préserve l'historique** (`last_done_km`, `last_done_date` de chaque tâche).

## Composants techniques

### Base de données

#### Colonne `template_source` (sur `maintenance_plan_entries`)

```sql
template_source text check (template_source in ('hardcoded', 'ai', 'community', 'approved'))
```

| Valeur       | Signification                                                     |
|--------------|-------------------------------------------------------------------|
| `hardcoded`  | Template issu de `maintenance-templates.ts` ou `maintenance-manufacturer-templates.ts` |
| `ai`         | Généré par Mistral AI (non validé manuellement)                  |
| `approved`   | Plan IA validé par un admin (à venir : workflow éditorial)       |
| `community`  | Contribué par la communauté (à venir : V2)                       |

#### Table `maintenance_template_cache`

Cache partagé entre tous les utilisateurs. Lecture publique (authentifiée), écriture serveur-only (service_role).

| Colonne              | Type        | Description                                           |
|----------------------|-------------|-------------------------------------------------------|
| `id`                 | uuid        | PK                                                    |
| `category`           | text        | voitures \| motos \| scooters \| utilitaires           |
| `marque_normalized`  | text        | Marque normalisée (sans accents, minuscules, trimée)  |
| `modele_normalized`  | text        | Modèle normalisé (idem)                               |
| `annee`              | int         | Année du véhicule au moment de la génération          |
| `profile_name`       | text        | "Voge 900DSX", "BMW R1250 GS"…                        |
| `templates`          | jsonb       | Tableau de `MaintenanceTemplateEntry`                 |
| `source`             | text        | ai \| approved \| community                            |
| `llm_model`          | text        | "mistral-small-latest", "mistral-medium-latest"…      |
| `prompt_version`     | text        | "v1", "v2"… (pour invalidation cache si prompt change) |
| `generated_at`       | timestamptz | Date de la génération initiale                        |
| `validated_at`       | timestamptz | Date de validation admin (si applicable)              |

Index unique sur `(category, marque_normalized, modele_normalized)` → 1 plan canonique par véhicule.

### Code

#### `src/lib/ai/maintenance-generator.ts`

Client Mistral. Construit le prompt système + utilisateur, appelle `chat/completions` avec `response_format: json_object`, valide via Zod, retourne un `MaintenanceTemplateEntry[]`.

Paramètres :
- Température : `0.2` (déterminisme)
- Modèle : `process.env.MISTRAL_MODEL` ou `mistral-small-latest` par défaut

#### `src/lib/data/maintenance-template-cache.ts`

- `findCachedMaintenanceTemplates({ category, marque, modele })` — lookup
- `writeCachedMaintenanceTemplates(...)` — upsert via Supabase admin
- `normalizeForCache(value)` — normalisation (NFD, lowercase, trim, accents)

#### `src/lib/data/maintenance-template-resolver.ts`

- `resolveMaintenanceTemplatesForVehicle(vehicle)` — synchrone, hardcoded only
- `resolveMaintenanceTemplatesAsync(vehicle)` — async, hardcoded → cache IA → fallback

#### `src/app/api/maintenance/generate-plan/route.ts`

Route POST. Body : `{ vehicleId: string, force?: boolean }`.

Réponses :
- `200` — Plan généré ou récupéré du cache. `{ ok, profileName, templateCount, aiCallMade, source, llmModel }`
- `401` — Non authentifié
- `402` — Plan Free (mention `upgradeUrl`)
- `404` — Véhicule introuvable
- `409` — Profil constructeur hardcoded déjà disponible (pas besoin d'IA)
- `500` — Erreur interne
- `502` — Erreur Mistral

## Configuration

### Variables d'environnement

```bash
# .env.local
MISTRAL_API_KEY=your_mistral_api_key
MISTRAL_MODEL=mistral-small-latest   # optionnel
```

### Récupération de la clé Mistral

1. Créer un compte sur https://console.mistral.ai
2. Aller dans **API Keys** → **Create new key**
3. Copier la clé et l'ajouter à `.env.local` (et à Vercel pour la production)

### Choix du modèle

| Modèle                  | Qualité    | Coût (1k tokens) | Recommandation                      |
|-------------------------|------------|------------------|-------------------------------------|
| `mistral-small-latest`  | Très bonne | ~0,002 €         | **Défaut** pour RideCloud           |
| `mistral-medium-latest` | Excellente | ~0,01 €          | Si la qualité est critique          |
| `open-mistral-7b`       | Basique    | ~0,0002 €        | Tests/dev uniquement                |

## Coûts opérationnels

- **1 appel Mistral** = ~1 500 tokens input + 800 output ≈ **0,002 €** avec `mistral-small-latest`
- Grâce au cache partagé, chaque modèle de véhicule **ne coûte qu'une fois** la génération initiale
- Estimation 10 000 utilisateurs avec 2 véhicules en moyenne dont 30 % hors catalogue hardcoded → **~6 000 appels uniques** sur la durée de vie de l'app → ~12 € total

Le cache est durable (pas d'expiration). Pour forcer une régénération, utiliser `force: true` côté API.

## Sécurité et confidentialité

- **Aucune donnée personnelle** n'est envoyée à Mistral. Seulement : `category, marque, modele, annee, carburant`
- Le cache est partagé : **un plan généré bénéficie à tous les utilisateurs** ayant le même modèle (pas de fuite, car le plan n'est qu'une suite d'intervalles d'entretien constructeur publics)
- Mistral AI est une entreprise française, hébergement européen, conformité RGPD documentée
- La clé API est **côté serveur uniquement** (jamais exposée au client)

## Promotion d'un plan IA vers le catalogue hardcoded (workflow éditorial)

Pour l'instant, manuel :

1. Un plan IA `source = 'ai'` est suffisamment utilisé / signalé comme bon
2. Un mainteneur consulte la ligne dans `maintenance_template_cache`
3. Si le plan est correct, il l'ajoute à `maintenance-manufacturer-templates.ts` (Git commit)
4. Optionnel : il met à jour la ligne en `source = 'approved'` + `validated_at = now()` + `validated_by = uid`

À terme (V2), prévoir une page admin pour valider en bulk.

## Roadmap

- [x] Phase 1 : Génération à la demande + cache + UI
- [ ] Phase 2 : Promotion auto plan IA → catalogue éditorial après N utilisations
- [ ] Phase 3 : Permettre à un user Premium d'éditer son plan IA (overrides utilisateur)
- [ ] Phase 4 : Crowd-sourcing : les utilisateurs valident/notent leur plan, score communautaire
- [ ] Phase 5 : Multi-providers (OpenAI/Claude en fallback si Mistral down)
