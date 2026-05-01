# 🚀 Configuration Chargily Pay - Guide Rapide

**Temps estimé**: 30 minutes  
**Prérequis**: Compte CCP ou bancaire algérien

---

## ✅ CE QUI EST DÉJÀ FAIT

J'ai implémenté tout le code nécessaire :

### Backend (API)
- ✅ Route `/api/payment/create-checkout` - Créer une session de paiement
- ✅ Route `/api/payment/webhook` - Recevoir les confirmations de paiement
- ✅ Route `/api/payment/verify/:checkout_id` - Vérifier un paiement
- ✅ Route `/api/payment/plans` - Liste des plans disponibles

### Frontend (App)
- ✅ Écran `/pricing` - Sélection de plan (Gratuit, Pro, Studio)
- ✅ Écran `/payment/success` - Confirmation de paiement réussi
- ✅ Écran `/payment/failure` - Gestion des échecs de paiement
- ✅ Intégration avec `expo-web-browser` pour ouvrir Chargily

### Plans configurés
- **Gratuit**: 0 DA (10 analyses/jour, publicités)
- **Pro**: 500 DA/mois ou 5,000 DA/an (illimité, sans pub)
- **Studio**: 1,500 DA/mois ou 15,000 DA/an (tout + collaboration)

---

## 📋 CE QUE TU DOIS FAIRE

### Étape 1: Créer ton compte Chargily (10 minutes)

1. Va sur **https://chargily.com/**
2. Clique sur **"S'inscrire"**
3. Choisis **"Compte Marchand"**
4. Remplis:
   - Nom complet
   - Email
   - Téléphone: +213 XXX XXX XXX
   - Mot de passe

5. Vérifie ton email (clique sur le lien reçu)

### Étape 2: Compléter ton profil (5 minutes)

1. Connecte-toi à https://chargily.com/
2. Va dans **"Paramètres"** → **"Profil"**
3. Remplis:
   - **Nom de l'entreprise**: ZawIA
   - **Secteur**: Applications mobiles
   - **Description**: Application de création de contenu vidéo avec IA

### Étape 3: Ajouter ton compte de retrait (5 minutes)

1. Va dans **"Paramètres"** → **"Comptes bancaires"**
2. Clique sur **"Ajouter un compte"**
3. Choisis **"CCP"** ou **"Compte bancaire"**
4. Entre:
   - Numéro de compte (CCP ou RIB)
   - Nom du titulaire
   - Clé RIP (pour CCP)

### Étape 4: Vérifier ton compte (24-48h)

Chargily peut demander:
- Photo de ta pièce d'identité
- Selfie avec ta pièce d'identité
- Justificatif de compte (relevé CCP/bancaire)

Upload les documents et attends la vérification.

### Étape 5: Obtenir les clés API (2 minutes)

1. Va dans **"Développeurs"** → **"Clés API"**
2. Tu verras:

**Mode Test** (pour tester d'abord):
```
Public Key: test_pk_abc123...
Secret Key: test_sk_def456...
```

**Mode Production** (pour les vrais paiements):
```
Public Key: live_pk_ghi789...
Secret Key: live_sk_jkl012...
```

3. **Copie les clés de test** pour commencer

### Étape 6: Ajouter les clés à Render (3 minutes)

1. Va sur **https://dashboard.render.com/**
2. Ouvre ton service **"zawai-app"**
3. Va dans **"Environment"**
4. Clique sur **"Add Environment Variable"**

Ajoute ces 3 variables:

```
CHARGILY_PUBLIC_KEY=test_pk_abc123...
CHARGILY_SECRET_KEY=test_sk_def456...
CHARGILY_WEBHOOK_SECRET=zawia_webhook_secret_2026
```

5. Clique **"Save Changes"**
6. Attends 2-3 minutes que l'API redémarre

### Étape 7: Tester le paiement (5 minutes)

1. Génère un nouvel APK (si nécessaire):
   ```powershell
   cd C:\Users\Roqia\Downloads\Zawya-AI-Studio\Zawya-AI-Studio
   .\generate-clean-apk.ps1
   ```

2. Installe l'APK sur ton téléphone

3. Ouvre l'app ZawIA

4. Va dans **Paramètres** → **"Choisir un plan"** (ou ajoute un bouton dans l'app)

5. Choisis **Plan Pro** → **Mensuel**

6. Clique sur **"Choisir ce plan"**

7. Une page Chargily s'ouvre dans le navigateur

8. Utilise les **numéros de carte de test** fournis par Chargily:
   - Carte: `4242 4242 4242 4242`
   - Date: `12/25`
   - CVV: `123`

9. Confirme le paiement

10. Tu devrais être redirigé vers l'écran de succès ✅

### Étape 8: Passer en production (2 minutes)

Une fois les tests OK:

1. Retourne sur Render
2. Remplace les clés de test par les clés de production:
   ```
   CHARGILY_PUBLIC_KEY=live_pk_ghi789...
   CHARGILY_SECRET_KEY=live_sk_jkl012...
   ```

3. Sauvegarde

4. Fais un premier paiement réel de 100 DA pour tester

5. Vérifie que l'argent arrive sur ton compte CCP

---

## 🎯 AJOUTER UN BOUTON "UPGRADE" DANS L'APP

Pour que les utilisateurs puissent accéder à l'écran de pricing, ajoute un bouton dans les paramètres.

Je vais le faire pour toi :

### Dans `app/(tabs)/settings.tsx` (ou créer si n'existe pas)

Ajoute un bouton "Choisir un plan" qui redirige vers `/pricing`.

---

## 🔍 VÉRIFIER QUE TOUT FONCTIONNE

### Test 1: API fonctionne
```bash
curl https://zawai-app.onrender.com/api/payment/plans
```

Tu devrais voir la liste des plans en JSON.

### Test 2: Créer un checkout (avec Postman ou curl)
```bash
curl -X POST https://zawai-app.onrender.com/api/payment/create-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "pro",
    "period": "monthly",
    "user_id": "test123",
    "user_email": "test@example.com"
  }'
```

Tu devrais recevoir un `checkout_url`.

### Test 3: Webhook fonctionne

Chargily enverra automatiquement des webhooks à:
```
https://zawai-app.onrender.com/api/payment/webhook
```

Tu peux voir les logs dans Render → Logs.

---

## 🐛 DÉPANNAGE

### Erreur: "Invalid API key"

**Solution**: Vérifie que tu as bien copié la clé complète (commence par `test_sk_` ou `live_sk_`)

### Erreur: "Webhook signature invalid"

**Solution**: Vérifie que `CHARGILY_WEBHOOK_SECRET` est bien configuré sur Render

### Erreur: "Checkout creation failed"

**Solution**: 
1. Vérifie que ton compte Chargily est vérifié
2. Vérifie que tu utilises les bonnes clés (test vs production)
3. Regarde les logs Render pour plus de détails

### L'app ne redirige pas après paiement

**Solution**: Vérifie que les URLs de redirection sont bien configurées:
- Success: `zawyaai://payment/success`
- Failure: `zawyaai://payment/failure`

---

## 📊 STATISTIQUES ET SUIVI

### Dashboard Chargily

Tu peux voir en temps réel:
- 💰 Revenus du jour/mois
- 📈 Nombre de transactions
- ✅ Taux de réussite
- 👥 Nouveaux abonnés

### Logs Render

Pour voir les webhooks reçus:
1. Va sur Render → zawai-app
2. Clique sur "Logs"
3. Cherche `[Webhook]`

---

## 💡 PROCHAINES AMÉLIORATIONS

Une fois que le paiement fonctionne, on peut ajouter:

1. **Base de données** pour stocker les abonnements
   - Table `subscriptions` avec user_id, plan, status, expires_at
   - Vérifier le plan avant chaque requête IA

2. **Gestion des abonnements**
   - Annuler un abonnement
   - Changer de plan
   - Historique des paiements

3. **Notifications**
   - Email de confirmation
   - Rappel avant expiration
   - Notification push

4. **Analytics**
   - Revenus par plan
   - Taux de conversion
   - Churn rate

---

## ✅ CHECKLIST FINALE

Avant de lancer en production:

- [ ] Compte Chargily créé
- [ ] Email vérifié
- [ ] Profil complété
- [ ] Compte de retrait ajouté (CCP/RIB)
- [ ] Compte vérifié (24-48h)
- [ ] Clés API de test obtenues
- [ ] Clés ajoutées à Render
- [ ] API redémarrée (2-3 min)
- [ ] Test de paiement réussi avec carte de test
- [ ] Clés de production obtenues
- [ ] Clés de production ajoutées à Render
- [ ] Premier paiement réel testé (100 DA)
- [ ] Argent reçu sur CCP ✅

---

## 📞 BESOIN D'AIDE ?

Si tu rencontres un problème:

1. **Vérifie les logs Render**: https://dashboard.render.com/ → zawai-app → Logs
2. **Vérifie le dashboard Chargily**: https://chargily.com/dashboard
3. **Contacte le support Chargily**: support@chargily.com
4. **Demande-moi** et je t'aiderai ! 😊

---

## 🎉 FÉLICITATIONS !

Une fois tout configuré, tes utilisateurs pourront:
- ✅ Choisir un plan (Gratuit, Pro, Studio)
- ✅ Payer avec CCP, Edahabia ou carte bancaire
- ✅ Être redirigés automatiquement après paiement
- ✅ Profiter des fonctionnalités premium

**Temps total**: ~1 heure (+ 24-48h de vérification)

Bonne chance ! 🚀
