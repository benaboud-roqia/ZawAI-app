"""
export_tflite.py — Convertit le modèle .h5 en .tflite pour React Native
Usage : python export_tflite.py --model ./photo_quality.h5
"""

import argparse
import numpy as np
import tensorflow as tf

parser = argparse.ArgumentParser()
parser.add_argument("--model",  default="./photo_quality.h5")
parser.add_argument("--output", default="./photo_quality.tflite")
args = parser.parse_args()

# ─── Charger le modèle ────────────────────────────────────────────────────────
print(f"Chargement : {args.model}")
model = tf.keras.models.load_model(args.model)

# ─── Convertir en TFLite ──────────────────────────────────────────────────────
converter = tf.lite.TFLiteConverter.from_keras_model(model)

# Optimisation quantification INT8 (réduit la taille ~4x)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.float16]

tflite_model = converter.convert()

# ─── Sauvegarder ──────────────────────────────────────────────────────────────
with open(args.output, "wb") as f:
    f.write(tflite_model)

size_mb = len(tflite_model) / (1024 * 1024)
print(f"✅ TFLite sauvegardé : {args.output} ({size_mb:.2f} MB)")

# ─── Test rapide ──────────────────────────────────────────────────────────────
interpreter = tf.lite.Interpreter(model_content=tflite_model)
interpreter.allocate_tensors()

input_details  = interpreter.get_input_details()
output_details = interpreter.get_output_details()

print(f"\nInput  : {input_details[0]['shape']} {input_details[0]['dtype']}")
print(f"Output : {output_details[0]['shape']} {output_details[0]['dtype']}")

# Test avec une image aléatoire
test_input = np.random.rand(1, 224, 224, 3).astype(np.float32)
interpreter.set_tensor(input_details[0]["index"], test_input)
interpreter.invoke()
output = interpreter.get_tensor(output_details[0]["index"])
print(f"\nTest output : {output}")
print("Classes : good={:.2f}, medium={:.2f}, bad={:.2f}".format(*output[0]))
print("\n✅ Modèle TFLite prêt pour React Native !")
print(f"   Copie {args.output} dans :")
print("   artifacts/zawyaai/assets/models/photo_quality.tflite")
