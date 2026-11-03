import pandas as pd, joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

df = pd.read_csv("heart.csv")
X, y = df.drop("target", axis=1), df["target"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=200)
model.fit(X_train, y_train)
print(classification_report(y_test, model.predict(X_test)))

joblib.dump(model, "model.pkl")

import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

# 1. Load the dataset (make sure heart.csv is in the same folder)
df = pd.read_csv("heart.csv")

# 2. Split features and target
X = df.drop("target", axis=1)
y = df["target"]

# 3. Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Train the Random Forest model
model = RandomForestClassifier(n_estimators=200)
model.fit(X_train, y_train)

# 5. Evaluate the model
print(classification_report(y_test, model.predict(X_test)))

# 6. Save the trained model file
joblib.dump(model, "model1.pk1")
print("Model successfully saved as model1.pk1")