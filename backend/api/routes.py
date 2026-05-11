import os
import uuid
from flask import request, jsonify
from inference.predict import predict_disease
from inference.leaf_detection import get_leaf_bbox, get_leaf_contour
from utils.recommendation_engine import get_recommendation

UPLOAD_FOLDER = "uploads"

def register_routes(app):

    @app.route("/", methods=["GET"])
    def index():
        return jsonify({
            "name": "Plant Health Monitor API",
            "status": "ok",
            "endpoints": ["POST /predict", "GET /health"]
        })

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"})

    @app.route("/favicon.ico", methods=["GET"])
    def favicon():
        return ("", 204)

    @app.route("/predict", methods=["POST"])
    def predict():
        if "image" not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files["image"]

        ext = os.path.splitext(file.filename or "")[-1].lower()
        if ext not in (".jpg", ".jpeg", ".png", ".webp", ".bmp"):
            ext = ".jpg"

        safe_name = f"{uuid.uuid4().hex}{ext}"
        path = os.path.join(UPLOAD_FOLDER, safe_name)

        try:
            file.save(path)

            disease, confidence = predict_disease(path)
            leaf_box = get_leaf_bbox(path)
            leaf_contour = get_leaf_contour(path)
            recommendation = get_recommendation(str(disease))

            return jsonify({
                "disease": str(disease),
                "confidence": confidence,
                "recommendation": recommendation,
                "leafBox": leaf_box,
                "leafContour": leaf_contour,
            })
        finally:
            try:
                os.remove(path)
            except OSError:
                pass
