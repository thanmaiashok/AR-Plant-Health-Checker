import tensorflow as tf
from tensorflow.keras import layers, models
from preprocess_data import load_data
import json
import os
import matplotlib.pyplot as plt
import pandas as pd

def train():
    train_ds, val_ds, class_names = load_data()

    # Save class names for inference
    with open('../models/class_indices.json', 'w') as f:
        json.dump(class_names, f)

    # Data Augmentation Layer
    data_augmentation = tf.keras.Sequential([
        layers.RandomFlip("horizontal_and_vertical"),
        layers.RandomRotation(0.2),
        layers.RandomZoom(0.2),
        layers.RandomContrast(0.2),
    ])

    # Check if model already exists to continue training
    model_path = '../models/plant_disease_model.keras'
    if os.path.exists(model_path):
        print(f"Loading existing model from {model_path}...")
        model = models.load_model(model_path)
        # We assume if it exists, it might already be partially trained.
        # But for the requested '15 epochs' experiment, we could also just refine the strategy.
    else:
        # Base Model: DenseNet121
        base_model = tf.keras.applications.DenseNet121(
            input_shape=(224, 224, 3),
            include_top=False,
            weights='imagenet'
        )
        base_model.trainable = False  # Freeze the base model

        # Model Architecture
        inputs = layers.Input(shape=(224, 224, 3))
        x = data_augmentation(inputs)
        x = tf.keras.applications.densenet.preprocess_input(x)
        x = base_model(x, training=False)
        x = layers.GlobalAveragePooling2D()(x)
        x = layers.Dropout(0.3)(x) # Slightly higher dropout for better generalization
        outputs = layers.Dense(len(class_names), activation='softmax')(x)
        model = models.Model(inputs, outputs)

    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    # Callbacks
    csv_logger = tf.keras.callbacks.CSVLogger('training_history.csv', append=True)
    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(model_path, save_best_only=True),
        tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(factor=0.2, patience=2, min_lr=1e-7),
        csv_logger
    ]

    # Training Phase 1: Train the head only (shorter)
    print("Starting Phase 1: Training the head...")
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=3,
        callbacks=callbacks
    )

    # Training Phase 2: Fine-tuning (longer and unfreeze more)
    print("Starting Phase 2: Fine-tuning (unfreeze more layers)...")
    # Recover base model if we loaded the full model
    if 'densenet121' in [l.name for l in model.layers]:
        base_model = model.get_layer('densenet121')
    
    base_model.trainable = True
    # Freeze only the first 100 layers (out of ~400+ in the graph)
    # This allows more adaptation than before
    for layer in base_model.layers[:100]:
        layer.trainable = False

    # Re-compile with a lower learning rate for fine-tuning
    model.compile(
        optimizer=tf.keras.optimizers.Adam(2e-5), # Slightly higher than 1e-5 to speed up
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    model.fit(
        train_ds,
        validation_data=val_ds,
        initial_epoch=3,
        epochs=15,
        callbacks=callbacks
    )

    print(f"Training complete. Model saved to {model_path}")

    # Plotting history
    plot_history()

def plot_history():
    history_file = 'training_history.csv'
    if not os.path.exists(history_file):
        print(f"History file {history_file} not found. Cannot plot graphs.")
        return
    
    df = pd.read_csv(history_file)
    
    # Plot Accuracy
    plt.figure(figsize=(10, 6))
    if 'accuracy' in df.columns:
        plt.plot(df['accuracy'], label='Training Accuracy')
    if 'val_accuracy' in df.columns:
        plt.plot(df['val_accuracy'], label='Validation Accuracy')
    plt.title('Model Accuracy History')
    plt.ylabel('Accuracy')
    plt.xlabel('Epoch')
    plt.legend()
    plt.grid(True)
    plt.savefig('accuracy_history.png', dpi=300)
    print("Saved accuracy_history.png")
    
    # Plot Loss
    plt.figure(figsize=(10, 6))
    if 'loss' in df.columns:
        plt.plot(df['loss'], label='Training Loss')
    if 'val_loss' in df.columns:
        plt.plot(df['val_loss'], label='Validation Loss')
    plt.title('Model Loss History')
    plt.ylabel('Loss')
    plt.xlabel('Epoch')
    plt.legend()
    plt.grid(True)
    plt.savefig('loss_history.png', dpi=300)
    print("Saved loss_history.png")

if __name__ == "__main__":
    train()
