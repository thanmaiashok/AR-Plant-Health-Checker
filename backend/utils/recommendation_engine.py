def get_recommendation(disease):
    recommendations = {
        "Pepper__bell___Bacterial_spot": "Apply copper-based fungicides and remove infected plants.",
        "Pepper__bell___healthy": "Plant is healthy. Continue regular monitoring.",
        "Potato___Early_blight": "Apply fungicides like chlorothalonil or mancozeb. Rotate crops.",
        "Potato___Late_blight": "Use copper fungicides. Remove and destroy infected plants immediately.",
        "Potato___healthy": "Plant is healthy. Keep soil moisture consistent.",
        "Tomato_Bacterial_spot": "Use copper sprays and avoid overhead watering.",
        "Tomato_Early_blight": "Prune lower leaves and use mulch to prevent soil splash.",
        "Tomato_Late_blight": "Improve air circulation and apply preventative fungicides.",
        "Tomato_Leaf_Mold": "Increase ventilation and reduce humidity in the growing area.",
        "Tomato_Septoria_leaf_spot": "Apply fungicides and remove spotted leaves. Avoid wetting foliage.",
        "Tomato_Spider_mites_Two_spotted_spider_mite": "Use insecticidal soap or neem oil. Increase humidity.",
        "Tomato__Target_Spot": "Apply fungicides and maintain good plant spacing for airflow.",
        "Tomato__Tomato_YellowLeaf__Curl_Virus": "Control whiteflies and remove infected plants immediately.",
        "Tomato__Tomato_mosaic_virus": "Avoid handling plants when wet. Remove infected plants.",
        "Tomato_healthy": "Plant is healthy. Ensure adequate nutrients."
    }
    return recommendations.get(disease, "No specific recommendation available. Observe for further symptoms.")

