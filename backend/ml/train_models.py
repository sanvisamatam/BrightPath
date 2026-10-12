"""
BrightPath Local Machine Learning Training Pipeline
Uses scikit-learn for Tabular Gameplay Telemetry & Adaptive Pacing Classification.

Task:
  - Predict Engagement & Mastery Level ('Developing', 'Moderate', 'Mastered')
  - Predict Adaptive Developmental Pacing ('Support_Pacing', 'Standard_Progression', 'Challenge_Mode')

Saves:
  - backend/models/telemetry_engagement_model.joblib
  - backend/models/model_metadata.json
"""

import os
import json
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import joblib

FEATURE_NAMES = [
    "score",
    "accuracy",
    "response_time",
    "completion_time",
    "mistakes",
    "hints_used",
    "tap_accuracy",
    "repetition_frequency",
    "rhythm_consistency",
    "emotion_shift"
]

def generate_telemetry_dataset(num_samples: int = 1500, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a structured, mathematically consistent developmental telemetry dataset
    simulating realistic gameplay interaction patterns across children aged 3-17.
    """
    np.random.seed(random_state)
    data = []

    for _ in range(num_samples):
        # Child profile persona archetype
        profile = np.random.choice(["high_mastery", "moderate_learner", "developing_support"], p=[0.35, 0.45, 0.20])
        
        if profile == "high_mastery":
            score = np.clip(np.random.normal(92, 5), 75, 100)
            accuracy = np.clip(np.random.normal(94, 4), 80, 100)
            response_time = np.clip(np.random.normal(1.2, 0.3), 0.5, 2.5)
            completion_time = np.clip(np.random.normal(60, 15), 25, 120)
            mistakes = int(np.clip(np.random.poisson(0.5), 0, 3))
            hints_used = int(np.clip(np.random.poisson(0.2), 0, 2))
            tap_accuracy = np.clip(np.random.normal(95, 4), 85, 100)
            repetition_freq = np.clip(np.random.exponential(0.4), 0.0, 3.0)
            rhythm_consistency = np.clip(np.random.normal(90, 6), 75, 100)
            emotion_shift = int(np.random.choice([0, 1, 2], p=[0.2, 0.5, 0.3]))
            target_mastery = "Mastered"
            target_pacing = "Challenge_Mode"

        elif profile == "moderate_learner":
            score = np.clip(np.random.normal(74, 8), 50, 88)
            accuracy = np.clip(np.random.normal(76, 7), 55, 90)
            response_time = np.clip(np.random.normal(2.4, 0.6), 1.2, 4.0)
            completion_time = np.clip(np.random.normal(110, 25), 50, 180)
            mistakes = int(np.clip(np.random.poisson(2.0), 0, 6))
            hints_used = int(np.clip(np.random.poisson(1.2), 0, 4))
            tap_accuracy = np.clip(np.random.normal(82, 8), 65, 95)
            repetition_freq = np.clip(np.random.exponential(1.2), 0.0, 6.0)
            rhythm_consistency = np.clip(np.random.normal(78, 10), 55, 92)
            emotion_shift = int(np.random.choice([-1, 0, 1], p=[0.15, 0.50, 0.35]))
            target_mastery = "Moderate"
            target_pacing = "Standard_Progression"

        else: # developing_support
            score = np.clip(np.random.normal(48, 12), 20, 70)
            accuracy = np.clip(np.random.normal(52, 10), 25, 75)
            response_time = np.clip(np.random.normal(4.2, 1.1), 2.0, 7.5)
            completion_time = np.clip(np.random.normal(180, 35), 90, 300)
            mistakes = int(np.clip(np.random.poisson(4.5), 1, 10))
            hints_used = int(np.clip(np.random.poisson(3.0), 1, 6))
            tap_accuracy = np.clip(np.random.normal(62, 12), 35, 80)
            repetition_freq = np.clip(np.random.exponential(3.0), 0.5, 12.0)
            rhythm_consistency = np.clip(np.random.normal(60, 14), 30, 80)
            emotion_shift = int(np.random.choice([-2, -1, 0, 1], p=[0.25, 0.35, 0.25, 0.15]))
            target_mastery = "Developing"
            target_pacing = "Support_Pacing"

        data.append({
            "score": round(float(score), 1),
            "accuracy": round(float(accuracy), 1),
            "response_time": round(float(response_time), 2),
            "completion_time": round(float(completion_time), 1),
            "mistakes": int(mistakes),
            "hints_used": int(hints_used),
            "tap_accuracy": round(float(tap_accuracy), 1),
            "repetition_frequency": round(float(repetition_freq), 2),
            "rhythm_consistency": round(float(rhythm_consistency), 1),
            "emotion_shift": int(emotion_shift),
            "mastery_level": target_mastery,
            "pacing_recommendation": target_pacing
        })

    return pd.DataFrame(data)

def train_and_save():
    base_dir = Path(__file__).resolve().parent.parent
    models_dir = base_dir / "models"
    os.makedirs(models_dir, exist_ok=True)

    print("Generating telemetry dataset (1,500 samples)...")
    df = generate_telemetry_dataset()

    X = df[FEATURE_NAMES]
    y_mastery = df["mastery_level"]
    y_pacing = df["pacing_recommendation"]

    # Split dataset 80% train / 20% test
    X_train, X_test, ym_train, ym_test, yp_train, yp_test = train_test_split(
        X, y_mastery, y_pacing, test_size=0.20, random_state=42, stratify=y_mastery
    )

    print(f"Training set: {len(X_train)} samples | Test set: {len(X_test)} samples")

    # 1. Train Mastery Level Classifier
    print("Training Mastery Classifier with scikit-learn Pipeline...")
    mastery_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("rf", RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42))
    ])
    mastery_pipeline.fit(X_train, ym_train)
    ym_pred = mastery_pipeline.predict(X_test)
    mastery_acc = float(accuracy_score(ym_test, ym_pred))
    print(f"Mastery Classifier Test Accuracy: {mastery_acc * 100:.2f}%")
    print(classification_report(ym_test, ym_pred))

    # 2. Train Adaptive Pacing Classifier
    print("Training Pacing Classifier with scikit-learn Pipeline...")
    pacing_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("rf", RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42))
    ])
    pacing_pipeline.fit(X_train, yp_train)
    yp_pred = pacing_pipeline.predict(X_test)
    pacing_acc = float(accuracy_score(yp_test, yp_pred))
    print(f"Pacing Classifier Test Accuracy: {pacing_acc * 100:.2f}%")
    print(classification_report(yp_test, yp_pred))

    # Save models locally
    model_bundle = {
        "mastery_model": mastery_pipeline,
        "pacing_model": pacing_pipeline,
        "feature_names": FEATURE_NAMES,
        "version": "1.0.0",
        "framework": "scikit-learn",
        "scikit_learn_version": joblib.__version__
    }

    model_path = models_dir / "telemetry_engagement_model.joblib"
    joblib.dump(model_bundle, model_path)
    print(f"Saved local model bundle to {model_path}")

    # Metadata record
    metadata = {
        "model_name": "BrightPath Telemetry Engagement & Adaptive Pacing Model",
        "version": "1.0.0",
        "framework": "scikit-learn",
        "model_file": str(model_path.name),
        "trained_date": pd.Timestamp.now().isoformat(),
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "metrics": {
            "mastery_accuracy": round(mastery_acc, 4),
            "pacing_accuracy": round(pacing_acc, 4)
        },
        "features": FEATURE_NAMES,
        "classes": {
            "mastery_level": list(mastery_pipeline.classes_),
            "pacing_recommendation": list(pacing_pipeline.classes_)
        },
        "intended_use": (
            "Predicts session engagement mastery and adaptive activity pacing "
            "from objective in-game telemetry (score, accuracy, response speed, and motor rhythm). "
            "Non-diagnostic."
        )
    }

    metadata_path = models_dir / "model_metadata.json"
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved model metadata to {metadata_path}")

if __name__ == "__main__":
    train_and_save()
