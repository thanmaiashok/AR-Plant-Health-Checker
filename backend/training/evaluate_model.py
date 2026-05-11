import tensorflow as tf
from preprocess_data import load_data

model = tf.keras.models.load_model("../models/plant_disease_model.h5")

train_data, val_data = load_data()

loss, acc = model.evaluate(val_data)

print("Validation Accuracy:", acc)
