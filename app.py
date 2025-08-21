from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pickle
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the trained model
try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        # Get data from request
        data = request.get_json()
        
        # Extract features in the correct order expected by the model
        features = [
            float(data['age']),
            float(data['sex']),
            float(data['cp']),
            float(data['trestbps']),
            float(data['chol']),
            float(data['fbs']),
            float(data['restecg']),
            float(data['thalach']),
            float(data['exang']),
            float(data['oldpeak']),
            float(data['slope']),
            float(data['ca']),
            float(data['thal'])
        ]
        
        # Convert to numpy array and reshape for prediction
        features_array = np.array(features).reshape(1, -1)
        
        # Make prediction
        prediction = model.predict(features_array)
        prediction_proba = model.predict_proba(features_array)
        
        # Get prediction (0 = no disease, 1 = disease)
        has_disease = int(prediction[0])
        
        # Get confidence (probability of the predicted class)
        confidence = float(prediction_proba[0][has_disease] * 100)
        
        # Get recommendation based on prediction
        if has_disease:
            recommendation = "You show significant risk factors. We strongly recommend scheduling an appointment with a cardiologist for comprehensive evaluation."
        else:
            recommendation = "Your heart health appears to be good! Continue maintaining a healthy lifestyle with regular exercise and balanced diet."
        
        return jsonify({
            'prediction': has_disease,
            'confidence': confidence,
            'recommendation': recommendation
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
