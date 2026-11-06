import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

FEATURES = ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope"]

# 1. Load the dataset
df = pd.read_csv("heart.csv")

# 2. Drop rows with missing values in the relevant features and target
df = df.dropna(subset=FEATURES + ["target"])

# 3. Select features matching the web application and target
X = df[FEATURES]
y = df["target"]

# 4. Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 5. Train Random Forest model
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# 6. Evaluate model
print("Model Performance:")
print(classification_report(y_test, model.predict(X_test)))

# 7. Save model
joblib.dump(model, "model.pkl")
print("Model successfully trained and saved as model.pkl")
