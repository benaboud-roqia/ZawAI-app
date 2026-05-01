# 📤 Guide Complet: Publication Automatique sur Réseaux Sociaux

**Pour**: ZawIA App  
**Temps estimé**: 2-3 jours de développement  
**Prérequis**: Authentification sociale configurée

---

## 🎯 OBJECTIF

Permettre aux utilisateurs de publier automatiquement leurs vidéos sur:
- 🎵 **TikTok** (après enregistrement)
- 📸 **Instagram** (Reels et posts)
- 👥 **Facebook** (sur leur page)

---

## 📋 ARCHITECTURE

### Flux de publication

```
1. Utilisateur enregistre une vidéo dans ZawIA
2. Utilisateur clique "Publier sur TikTok/Instagram/Facebook"
3. App upload la vidéo vers notre API
4. API upload la vidéo vers le réseau social
5. API retourne le lien de la publication
6. App affiche "Publié avec succès ✅"
```

---

## 🎵 TIKTOK: CONTENT POSTING API

### Prérequis

1. ✅ TikTok OAuth configuré (déjà fait)
2. ✅ App TikTok approuvée pour login (en attente)
3. ⚠️ **Nouvelle approbation nécessaire** pour Content Posting API

### Permissions requises

- `video.upload` - Upload de vidéos
- `video.publish` - Publication de vidéos

### Étapes pour obtenir l'accès

#### 1. Demander l'accès à Content Posting API

1. Va sur https://developers.tiktok.com/
2. Ouvre ton app "ZawIA"
3. Va dans **"Manage Apps"** → **"ZawIA"**
4. Clique sur **"Apply for Permissions"**
5. Cherche **"Content Posting API"**
6. Clique sur **"Apply"**

#### 2. Remplir le formulaire

| Champ | Réponse suggérée |
|-------|------------------|
| **Use Case** | "Allow users to post videos created in our app directly to TikTok" |
| **Description** | "ZawIA is a video creation app with AI guidance. Users create professional videos and want to share them on TikTok without leaving the app." |
| **Expected Volume** | "100-500 videos per month initially" |
| **User Benefit** | "Seamless posting experience, saves time, increases engagement" |

#### 3. Documents requis

- ✅ Vidéo démo montrant le flux de publication (2-3 minutes)
- ✅ Screenshots de l'interface de publication
- ✅ Privacy Policy (politique de confidentialité)
- ✅ Terms of Service (conditions d'utilisation)

#### 4. Attendre l'approbation

- ⏳ **Délai**: 7-14 jours
- 📧 Tu recevras un email de confirmation

### API Endpoints

Une fois approuvé, tu pourras utiliser:

#### 1. Initialiser l'upload
```
POST https://open.tiktokapis.com/v2/post/publish/video/init/
```

**Body**:
```json
{
  "post_info": {
    "title": "Ma vidéo créée avec ZawIA",
    "privacy_level": "PUBLIC_TO_EVERYONE",
    "disable_duet": false,
    "disable_comment": false,
    "disable_stitch": false,
    "video_cover_timestamp_ms": 1000
  },
  "source_info": {
    "source": "FILE_UPLOAD",
    "video_size": 5242880,
    "chunk_size": 5242880,
    "total_chunk_count": 1
  }
}
```

**Response**:
```json
{
  "data": {
    "publish_id": "v_pub_123abc",
    "upload_url": "https://upload.tiktok.com/..."
  }
}
```

#### 2. Upload la vidéo
```
PUT {upload_url}
Content-Type: video/mp4
Body: [binary video data]
```

#### 3. Confirmer la publication
```
POST https://open.tiktokapis.com/v2/post/publish/status/fetch/
```

**Body**:
```json
{
  "publish_id": "v_pub_123abc"
}
```

**Response**:
```json
{
  "data": {
    "status": "PUBLISH_COMPLETE",
    "publicaly_available_post_id": ["7123456789012345678"]
  }
}
```

---

## 📸 INSTAGRAM: CONTENT PUBLISHING API

### Prérequis

1. ✅ Facebook app créée (à faire - voir GUIDE-FACEBOOK-INSTAGRAM.md)
2. ✅ Instagram Basic Display configuré (à faire)
3. ⚠️ **Compte Instagram Business requis** (pas compte personnel)

### Permissions requises

- `instagram_content_publish` - Publier du contenu
- `pages_read_engagement` - Lire les statistiques

### Étapes pour configurer

#### 1. Convertir en compte Instagram Business

**Sur téléphone**:
1. Ouvre Instagram
2. Va dans **Paramètres** → **Compte**
3. Clique sur **Passer à un compte professionnel**
4. Choisis **Créateur** ou **Entreprise**
5. Lie ton compte à une Page Facebook

#### 2. Obtenir l'Instagram Business Account ID

1. Va sur https://developers.facebook.com/
2. Ouvre ton app "ZawIA"
3. Va dans **"Instagram Basic Display"** → **"User Token Generator"**
4. Génère un token pour ton compte
5. Fais une requête:
   ```
   GET https://graph.facebook.com/v18.0/me/accounts?access_token={token}
   ```
6. Copie l'`instagram_business_account` ID

### API Endpoints

#### 1. Créer un conteneur de média (Reel)
```
POST https://graph.facebook.com/v18.0/{ig_user_id}/media
```

**Params**:
```
media_type=REELS
video_url=https://zawai-app.onrender.com/uploads/video123.mp4
caption=Ma vidéo créée avec ZawIA 🎬 #ZawIA #AI
share_to_feed=true
access_token={user_access_token}
```

**Response**:
```json
{
  "id": "17895695668004550"
}
```

#### 2. Publier le conteneur
```
POST https://graph.facebook.com/v18.0/{ig_user_id}/media_publish
```

**Params**:
```
creation_id=17895695668004550
access_token={user_access_token}
```

**Response**:
```json
{
  "id": "17895695668004551"
}
```

#### 3. Obtenir le lien de la publication
```
GET https://graph.facebook.com/v18.0/{media_id}?fields=permalink
```

**Response**:
```json
{
  "permalink": "https://www.instagram.com/p/ABC123def456/"
}
```

---

## 👥 FACEBOOK: PAGES API

### Prérequis

1. ✅ Facebook app créée (à faire)
2. ✅ Page Facebook créée
3. ⚠️ **Page Access Token requis**

### Permissions requises

- `pages_manage_posts` - Publier sur la page
- `pages_read_engagement` - Lire les statistiques

### Étapes pour configurer

#### 1. Créer une Page Facebook

1. Va sur https://www.facebook.com/pages/create
2. Choisis **"Entreprise ou marque"**
3. Nom de la page: **ZawIA**
4. Catégorie: **Application**
5. Description: **Créez des vidéos professionnelles avec l'IA**

#### 2. Obtenir le Page Access Token

1. Va sur https://developers.facebook.com/tools/explorer/
2. Sélectionne ton app "ZawIA"
3. Clique sur **"Get User Access Token"**
4. Coche les permissions:
   - `pages_manage_posts`
   - `pages_read_engagement`
5. Clique **"Generate Access Token"**
6. Fais une requête:
   ```
   GET /me/accounts
   ```
7. Copie le `access_token` de ta page

### API Endpoints

#### 1. Publier une vidéo
```
POST https://graph.facebook.com/v18.0/{page_id}/videos
```

**Params**:
```
file_url=https://zawai-app.onrender.com/uploads/video123.mp4
description=Ma vidéo créée avec ZawIA 🎬
access_token={page_access_token}
```

**Response**:
```json
{
  "id": "1234567890123456"
}
```

#### 2. Obtenir le lien de la publication
```
GET https://graph.facebook.com/v18.0/{video_id}?fields=permalink_url
```

**Response**:
```json
{
  "permalink_url": "https://www.facebook.com/ZawIA/videos/1234567890123456/"
}
```

---

## 💻 IMPLÉMENTATION DANS L'APP

### Étape 1: Créer les routes API

Je vais créer ces routes dans `zawia-api-standalone`:

#### `/api/publish/tiktok`
```typescript
POST /api/publish/tiktok
Body: {
  access_token: string,
  video_url: string,
  title: string,
  privacy: "PUBLIC" | "FRIENDS" | "PRIVATE"
}
Response: {
  success: boolean,
  post_id: string,
  post_url: string
}
```

#### `/api/publish/instagram`
```typescript
POST /api/publish/instagram
Body: {
  access_token: string,
  video_url: string,
  caption: string,
  share_to_feed: boolean
}
Response: {
  success: boolean,
  media_id: string,
  permalink: string
}
```

#### `/api/publish/facebook`
```typescript
POST /api/publish/facebook
Body: {
  page_access_token: string,
  video_url: string,
  description: string
}
Response: {
  success: boolean,
  video_id: string,
  permalink: string
}
```

### Étape 2: Créer l'interface de publication

Je vais créer un écran `app/publish.tsx` avec:

- ✅ Prévisualisation de la vidéo
- ✅ Champ de titre/légende
- ✅ Sélection des plateformes (TikTok, Instagram, Facebook)
- ✅ Options de confidentialité
- ✅ Bouton "Publier"
- ✅ Barre de progression
- ✅ Liens vers les publications

### Étape 3: Gérer l'upload de vidéos

Je vais créer une route `/api/upload/video` pour:

1. Recevoir la vidéo depuis l'app
2. Sauvegarder temporairement sur Render
3. Retourner l'URL publique
4. Utiliser cette URL pour publier sur les réseaux

---

## 🔒 SÉCURITÉ

### Bonnes pratiques

1. **Ne stocke jamais les access tokens en clair**
   - ✅ Chiffre les tokens dans la base de données
   - ✅ Utilise des tokens à courte durée de vie
   - ✅ Rafraîchis les tokens automatiquement

2. **Vérifie les permissions avant de publier**
   - ✅ Vérifie que l'utilisateur a autorisé la publication
   - ✅ Vérifie que le token est valide
   - ✅ Gère les erreurs de permission

3. **Limite la taille des vidéos**
   - ✅ TikTok: max 287 MB, 10 minutes
   - ✅ Instagram: max 100 MB, 90 secondes
   - ✅ Facebook: max 4 GB, 240 minutes

4. **Nettoie les fichiers temporaires**
   - ✅ Supprime les vidéos après publication
   - ✅ Utilise un cron job pour nettoyer les vieux fichiers

---

## 📊 LIMITES DES API

### TikTok
- **Rate limit**: 100 requêtes/jour par utilisateur
- **Taille max**: 287 MB
- **Durée max**: 10 minutes
- **Formats**: MP4, MOV, WEBM

### Instagram
- **Rate limit**: 25 publications/jour par utilisateur
- **Taille max**: 100 MB
- **Durée**: 3-90 secondes (Reels)
- **Formats**: MP4, MOV
- **Ratio**: 9:16 (vertical)

### Facebook
- **Rate limit**: 200 requêtes/heure
- **Taille max**: 4 GB
- **Durée max**: 240 minutes
- **Formats**: MP4, MOV, AVI

---

## 🐛 DÉPANNAGE

### Erreur: "Permission denied"

**Solution**: 
1. Vérifie que l'utilisateur a autorisé les bonnes permissions
2. Régénère le token avec les permissions correctes
3. Vérifie que le token n'a pas expiré

### Erreur: "Video too large"

**Solution**:
1. Compresse la vidéo avant l'upload
2. Utilise FFmpeg pour réduire la taille
3. Informe l'utilisateur de la limite

### Erreur: "Upload failed"

**Solution**:
1. Vérifie la connexion internet
2. Réessaye l'upload
3. Vérifie que l'URL de la vidéo est accessible publiquement

### Erreur: "Invalid video format"

**Solution**:
1. Convertis la vidéo en MP4
2. Vérifie le codec (H.264 recommandé)
3. Vérifie le ratio (9:16 pour TikTok/Instagram)

---

## 📝 CHECKLIST

Avant de commencer l'implémentation:

**TikTok**:
- [ ] OAuth TikTok approuvé
- [ ] Content Posting API demandé
- [ ] Content Posting API approuvé
- [ ] Vidéo démo créée
- [ ] Privacy Policy et Terms of Service prêts

**Instagram**:
- [ ] Facebook app créée
- [ ] Instagram Basic Display configuré
- [ ] Compte Instagram converti en Business
- [ ] Instagram Business Account ID obtenu
- [ ] Permissions `instagram_content_publish` approuvées

**Facebook**:
- [ ] Facebook app créée
- [ ] Page Facebook créée
- [ ] Page Access Token obtenu
- [ ] Permissions `pages_manage_posts` approuvées

**Backend**:
- [ ] Routes API créées
- [ ] Upload de vidéos implémenté
- [ ] Gestion des tokens implémentée
- [ ] Nettoyage des fichiers temporaires implémenté

**Frontend**:
- [ ] Écran de publication créé
- [ ] Sélection des plateformes implémentée
- [ ] Barre de progression implémentée
- [ ] Gestion des erreurs implémentée

---

## 🎉 PROCHAINES ÉTAPES

Une fois que tu as:
- ✅ Configuré Facebook/Instagram OAuth (voir GUIDE-FACEBOOK-INSTAGRAM.md)
- ✅ Soumis TikTok pour Content Posting API
- ✅ Converti ton compte Instagram en Business
- ✅ Créé une Page Facebook

**Dis-moi**: "Je suis prêt pour la publication automatique"

Je vais alors:
1. Créer les routes API de publication
2. Créer l'écran de publication dans l'app
3. Implémenter l'upload de vidéos
4. Tester le flux complet avec toi

**Temps d'implémentation**: 2-3 jours

---

## 💡 FONCTIONNALITÉS BONUS

### Planification de publications

Ajouter la possibilité de planifier des publications:
- 📅 Choisir date et heure
- 🔄 Publications récurrentes
- 📊 Meilleurs moments pour publier (basé sur l'engagement)

### Analytics

Afficher les statistiques des publications:
- 👁️ Vues
- ❤️ Likes
- 💬 Commentaires
- 🔄 Partages
- 📈 Taux d'engagement

### Cross-posting intelligent

Adapter automatiquement le contenu pour chaque plateforme:
- 📏 Recadrage automatique (9:16, 1:1, 16:9)
- ✂️ Découpage pour Instagram (max 90s)
- #️⃣ Hashtags optimisés par plateforme
- 📝 Légendes adaptées

---

## 📞 BESOIN D'AIDE ?

Si tu as des questions sur:
- Demande d'accès aux API
- Configuration des comptes Business
- Obtention des tokens
- Implémentation du code

Demande-moi et je t'aiderai ! 🚀
