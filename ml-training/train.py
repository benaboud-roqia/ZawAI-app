"""
train.py — Entraînement du CNN pour l'analyse qualité photo
Usage : python train.py --dataset ./dataset --epochs 20
"""

import os
import argparse
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from model import build_model
import matplotlib.pyplot as plt

# ─── Config ───────────────────────────────────────────────────────────────────
IMG_SIZE   = (224, 224)
BATCH_SIZE = 32
CLASSES    = ["good", "medium", "bad"]  # 0, 1, 2

# ─── Arguments ────────────────────────────────────────────────────────────────
parser = argparse.ArgumentParser()
parser.add_argument("--dataset", default="./dataset", help="Chemin vers le dataset")
parser.add_argument("--epochs",  default=20, type=int)
parser.add_argument("--output",  default="./photo_quality.h5")
args = parser.parse_args()

# ─── Data augmentation ────────────────────────────────────────────────────────
train_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    horizontal_flip=True,
    brightness_range=[0.7, 1.3],
    zoom_range=0.1,
    validation_split=0.2,
)

train_gen = train_datagen.flow_from_directory(
    args.dataset,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="sparse",
    subset="training",
    classes=CLASSES,
)

val_gen = train_datagen.flow_from_directory(
    args.dataset,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="sparse",
    subset="validation",
    classes=CLASSES,
)

print(f"Classes : {train_gen.class_indices}")
print(f"Train : {train_gen.samples} images | Val : {val_gen.samples} images")

# ─── Modèle ───────────────────────────────────────────────────────────────────
model = build_model(num_classes=len(CLASSES))

callbacks = [
    tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
    tf.keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=3),
    tf.keras.callbacks.ModelCheckpoint(
        "best_model.h5", save_best_only=True, monitor="val_accuracy"
    ),
]

# ─── Entraînement ─────────────────────────────────────────────────────────────
history = model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=args.epochs,
    callbacks=callbacks,
)

# ─── Sauvegarde ───────────────────────────────────────────────────────────────
model.save(args.output)
print(f"\n✅ Modèle sauvegardé : {args.output}")

# ─── Courbes ──────────────────────────────────────────────────────────────────
plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
plt.plot(history.history["accuracy"], label="Train")
plt.plot(history.history["val_accuracy"], label="Val")
plt.title("Accuracy")
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(history.history["loss"], label="Train")
plt.plot(history.history["val_loss"], label="Val")
plt.title("Loss")
plt.legend()

plt.savefig("training_curves.png")
print("📊 Courbes sauvegardées : training_curves.png")
