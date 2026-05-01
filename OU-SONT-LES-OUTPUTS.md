# 📍 Où sont affichés les outputs de l'IA ?

## 🎯 RÉSUMÉ RAPIDE

**Actuellement** : L'interface affiche des **données statiques** (hardcodées)  
**Objectif** : Remplacer par des **données de l'API** en temps réel

---

## 📱 INTERFACE CAMÉRA - EMPLACEMENTS

### 1️⃣ **Barre de guidance IA** (flottante)

**Position** : Au-dessus du bouton caméra  
**Fichier** : `app/(tabs)/index.tsx` ligne 196-204

**Affiche actuellement** :
- 🟢/🟡/🔴 Icône de statut
- "Exposition correcte" (texte de guidance)
- "75%" (pourcentage de lumière)

**Données utilisées** :
```typescript
const aiInfo = {
  icon: "🟢",                    // ❌ Calculé localement
  text: "Exposition correcte",   // ❌ Calculé localement
  pct: "75%",                    // ❌ Calculé localement
};
```

**Devrait utiliser de l'API** :
```typescript
{
  lighting: "Good",              // ✅ De l'API
  guidance: ["Conseil 1", ...],  // ✅ De l'API
  lighting_pct: 75,              // ✅ De l'API
  quality_score: 82              // ✅ De l'API
}
```

---

### 2️⃣ **Pills en haut** (plateforme + type de plan)

**Position** : En haut à gauche  
**Fichier** : `app/(tabs)/index.tsx` ligne 224-234

**Affiche actuellement** :
- 📸 Instagram (plateforme)
- 🎬 "Plan poitrine" (type de plan)

**Données utilisées** :
```typescript
const data = OCCASION_DATA[occasion];  // ❌ Données statiques
data.shot = "Plan poitrine";           // ❌ Hardcodé
```

**Devrait utiliser de l'API** :
```typescript
{
  shot_type: "MS",                     // ✅ De l'API
  // Converti en "Plan moyen"
}
```

---

### 3️⃣ **Modal IA** (quand tu cliques sur le bouton "IA")

**Position** : Modal qui s'ouvre depuis le bas  
**Fichier** : `app/(tabs)/index.tsx` ligne 82-169

#### A. **4 cartes de paramètres**

**Affiche actuellement** :
```
┌─────────┬─────────┬─────────┬─────────┐
│ Angle   │ ISO     │ Vitesse │ WB      │
│ High    │ 200     │ 1/120   │ 6500K   │
└─────────┴─────────┴─────────┴─────────┘
```

**Données utilisées** :
```typescript
const data = OCCASION_DATA[occasion];  // ❌ Données statiques
{
  angle: "High",      // ❌ Hardcodé
  iso: "200",         // ❌ Hardcodé
  speed: "1/120",     // ❌ Hardcodé
  wb: "6500K"         // ❌ Hardcodé
}
```

**Devrait utiliser de l'API** :
```typescript
{
  angle: "High Angle",  // ✅ De l'API
  iso: "400",           // ✅ De l'API
  speed: "1/120",       // ✅ De l'API
  wb: "5600K"           // ✅ De l'API
}
```

#### B. **Conseils DOP**

**Affiche actuellement** :
```
💡 Tiens le téléphone légèrement au-dessus des yeux.
💡 Lumière naturelle face au sujet pour un rendu optimal.
```

**Données utilisées** :
```typescript
const data = OCCASION_DATA[occasion];  // ❌ Données statiques
{
  tip: "Tiens le téléphone...",        // ❌ Hardcodé
  tip2: "Lumière naturelle..."         // ❌ Hardcodé
}
```

**Devrait utiliser de l'API** :
```typescript
{
  guidance: [
    "Augmente légèrement l'exposition",  // ✅ De l'API
    "Sujet bien cadré"                   // ✅ De l'API
  ]
}
```

---

## ❌ OUTPUTS PAS ENCORE AFFICHÉS

Ces données de l'API ne sont **pas encore utilisées** dans l'interface :

### 1. `shot_type` (Type de plan)
**Valeur API** : `"MS"`, `"CU"`, `"LS"`, etc.  
**Où l'afficher** : Dans la pill en haut (remplacer `data.shot`)

### 2. `lighting` (Qualité d'éclairage)
**Valeur API** : `"Excellent"`, `"Good"`, `"Fair"`, `"Poor"`  
**Où l'afficher** : Nouvelle carte dans le modal IA

### 3. `quality_score` (Score de qualité global)
**Valeur API** : `82` (0-100)  
**Où l'afficher** : Cercle de progression dans le modal IA

---

## 🔧 PROBLÈME ACTUEL

### Données statiques hardcodées

```typescript
// Ligne 48-59 dans app/(tabs)/index.tsx
const OCCASION_DATA: Record<string, { ... }> = {
  selfie:   { shot: "Plan poitrine", angle: "High", iso: "200", ... },
  wedding:  { shot: "Plan moyen", angle: "Eye Level", iso: "400", ... },
  mukbang:  { shot: "Plan américain", angle: "High", iso: "320", ... },
  // ... 12 occasions hardcodées
};

// Ligne 177 : Utilise les données statiques
const data = OCCASION_DATA[occasion] ?? OCCASION_DATA.selfie;
```

**Problème** :
- ❌ Données ne changent jamais
- ❌ Pas d'analyse en temps réel
- ❌ Pas de conseils personnalisés
- ❌ Ne tient pas compte de la scène actuelle

---

## ✅ SOLUTION : Intégrer l'API

### Étape 1 : Créer le hook d'analyse

J'ai créé `lib/ai/cameraAI.ts` avec :
- ✅ `analyzeCameraFrame()` - Appelle l'API
- ✅ `getFallbackAnalysis()` - Données par défaut si API échoue
- ✅ `formatShotType()` - Convertit "MS" en "Plan moyen"
- ✅ `getLightingColor()` - Couleur selon qualité
- ✅ `getQualityScoreColor()` - Couleur selon score

### Étape 2 : Modifier l'interface caméra

**Dans `app/(tabs)/index.tsx`**, il faut :

1. **Importer le module** :
```typescript
import { analyzeCameraFrame, getFallbackAnalysis, formatShotType } from "@/lib/ai/cameraAI";
```

2. **Ajouter un state pour l'analyse** :
```typescript
const [aiAnalysis, setAiAnalysis] = useState(getFallbackAnalysis());
```

3. **Capturer et analyser des frames** :
```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    if (cameraRef.current) {
      // Capturer une frame
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.3, // Basse qualité pour la vitesse
        skipProcessing: true,
      });

      // Analyser avec l'API
      if (photo?.base64) {
        const analysis = await analyzeCameraFrame(photo.base64);
        if (analysis) {
          setAiAnalysis(analysis);
        }
      }
    }
  }, 2000); // Toutes les 2 secondes

  return () => clearInterval(interval);
}, []);
```

4. **Utiliser les données de l'API** :
```typescript
// Au lieu de :
const data = OCCASION_DATA[occasion];

// Utiliser :
const data = {
  angle: aiAnalysis.angle,
  iso: aiAnalysis.iso,
  speed: aiAnalysis.speed,
  wb: aiAnalysis.wb,
  shot: formatShotType(aiAnalysis.shot_type),
  tip: aiAnalysis.guidance[0] || "Analyse en cours...",
  tip2: aiAnalysis.guidance[1] || "Maintenez la position",
};

const aiInfo = {
  icon: aiAnalysis.quality_score >= 75 ? "🟢" : aiAnalysis.quality_score >= 50 ? "🟡" : "🔴",
  text: aiAnalysis.guidance[0] || "Analyse en cours...",
  color: getLightingColor(aiAnalysis.lighting),
  bg: getLightingColor(aiAnalysis.lighting) + "22",
  pct: `${aiAnalysis.lighting_pct}%`,
};
```

5. **Ajouter les nouveaux outputs** :

**Score de qualité** (dans le modal) :
```typescript
<View style={styles.scoreCircle}>
  <Text style={styles.scoreValue}>{aiAnalysis.quality_score}</Text>
  <Text style={styles.scoreLabel}>Score</Text>
</View>
```

**Qualité d'éclairage** (nouvelle carte) :
```typescript
<View style={styles.paramCard}>
  <Feather name="sun" size={14} color={PRIMARY} />
  <Text style={styles.paramValue}>{aiAnalysis.lighting}</Text>
  <Text style={styles.paramLabel}>Éclairage</Text>
</View>
```

---

## 📊 AVANT / APRÈS

### AVANT (données statiques)
```typescript
// Toujours les mêmes valeurs pour "selfie"
{
  angle: "High",
  iso: "200",
  speed: "1/120",
  wb: "6500K",
  shot: "Plan poitrine",
  tip: "Tiens le téléphone légèrement au-dessus des yeux.",
  tip2: "Lumière naturelle face au sujet..."
}
```

### APRÈS (données de l'API en temps réel)
```typescript
// Valeurs qui changent selon la scène
{
  angle: "Eye Level",                          // ✅ Analysé en temps réel
  iso: "400",                                  // ✅ Adapté à la lumière
  speed: "1/120",                              // ✅ Adapté au mouvement
  wb: "5600K",                                 // ✅ Adapté à la température
  shot_type: "MS",                             // ✅ Détecté automatiquement
  lighting: "Good",                            // ✅ Qualité évaluée
  guidance: [
    "Augmente légèrement l'exposition",        // ✅ Conseil personnalisé
    "Sujet bien cadré"                         // ✅ Basé sur la scène
  ],
  lighting_pct: 75,                            // ✅ Mesuré en temps réel
  quality_score: 82                            // ✅ Score global
}
```

---

## 🚀 PROCHAINES ÉTAPES

### 1. Tester l'API
```bash
curl -X POST https://zawai-app.onrender.com/api/analyze/frame \
  -H "Content-Type: application/json" \
  -d '{"imageBase64":"..."}'
```

### 2. Intégrer dans l'app
Je peux modifier `app/(tabs)/index.tsx` pour utiliser l'API au lieu des données statiques.

### 3. Ajouter les nouveaux outputs
- Score de qualité (cercle de progression)
- Qualité d'éclairage (nouvelle carte)
- Type de plan dynamique (pill en haut)

---

## ✅ CONCLUSION

**Actuellement** :
- ✅ Interface complète et belle
- ❌ Données statiques (hardcodées)
- ❌ Pas d'analyse en temps réel

**Après intégration** :
- ✅ Interface complète et belle
- ✅ Données de l'API en temps réel
- ✅ Analyse intelligente avec Claude
- ✅ Conseils personnalisés

**Tu veux que je modifie `app/(tabs)/index.tsx` pour intégrer l'API ?** 🚀
