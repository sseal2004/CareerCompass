from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
import pandas as pd
import joblib
from tensorflow import keras

# =========================
# Flask Setup
# =========================

app = Flask(__name__)
CORS(app)

# =========================
# Model Paths
# =========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_DIR = os.path.join(BASE_DIR, "..", "deep learning", "trained_models")

MODEL_PATH = os.path.join(MODEL_DIR, "career_model.keras")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
LABEL_PATH = os.path.join(MODEL_DIR, "Label.pkl")

print("Loading AI Model...")

# =========================
# Load Model + Encoders
# =========================

model = keras.models.load_model(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
label_encoder = joblib.load(LABEL_PATH)

print("✅ Model Loaded Successfully")

# =========================
# Feature Columns
# =========================

columns = [
    "gender",
    "part_time_job",
    "extracurricular_activities",
    "weekly_self_study_hours",
    "math_score",
    "history_score",
    "physics_score",
    "chemistry_score",
    "biology_score",
    "english_score",
    "geography_score"
]

# =========================
# Helper Encoders
# =========================

def encode_gender(value):
    if str(value).lower() in ["male", "0"]:
        return 0
    elif str(value).lower() in ["female", "1"]:
        return 1
    return 0


def encode_boolean(value):
    if str(value).lower() in ["true", "1", "yes"]:
        return 1
    return 0


# =========================
# Home Route
# =========================

@app.route("/")
def home():
    return jsonify({
        "message": "Career Prediction API Running"
    })


# =========================
# Prediction Route
# =========================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json()

        if not data:
            return jsonify({"error": "No input data received"}), 400

        # =========================
        # Encode Inputs
        # =========================

        gender = encode_gender(data["gender"])
        part_time_job = encode_boolean(data["part_time_job"])
        extracurricular = encode_boolean(data["extracurricular_activities"])

        weekly_hours = float(data["weekly_self_study_hours"])

        math = float(data["math_score"])
        history = float(data["history_score"])
        physics = float(data["physics_score"])
        chemistry = float(data["chemistry_score"])
        biology = float(data["biology_score"])
        english = float(data["english_score"])
        geography = float(data["geography_score"])

        # =========================
        # Create DataFrame
        # =========================

        features = pd.DataFrame([[
            gender,
            part_time_job,
            extracurricular,
            weekly_hours,
            math,
            history,
            physics,
            chemistry,
            biology,
            english,
            geography
        ]], columns=columns)

        print("Input Features:")
        print(features)

        # =========================
        # Scale
        # =========================

        scaled = scaler.transform(features)

        # =========================
        # Predict
        # =========================

        prediction = model.predict(scaled)

        prediction = prediction[0]

        predicted_index = np.argmax(prediction)

        career = label_encoder.inverse_transform([predicted_index])[0]

        confidence = float(prediction[predicted_index])

        if np.isnan(confidence):
            confidence = 0.0

        # =========================
        # Response
        # =========================

        return jsonify({
            "career_prediction": career,
            "confidence": round(confidence, 4)
        })

    except Exception as e:

        import traceback
        traceback.print_exc()

        return jsonify({
            "error": str(e)
        }), 500


# =========================
# Run Server
# =========================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)