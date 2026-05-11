import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix
import os
import json
from preprocess_data import load_data

def generate_metrics():
    model_path = '../models/plant_disease_model.keras'
    if not os.path.exists(model_path):
        print(f"Model not found at {model_path}!")
        return

    print("Loading model...")
    model = tf.keras.models.load_model(model_path)

    print("Loading data...")
    _, val_ds, class_names = load_data()

    # Evaluate accuracy and loss
    print("Evaluating model...")
    loss, accuracy = model.evaluate(val_ds)
    print(f"Validation Loss: {loss:.4f}")
    print(f"Validation Accuracy: {accuracy:.4f}")
    
    # Save overall metrics
    metrics = {
        "validation_loss": loss,
        "validation_accuracy": accuracy
    }
    with open('overall_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=4)

    # Gather all true labels and predictions
    print("Generating predictions...")
    y_true = []
    y_pred_probs = []

    for images, labels in val_ds:
        preds = model.predict(images, verbose=0)
        y_true.extend(np.argmax(labels.numpy(), axis=-1))
        y_pred_probs.extend(preds)

    y_true = np.array(y_true)
    y_pred_probs = np.array(y_pred_probs)
    y_pred = np.argmax(y_pred_probs, axis=-1)

    print("Computing confusion matrix...")
    # Confusion Matrix (Correlation Matrix representation of class confusion)
    cm = confusion_matrix(y_true, y_pred)

    plt.figure(figsize=(24, 20))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=class_names, yticklabels=class_names)
    plt.title('Confusion Matrix (Correlation Matrix of Classes)', fontsize=20)
    plt.ylabel('True Class', fontsize=16)
    plt.xlabel('Predicted Class', fontsize=16)
    plt.xticks(rotation=90)
    plt.yticks(rotation=0)
    plt.tight_layout()
    plt.savefig('confusion_matrix.png', dpi=300)
    print('Confusion matrix saved to confusion_matrix.png')

    print("Computing classification report...")
    # Classification Report
    report = classification_report(y_true, y_pred, target_names=class_names, output_dict=True)
    with open('classification_report.json', 'w') as f:
        json.dump(report, f, indent=4)

    # Create a textual representation
    report_text = classification_report(y_true, y_pred, target_names=class_names)
    with open('classification_report.txt', 'w') as f:
        f.write(report_text)
    
    # Plotting classification report heatmap
    plt.figure(figsize=(16, max(6, len(class_names) * 0.4)))
    report_for_heatmap = {k: v for k, v in report.items() if k not in ['accuracy', 'macro avg', 'weighted avg']}
    classes = list(report_for_heatmap.keys())
    metric_names = ['precision', 'recall', 'f1-score']
    heatmap_data = [[report_for_heatmap[c][m] for m in metric_names] for c in classes]

    sns.heatmap(heatmap_data, annot=True, cmap='RdYlGn', xticklabels=metric_names, yticklabels=classes, vmin=0, vmax=1)
    plt.title('Classification Metrics Heatmap (Correlation of Performance)', fontsize=16)
    plt.tight_layout()
    plt.savefig('classification_report_heatmap.png', dpi=300)
    print('Classification report heatmap saved to classification_report_heatmap.png')

if __name__ == '__main__':
    generate_metrics()
