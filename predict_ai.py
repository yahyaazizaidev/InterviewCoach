import joblib
import numpy as np
from pathlib import Path
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models", "all-MiniLM-L6-v2")

# paths relative to backend/
MODEL_FILE = Path("interview_coach_model.pkl")
SCALER_FILE = Path("feature_scaler.pkl")
COLUMNS_FILE = Path("model_columns.pkl")

model = joblib.load(MODEL_FILE)
scaler = joblib.load(SCALER_FILE)
model_columns = joblib.load(COLUMNS_FILE)   # not used directly here but kept

def predict_confidence_from_features(features_list):
    """
    features_list: numeric list from extractor.extract_features_for_backend
    returns: float confidence (0-100 or whatever your model outputs)
    """
    X = np.array(features_list, dtype=float).reshape(1, -1)
    X_scaled = scaler.transform(X)
    score = float(model.predict(X_scaled)[0])   # or predict_proba if you used that
    return score
