# Heart Risk Assistant (Deathnot)

An interactive conversational AI web application that estimates heart disease risk using a Random Forest machine learning model trained on the Cleveland Heart Disease dataset.

---

## Project Structure

```text
deathnot/
├── .venv/                  # Python virtual environment
├── static/
│   ├── chat.js             # Conversational frontend logic and input validation
│   └── style.css           # Clean chat interface styling
├── templates/
│   └── index.html          # Main application page
├── app.py                  # Flask backend serving the UI and /predict API
├── heart.csv               # Cleveland Heart Disease dataset (cleaned header & features)
├── model.pkl               # Trained RandomForestClassifier model
├── training.py             # Model training and evaluation script
└── requirements.txt        # Python package dependencies
```

---

## Getting Started

### 1. Prerequisites
- Python 3.10+ (or virtual environment with `flask`, `pandas`, `scikit-learn`, `joblib`)

### 2. Activate the Virtual Environment

**Windows (PowerShell):**
```powershell
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
source .venv/bin/activate
```

*(If setting up a fresh environment, install dependencies with `pip install -r requirements.txt`)*.

---

## Retraining the Model

To retrain the machine learning model with the dataset:

```powershell
python training.py
```

This trains a `RandomForestClassifier` on the 11 user-answerable clinical features, evaluates precision/recall/F1 metrics, and saves the trained weights into `model.pkl`.

---

## Running the Web Application

Start the Flask server:

```powershell
python app.py
```

Then open your browser at:
**[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## API Reference

### `POST /predict`

Calculates heart disease risk percentage based on health inputs.

**Request Body (JSON):**
```json
{
  "age": 55,
  "sex": 1,
  "cp": 0,
  "trestbps": 130,
  "chol": 250,
  "fbs": 0,
  "restecg": 0,
  "thalach": 150,
  "exang": 0,
  "oldpeak": 1.0,
  "slope": 1
}
```

**Response (JSON):**
```json
{
  "risk": 47.5
}
```

---

## Disclaimer

This application is strictly an educational tool and statistical estimate based on public health data. It does not provide medical diagnoses.
