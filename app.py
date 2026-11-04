from flask import Flask, request, jsonify, render_template
import joblib, pandas as pd

app = Flask(__name__)
model = joblib.load("model.pkl")
FEATURES = ["age","sex","cp","trestbps","chol","fbs","restecg","thalach","exang","oldpeak","slope"]

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True) or {}
    missing = [f for f in FEATURES if f not in data]
    if missing:
        return jsonify({"error": f"Missing: {missing}"}), 400
    try:
        row = pd.DataFrame([[float(data[f]) for f in FEATURES]], columns=FEATURES)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid values"}), 400
    prob = float(model.predict_proba(row)[0][1])
    return jsonify({"risk": round(prob * 100, 1)})

if __name__ == "__main__":
    app.run(debug=True)
