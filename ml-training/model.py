"""
model.py — Architecture CNN pour l'analyse qualité photo
Classes : good (0), medium (1), bad (2)
Input : image 224x224x3
"""

import tensorflow as tf
from tensorflow.keras import layers, models

def build_model(num_classes: int = 3) -> tf.keras.Model:
    """
    CNN léger basé sur MobileNetV2 (transfer learning)
    Optimisé pour conversion TFLite mobile
    """
    # Base pré-entraînée sur ImageNet
    base = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights="imagenet",
    )
    base.trainable = False  # Geler les couches de base

    model = models.Sequential([
        base,
        layers.GlobalAveragePooling2D(),
        layers.Dense(128, activation="relu"),
        layers.Dropout(0.3),
        layers.Dense(64, activation="relu"),
        layers.Dense(num_classes, activation="softmax"),
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    return model


def build_multi_output_model() -> tf.keras.Model:
    """
    Modèle multi-sorties pour analyser plusieurs critères simultanément :
    - quality_score : score global 0-100
    - blur_score    : score netteté 0-100
    - exposure      : dark/good/bright (3 classes)
    - composition   : bad/medium/good (3 classes)
    """
    inputs = tf.keras.Input(shape=(224, 224, 3))

    base = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights="imagenet",
    )
    base.trainable = False

    x = base(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.3)(x)

    # Sortie 1 : score global (régression)
    quality = layers.Dense(128, activation="relu")(x)
    quality = layers.Dense(1, activation="sigmoid", name="quality_score")(quality)

    # Sortie 2 : exposition (classification)
    exposure = layers.Dense(64, activation="relu")(x)
    exposure = layers.Dense(3, activation="softmax", name="exposure")(exposure)

    # Sortie 3 : composition (classification)
    composition = layers.Dense(64, activation="relu")(x)
    composition = layers.Dense(3, activation="softmax", name="composition")(composition)

    model = tf.keras.Model(
        inputs=inputs,
        outputs=[quality, exposure, composition]
    )

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss={
            "quality_score": "mse",
            "exposure": "sparse_categorical_crossentropy",
            "composition": "sparse_categorical_crossentropy",
        },
        metrics={
            "quality_score": "mae",
            "exposure": "accuracy",
            "composition": "accuracy",
        }
    )

    return model


if __name__ == "__main__":
    model = build_model()
    model.summary()
