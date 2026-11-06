from flask import Flask, request, jsonify
import joblib, pandas as pd

app = Flask(__name__)
model = joblib.load("model.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    data = pd.DataFrame([request.json])
    prob = model.predict_proba(data)[0][1]
    return jsonify({"risk": round(float(prob) * 100, 1)})
