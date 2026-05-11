import os
import json
import tensorflow as tf
import numpy as np
from utils.image_utils import preprocess_image

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/plant_disease_model.keras")
CLASS_INDICES_PATH = os.path.join(os.path.dirname(__file__), "../models/class_indices.json")

# Lazy loading of model to avoid issues on import
model = None
class_names = None

def load_resources():
    global model, class_names
    if model is None:
        if os.path.exists(MODEL_PATH):
            model = tf.keras.models.load_model(MODEL_PATH)
        else:
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
    
    if class_names is None:
        if os.path.exists(CLASS_INDICES_PATH):
            with open(CLASS_INDICES_PATH, 'r') as f:
                class_names = json.load(f)
        else:
            class_names = []

def predict_disease(image_path):
    load_resources()
    
    img = preprocess_image(image_path)
    # Note: image_utils.preprocess_image does img / 255.0. 
    # DenseNet121 uses specific preprocessing, handled in the model layers now.
    
    prediction = model.predict(img)
    class_index = prediction.argmax()
    confidence = float(prediction.max())
    
    disease_label = class_names[class_index] if class_index < len(class_names) else "Unknown"
    
    return disease_label, confidence

