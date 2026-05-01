# ZawIA API — Standalone

API Express.js pour l'application mobile ZawIA. Version standalone (sans monorepo).

## Routes

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/healthz` | Health check |
| POST | `/api/scenarios/generate` | Générer un scénario de tournage |
| POST | `/api/schedule/optimal-times` | Meilleurs créneaux de publication |
| POST | `/api/captions/generate` | Générer des légendes multi-plateformes |
| POST | `/api/support/chat` | Assistant IA Zawya |
| POST | `/api/tips/generate` | Conseils créatifs personnalisés |
| POST | `/api/analyze/photo` | Analyser une photo (base64) |

## Déploiement sur Render

1. Push ce dossier sur GitHub
2. Aller sur [render.com](https://render.com) → New → Web Service
3. Connecter le repo GitHub
4. Render détecte automatiquement `render.yaml`
5. Ajouter la variable d'environnement :
   - `AI_INTEGRATIONS_ANTHROPIC_API_KEY` = ta clé Anthropic

## Variables d'environnement

```
PORT=3000
AI_INTEGRATIONS_ANTHROPIC_API_KEY=sk-ant-api03-...
```
