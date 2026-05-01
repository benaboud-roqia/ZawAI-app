"""
prepare_dataset.py
Convertit les datasets Kaggle au format ZawIA
Usage : python prepare_dataset.py --input ./raw_dataset --output ./dataset
"""

import os
import csv
import argparse
import shutil
import random
from PIL import Image
import numpy as np

parser = argparse.ArgumentParser()
parser.add_argument("--input",  default="./raw_dataset")
parser.add_argument("--output", default="./dataset")
parser.add_argument("--size",   default=224, type=int)
args = parser.parse_args()

os.makedirs(f"{args.output}/images", exist_ok=True)

# ─── Règles pour générer les labels automatiquement ───────────────────────────

def estimate_lighting(img_array):
    """Estime l'exposition via la luminosité moyenne"""
    gray = np.mean(img_array)
    if gray < 60:   return "dark",    int(gray / 255 * 100)
    if gray > 200:  return "bright",  int(gray / 255 * 100)
    if gray > 230:  return "overexposed", 99
    return "good", int(gray / 255 * 100)

def estimate_blur(img_array):
    """Détecte le flou via la variance du Laplacien"""
    import cv2
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    if lap_var < 50:   return "blurry"
    if lap_var < 200:  return "medium"
    return "sharp"

def estimate_composition(img_array):
    """Estime la composition via l'analyse des bords"""
    h, w = img_array.shape[:2]
    # Vérifie si le sujet est centré ou sur les tiers
    center_region = img_array[h//3:2*h//3, w//3:2*w//3]
    edge_region   = np.concatenate([
        img_array[:h//3].flatten(),
        img_array[2*h//3:].flatten()
    ])
    center_brightness = np.mean(center_region)
    edge_brightness   = np.mean(edge_region)
    ratio = center_brightness / (edge_brightness + 1e-6)
    if ratio > 1.3:  return "good"
    if ratio > 0.9:  return "medium"
    return "bad"

def assign_angle(img_array):
    """Assigne un angle basé sur les proportions"""
    h, w = img_array.shape[:2]
    ratio = h / w
    if ratio > 1.5:  return "Eye Level"
    if ratio < 0.7:  return "High"
    return "Eye Level"

def assign_shot_type(img_array):
    """Assigne le type de plan basé sur la composition"""
    h, w = img_array.shape[:2]
    ratio = h / w
    if ratio > 1.8:  return "Plan poitrine"
    if ratio > 1.3:  return "Plan moyen"
    if ratio < 0.8:  return "Plan large"
    return "Plan moyen"

def compute_quality_score(lighting, blur, composition):
    """Score global pondéré"""
    l_score = {"dark": 30, "good": 90, "bright": 65, "overexposed": 40}[lighting]
    b_score = {"blurry": 20, "medium": 65, "sharp": 95}[blur]
    c_score = {"bad": 30, "medium": 65, "good": 90}[composition]
    return int(l_score * 0.35 + b_score * 0.35 + c_score * 0.30)

def assign_iso(lighting):
    return {"dark": 1600, "good": 400, "bright": 100, "overexposed": 50}[lighting]

def assign_speed(lighting):
    return {"dark": "1/30", "good": "1/120", "bright": "1/500", "overexposed": "1/1000"}[lighting]

def assign_wb(lighting):
    return {"dark": "3200K", "good": "5600K", "bright": "6500K", "overexposed": "6500K"}[lighting]

def assign_guidance(quality_score, lighting, blur):
    if blur == "blurry":
        return "bad", "Nettoie la lentille ou stabilise le téléphone"
    if lighting == "dark":
        return "bad", "Rapproche-toi de la lumière 💡"
    if lighting == "overexposed":
        return "medium", "Trop lumineux — cherche de l'ombre"
    if quality_score >= 80:
        return "good", "L'éclairage est excellent 👌"
    if quality_score >= 60:
        return "medium", "Remonte légèrement la caméra"
    return "bad", "Améliore l'éclairage et la stabilité"

# ─── Traitement des images ────────────────────────────────────────────────────

rows = []
images = [f for f in os.listdir(args.input) if f.lower().endswith((".jpg", ".jpeg", ".png"))]
random.shuffle(images)

print(f"Traitement de {len(images)} images...")

for i, fname in enumerate(images):
    try:
        img_path = os.path.join(args.input, fname)
        img = Image.open(img_path).convert("RGB")
        img = img.resize((args.size, args.size))
        img_array = np.array(img)

        lighting, lighting_pct = estimate_lighting(img_array)
        blur        = estimate_blur(img_array)
        composition = estimate_composition(img_array)
        angle       = assign_angle(img_array)
        shot_type   = assign_shot_type(img_array)
        iso         = assign_iso(lighting)
        speed       = assign_speed(lighting)
        wb          = assign_wb(lighting)
        score       = compute_quality_score(lighting, blur, composition)
        g_state, g_text = assign_guidance(score, lighting, blur)

        # Sauvegarder l'image redimensionnée
        out_name = f"img_{i:05d}.jpg"
        img.save(os.path.join(args.output, "images", out_name), quality=90)

        rows.append({
            "filename":       out_name,
            "angle":          angle,
            "iso":            iso,
            "speed":          speed,
            "wb":             wb,
            "shot_type":      shot_type,
            "lighting":       lighting,
            "lighting_pct":   lighting_pct,
            "blur":           blur,
            "composition":    composition,
            "quality_score":  score,
            "guidance_state": g_state,
            "guidance_text":  g_text,
        })

        if (i + 1) % 100 == 0:
            print(f"  {i+1}/{len(images)} images traitées")

    except Exception as e:
        print(f"  ⚠️ Erreur {fname}: {e}")

# ─── Sauvegarder le CSV ───────────────────────────────────────────────────────
csv_path = os.path.join(args.output, "labels.csv")
with open(csv_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)

print(f"\n✅ Dataset prêt !")
print(f"   Images : {len(rows)}")
print(f"   CSV    : {csv_path}")
print(f"\nDistribution :")
for key in ["lighting", "blur", "composition", "guidance_state"]:
    from collections import Counter
    counts = Counter(r[key] for r in rows)
    print(f"  {key}: {dict(counts)}")
