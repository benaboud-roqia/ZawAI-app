# 💳 Guide Complet: Intégration Paiement CCP Algérien

**Pour**: ZawIA App  
**Temps estimé**: 3-7 jours (attente approbation)  
**Options**: BaridiMob ou Chargily Pay

---

## 🎯 OBJECTIF

Permettre aux utilisateurs algériens de payer avec:
- 💳 CCP (Compte Chèque Postal)
- 🏦 Carte Edahabia
- 💰 Carte bancaire algérienne

---

## 🤔 QUELLE OPTION CHOISIR ?

### Option A: BaridiMob API ⭐ (Recommandé)

**Avantages**:
- ✅ Service officiel d'Algérie Poste
- ✅ Très populaire en Algérie (millions d'utilisateurs)
- ✅ Frais bas (~2%)
- ✅ Support en arabe/français
- ✅ Confiance des utilisateurs

**Inconvénients**:
- ⚠️ Processus d'approbation plus long (5-7 jours)
- ⚠️ Documentation limitée
- ⚠️ Nécessite registre de commerce (pour entreprises)

**Frais**:
- 2% par transaction
- Pas de frais mensuels
- Retrait minimum: 5,000 DA

---

### Option B: Chargily Pay 🚀 (Alternative moderne)

**Avantages**:
- ✅ Interface moderne et facile
- ✅ Documentation complète
- ✅ API bien documentée
- ✅ Dashboard en temps réel
- ✅ Support réactif
- ✅ Accepte CCP + Edahabia + cartes internationales

**Inconvénients**:
- ⚠️ Frais légèrement plus élevés (~2.5%)
- ⚠️ Moins connu que BaridiMob

**Frais**:
- 2.5% par transaction
- Pas de frais mensuels
- Retrait minimum: 10,000 DA

---

## 📊 COMPARAISON

| Critère | BaridiMob | Chargily Pay |
|---------|-----------|--------------|
| **Popularité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Frais** | 2% | 2.5% |
| **Approbation** | 5-7 jours | 2-3 jours |
| **Documentation** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Support** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Facilité d'intégration** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Recommandation**: 
- Si tu as un registre de commerce → **BaridiMob**
- Si tu veux démarrer rapidement → **Chargily Pay**

---

## 📋 OPTION A: BARIDIMOB

### Étape 1: Créer un compte marchand

1. Va sur: **https://baridimob.dz/**
2. Clique sur **"Espace Marchand"**
3. Clique sur **"Créer un compte"**

### Étape 2: Remplir le formulaire

| Champ | Valeur |
|-------|--------|
| **Type de compte** | Professionnel |
| **Nom de l'entreprise** | ZawIA |
| **Secteur d'activité** | Services numériques / Applications mobiles |
| **Numéro CCP** | Ton numéro CCP |
| **Email** | Ton email professionnel |
| **Téléphone** | Ton numéro de téléphone |

### Étape 3: Documents requis

Prépare ces documents (scan ou photo):

**Pour entreprise**:
- ✅ Registre de commerce
- ✅ Carte d'identification fiscale (NIF)
- ✅ Pièce d'identité du gérant
- ✅ RIB ou relevé CCP

**Pour auto-entrepreneur**:
- ✅ Registre de commerce (auto-entrepreneur)
- ✅ Pièce d'identité
- ✅ RIB ou relevé CCP

**Pour particulier** (si accepté):
- ✅ Pièce d'identité
- ✅ Relevé CCP
- ✅ Justificatif de domicile

### Étape 4: Soumettre la demande

1. Upload les documents
2. Accepte les conditions d'utilisation
3. Clique sur **"Soumettre"**
4. Attends l'email de confirmation

### Étape 5: Attendre l'approbation

- ⏳ **Délai**: 5-7 jours ouvrables
- 📧 Tu recevras un email avec:
  - Confirmation d'approbation
  - Identifiants de connexion
  - Lien vers le dashboard marchand

### Étape 6: Obtenir les clés API

1. Connecte-toi au dashboard marchand
2. Va dans **"Paramètres"** → **"API"**
3. Copie:
   - **Merchant ID**: (ex: `MERCH123456`)
   - **API Key**: (ex: `sk_live_abc123def456...`)
   - **API Secret**: (ex: `sec_abc123def456...`)

### Étape 7: Tester en mode sandbox

1. Active le **mode test** dans le dashboard
2. Utilise les clés de test pour intégrer
3. Teste des paiements fictifs
4. Vérifie que tout fonctionne

### Étape 8: Passer en production

1. Désactive le mode test
2. Utilise les clés de production
3. Fais un premier paiement réel de test
4. Vérifie que l'argent arrive sur ton CCP

✅ **Résultat**: BaridiMob est configuré !

---

## 📋 OPTION B: CHARGILY PAY (Recommandé pour démarrer)

### Étape 1: Créer un compte

1. Va sur: **https://chargily.com/**
2. Clique sur **"S'inscrire"**
3. Choisis **"Compte Marchand"**

### Étape 2: Remplir le formulaire

| Champ | Valeur |
|-------|--------|
| **Nom complet** | Ton nom |
| **Email** | Ton email |
| **Téléphone** | Ton numéro (ex: +213 XXX XXX XXX) |
| **Mot de passe** | Mot de passe sécurisé |

### Étape 3: Vérifier ton email

1. Ouvre l'email de Chargily
2. Clique sur le lien de vérification
3. Connecte-toi à ton compte

### Étape 4: Compléter ton profil

1. Va dans **"Paramètres"** → **"Profil"**
2. Remplis:
   - Nom de l'entreprise: **ZawIA**
   - Secteur: **Applications mobiles**
   - Site web: (si tu en as un)
   - Description: **Application de création de contenu vidéo avec IA**

### Étape 5: Ajouter un compte de retrait

1. Va dans **"Paramètres"** → **"Comptes bancaires"**
2. Clique sur **"Ajouter un compte"**
3. Choisis **"CCP"** ou **"Compte bancaire"**
4. Entre:
   - Numéro de compte (CCP ou RIB)
   - Nom du titulaire
   - Clé RIP (pour CCP)

### Étape 6: Vérifier ton compte

Chargily peut demander:
- ✅ Photo de ta pièce d'identité
- ✅ Selfie avec ta pièce d'identité
- ✅ Justificatif de compte (relevé CCP/bancaire)

Upload les documents et attends la vérification (24-48h).

### Étape 7: Obtenir les clés API

1. Va dans **"Développeurs"** → **"Clés API"**
2. Tu verras:

**Mode Test**:
- **Public Key**: `test_pk_abc123...`
- **Secret Key**: `test_sk_def456...`

**Mode Production**:
- **Public Key**: `live_pk_ghi789...`
- **Secret Key**: `live_sk_jkl012...`

3. Copie les clés de test pour commencer

### Étape 8: Tester l'intégration

1. Utilise les clés de test
2. Crée un paiement de test
3. Utilise les numéros de carte de test fournis par Chargily
4. Vérifie que le paiement fonctionne

### Étape 9: Passer en production

1. Une fois les tests OK, utilise les clés de production
2. Fais un premier paiement réel de 100 DA
3. Vérifie que l'argent arrive sur ton compte

✅ **Résultat**: Chargily Pay est configuré !

---

## 💻 INTÉGRATION DANS L'APP

### Étape 1: Ajouter les clés à Render

1. Va sur https://dashboard.render.com/
2. Ouvre ton service **"zawai-app"**
3. Va dans **"Environment"**
4. Ajoute les variables:

**Pour BaridiMob**:
```
BARIDIMOB_MERCHANT_ID=MERCH123456
BARIDIMOB_API_KEY=sk_live_abc123...
BARIDIMOB_API_SECRET=sec_abc123...
```

**Pour Chargily**:
```
CHARGILY_PUBLIC_KEY=live_pk_abc123...
CHARGILY_SECRET_KEY=live_sk_def456...
```

5. Clique **"Save Changes"**

### Étape 2: Dis-moi quelle option tu as choisie

Une fois que tu as:
- ✅ Créé ton compte marchand
- ✅ Obtenu tes clés API
- ✅ Ajouté les clés à Render

**Dis-moi**: "J'ai choisi [BaridiMob/Chargily] et j'ai ajouté les clés"

Je vais alors:
1. Créer les routes API pour le paiement
2. Créer l'interface de paiement dans l'app
3. Implémenter le flux de paiement complet
4. Tester avec toi

**Temps d'implémentation**: 2-3 heures après que tu aies les clés

---

## 💰 PLANS DE PRIX SUGGÉRÉS

Pour ZawIA, je suggère ces plans:

### Plan Gratuit
- ✅ 10 analyses IA par jour
- ✅ Fonctionnalités de base
- ✅ Publicités
- **Prix**: Gratuit

### Plan Pro
- ✅ Analyses IA illimitées
- ✅ Export PDF
- ✅ Pas de publicités
- ✅ Support prioritaire
- **Prix**: 500 DA/mois (~$3.50)

### Plan Studio
- ✅ Tout du Plan Pro
- ✅ Collaboration en équipe
- ✅ Statistiques avancées
- ✅ Publication automatique
- ✅ Support 24/7
- **Prix**: 1,500 DA/mois (~$10)

**Paiement unique possible**:
- Plan Pro: 5,000 DA/an (économie de 1,000 DA)
- Plan Studio: 15,000 DA/an (économie de 3,000 DA)

---

## 🔒 SÉCURITÉ

### Bonnes pratiques

1. **Ne stocke JAMAIS les clés API dans le code**
   - ✅ Utilise les variables d'environnement Render
   - ❌ Ne les mets pas dans GitHub

2. **Vérifie toujours les paiements côté serveur**
   - ✅ Vérifie le webhook de confirmation
   - ❌ Ne fais pas confiance au client

3. **Utilise HTTPS partout**
   - ✅ Render utilise HTTPS par défaut
   - ✅ L'app utilise HTTPS pour l'API

4. **Logs des transactions**
   - ✅ Enregistre chaque paiement dans la base de données
   - ✅ Garde un historique pour 2 ans minimum

---

## 🐛 DÉPANNAGE

### Erreur: "Compte non vérifié"

**Solution**: Attends la vérification de ton compte (24-48h pour Chargily, 5-7 jours pour BaridiMob)

### Erreur: "Clé API invalide"

**Solution**: 
1. Vérifie que tu as copié la clé complète
2. Vérifie que tu utilises la bonne clé (test vs production)
3. Régénère la clé si nécessaire

### Erreur: "Paiement refusé"

**Solution**:
1. Vérifie que le compte CCP a assez de fonds
2. Vérifie que la carte Edahabia est activée
3. Contacte le support du service de paiement

### Erreur: "Webhook non reçu"

**Solution**:
1. Vérifie que l'URL du webhook est correcte
2. Vérifie que Render n'est pas en veille (plan gratuit)
3. Teste le webhook manuellement depuis le dashboard

---

## 📝 CHECKLIST

Avant de passer à l'intégration:

- [ ] Option choisie (BaridiMob ou Chargily)
- [ ] Compte marchand créé
- [ ] Email vérifié
- [ ] Profil complété
- [ ] Documents uploadés (si nécessaire)
- [ ] Compte vérifié
- [ ] Compte de retrait ajouté (CCP/RIB)
- [ ] Clés API obtenues
- [ ] Clés API testées en mode test
- [ ] Clés API ajoutées à Render
- [ ] Prêt pour l'intégration ✅

---

## 🎉 PROCHAINES ÉTAPES

Une fois que tu as tes clés API, dis-moi et je vais:

1. Créer les routes API de paiement
2. Créer l'écran de sélection de plan
3. Créer l'écran de paiement
4. Implémenter le webhook de confirmation
5. Tester le flux complet avec toi

**Temps d'implémentation**: 2-3 heures

---

## 📞 BESOIN D'AIDE ?

Si tu as des questions sur:
- Création du compte marchand
- Documents requis
- Obtention des clés API
- Problèmes de vérification

Demande-moi et je t'aiderai ! 💪
