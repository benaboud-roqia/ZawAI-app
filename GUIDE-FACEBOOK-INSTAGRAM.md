# 📘 Guide Complet: Configuration Facebook & Instagram OAuth

**Pour**: ZawIA App  
**Temps estimé**: 1-2 heures  
**Prérequis**: Compte Facebook/Instagram personnel

---

## 🎯 OBJECTIF

Permettre aux utilisateurs de se connecter à ZawIA avec leur compte Facebook ou Instagram.

**Code déjà implémenté** ✅  
**Il te faut juste**: Les clés API de Facebook

---

## 📋 ÉTAPE 1: CRÉER L'APPLICATION FACEBOOK

### 1.1 Aller sur Facebook Developers

1. Ouvre ton navigateur
2. Va sur: **https://developers.facebook.com/**
3. Clique sur **"My Apps"** (en haut à droite)
4. Si c'est ta première fois, accepte les conditions d'utilisation

### 1.2 Créer une nouvelle app

1. Clique sur **"Create App"** (bouton vert)
2. Choisis le type d'app: **"Consumer"**
   - ✅ Consumer (pour les utilisateurs finaux)
   - ❌ Pas Business, Gaming, ou Other
3. Clique **"Next"**

### 1.3 Remplir les informations

| Champ | Valeur |
|-------|--------|
| **App Name** | `ZawIA` |
| **App Contact Email** | Ton email (ex: roqia@example.com) |
| **Business Account** | Laisse vide (optionnel) |

4. Clique **"Create App"**
5. Vérifie ton identité (Facebook peut demander un CAPTCHA)

✅ **Résultat**: Tu as maintenant une app Facebook !

---

## 📋 ÉTAPE 2: CONFIGURER FACEBOOK LOGIN

### 2.1 Ajouter le produit Facebook Login

1. Dans le dashboard de ton app, cherche **"Add Products to Your App"**
2. Trouve **"Facebook Login"**
3. Clique sur **"Set Up"**

### 2.2 Choisir la plateforme

1. Choisis **"Android"** (pas iOS, pas Web)
2. Clique **"Next"**

### 2.3 Configurer Android

#### Package Name
```
com.zawyaai.app
```

#### Default Activity Class Name
```
com.zawyaai.app.MainActivity
```

#### Key Hashes

**Pour obtenir le Key Hash de développement**:

**Sur Windows (PowerShell)**:
```powershell
keytool -exportcert -alias androiddebugkey -keystore "$env:USERPROFILE\.android\debug.keystore" | openssl sha1 -binary | openssl base64
```

**Mot de passe par défaut**: `android`

**Sur Mac/Linux**:
```bash
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64
```

**Exemple de résultat**:
```
lPQmE7zH8wL3qxPvqQ8hF5K9Xzc=
```

Copie ce hash et colle-le dans le champ **"Key Hashes"**.

### 2.4 Activer Single Sign On

1. Coche **"Single Sign On"** → **Enabled**
2. Clique **"Save Changes"**

### 2.5 Configurer les OAuth Redirect URIs

1. Dans le menu de gauche, va dans **"Facebook Login"** → **"Settings"**
2. Dans **"Valid OAuth Redirect URIs"**, ajoute:
   ```
   zawyaai://auth/facebook
   ```
3. Clique **"Save Changes"**

✅ **Résultat**: Facebook Login est configuré !

---

## 📋 ÉTAPE 3: CONFIGURER INSTAGRAM BASIC DISPLAY

### 3.1 Ajouter le produit Instagram

1. Retourne au dashboard principal
2. Cherche **"Add Products to Your App"**
3. Trouve **"Instagram Basic Display"**
4. Clique sur **"Set Up"**

### 3.2 Créer l'app Instagram

1. Clique sur **"Create New App"**
2. Remplis les informations:

| Champ | Valeur |
|-------|--------|
| **Display Name** | `ZawIA` |
| **Valid OAuth Redirect URIs** | `zawyaai://auth/instagram` |
| **Deauthorize Callback URL** | `https://zawai-app.onrender.com/auth/instagram/deauth` |
| **Data Deletion Request URL** | `https://zawai-app.onrender.com/auth/instagram/delete` |

3. Clique **"Save Changes"**

### 3.3 Ajouter un testeur Instagram (Important!)

Pour tester Instagram Login avant la publication:

1. Va dans **"Roles"** → **"Instagram Testers"**
2. Clique **"Add Instagram Testers"**
3. Entre ton nom d'utilisateur Instagram
4. Clique **"Submit"**
5. **Important**: Va sur Instagram → Paramètres → Apps et Sites Web → Accepte l'invitation

✅ **Résultat**: Instagram Basic Display est configuré !

---

## 📋 ÉTAPE 4: OBTENIR LES CLÉS API

### 4.1 Trouver App ID et App Secret

1. Dans le menu de gauche, clique sur **"Settings"** → **"Basic"**
2. Tu verras:

| Clé | Exemple | Action |
|-----|---------|--------|
| **App ID** | `123456789012345` | Copie cette valeur |
| **App Secret** | `••••••••••••••••` | Clique "Show" puis copie |

**⚠️ IMPORTANT**: Ne partage JAMAIS ton App Secret publiquement !

### 4.2 Sauvegarder les clés

Copie ces valeurs dans un fichier texte temporaire:

```
FACEBOOK_APP_ID=123456789012345
FACEBOOK_APP_SECRET=abc123def456ghi789jkl012mno345pq
```

✅ **Résultat**: Tu as tes clés API !

---

## 📋 ÉTAPE 5: AJOUTER LES CLÉS À RENDER

### 5.1 Aller sur Render

1. Va sur: **https://dashboard.render.com/**
2. Connecte-toi avec ton compte
3. Clique sur ton service **"zawai-app"**

### 5.2 Ajouter les variables d'environnement

1. Dans le menu de gauche, clique sur **"Environment"**
2. Clique sur **"Add Environment Variable"**

**Variable 1**:
- **Key**: `FACEBOOK_APP_ID`
- **Value**: Ton App ID (ex: `123456789012345`)

**Variable 2**:
- **Key**: `FACEBOOK_APP_SECRET`
- **Value**: Ton App Secret (ex: `abc123def456...`)

3. Clique **"Save Changes"**

### 5.3 Redémarrer l'API

1. Render va automatiquement redémarrer ton service
2. Attends **2-3 minutes**
3. Vérifie que l'API fonctionne: https://zawai-app.onrender.com

✅ **Résultat**: Les clés sont configurées sur Render !

---

## 📋 ÉTAPE 6: TESTER LES LOGINS

### 6.1 Générer un nouvel APK

Pour que l'app utilise les nouvelles clés:

```powershell
cd C:\Users\Roqia\Downloads\Zawya-AI-Studio\Zawya-AI-Studio
.\generate-clean-apk.ps1
```

Attends 10-15 minutes pour le build.

### 6.2 Installer l'APK

1. Télécharge le nouvel APK depuis le lien Expo
2. Installe-le sur ton téléphone Android
3. Ouvre l'app ZawIA

### 6.3 Tester Facebook Login

1. Sur l'écran de connexion, clique **"Se connecter avec Facebook"**
2. Facebook va ouvrir une page de connexion
3. Entre ton email et mot de passe Facebook
4. Accepte les permissions
5. Tu devrais être redirigé vers l'app, connecté ✅

### 6.4 Tester Instagram Login

1. Sur l'écran de connexion, clique **"Se connecter avec Instagram"**
2. Instagram va ouvrir une page de connexion
3. Entre ton nom d'utilisateur et mot de passe Instagram
4. Accepte les permissions
5. Tu devrais être redirigé vers l'app, connecté ✅

---

## 🐛 DÉPANNAGE

### Erreur: "Invalid Key Hash"

**Problème**: Le Key Hash ne correspond pas.

**Solution**:
1. Régénère le Key Hash avec la commande keytool
2. Copie-le exactement (avec le `=` à la fin)
3. Ajoute-le dans Facebook Login Settings
4. Sauvegarde et réessaye

### Erreur: "App Not Set Up"

**Problème**: L'app Facebook n'est pas en mode "Live".

**Solution**:
1. Va dans Settings → Basic
2. En haut de la page, change le mode de **"Development"** à **"Live"**
3. Facebook peut demander une vérification (Privacy Policy, Terms of Service)

### Erreur: "Redirect URI Mismatch"

**Problème**: L'URI de redirection ne correspond pas.

**Solution**:
1. Vérifie que tu as bien ajouté `zawyaai://auth/facebook` dans Valid OAuth Redirect URIs
2. Vérifie que le scheme dans `app.json` est bien `"scheme": "zawyaai"`
3. Sauvegarde et réessaye

### Erreur: "Instagram Tester Not Approved"

**Problème**: Tu n'as pas accepté l'invitation Instagram.

**Solution**:
1. Ouvre Instagram sur ton téléphone
2. Va dans Paramètres → Apps et Sites Web
3. Cherche "ZawIA" dans les invitations
4. Accepte l'invitation
5. Réessaye le login

---

## 📝 CHECKLIST FINALE

Avant de passer à l'étape suivante, vérifie que:

- [ ] App Facebook créée
- [ ] Facebook Login configuré avec le bon package name
- [ ] Key Hash ajouté
- [ ] OAuth Redirect URI ajouté (`zawyaai://auth/facebook`)
- [ ] Instagram Basic Display configuré
- [ ] Instagram Tester ajouté et approuvé
- [ ] App ID et App Secret copiés
- [ ] Variables d'environnement ajoutées sur Render
- [ ] API redémarrée (attendre 2-3 minutes)
- [ ] Nouvel APK généré
- [ ] Facebook Login testé ✅
- [ ] Instagram Login testé ✅

---

## 🎉 FÉLICITATIONS !

Si tous les tests passent, tu as réussi à configurer Facebook et Instagram OAuth ! 🚀

Les utilisateurs peuvent maintenant se connecter avec leurs comptes sociaux.

---

## 📞 PROCHAINES ÉTAPES

Maintenant que l'authentification sociale fonctionne, tu peux:

1. **Soumettre TikTok pour révision** (voir `STATUS-COMPLET.md`)
2. **Configurer le paiement CCP** (BaridiMob ou Chargily)
3. **Implémenter la publication automatique** sur les réseaux sociaux

Besoin d'aide ? Demande-moi ! 😊
