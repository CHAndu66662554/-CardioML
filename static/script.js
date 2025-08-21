// Form submission handler
document.getElementById('predictionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Collect form data
    const formData = new FormData(e.target);
    const features = {};
    for (let [key, value] of formData.entries()) {
        features[key] = parseFloat(value);
    }
    
    // Show loading animation
    document.getElementById('loading').classList.add('show');
    document.getElementById('result').classList.remove('show');
    
    try {
        // Send data to Flask backend
        const response = await fetch('https://cardioml-1.onrender.com/predict', {
            
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(features)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        
        // Hide loading, show results
        document.getElementById('loading').classList.remove('show');
        displayResults(result);
        
        // Show notification
        showNotification();
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').classList.remove('show');
        
        // Fallback to simulated prediction if backend is unavailable
        alert('Backend connection failed. Using simulated prediction for demonstration.');
        const hasDisease = Math.random() > 0.5;
        const confidence = Math.random() * 50 + 50; // 50-100% confidence
        displayResults({
            prediction: hasDisease ? 1 : 0,
            confidence: confidence,
            recommendation: hasDisease ? 
                "You show significant risk factors. We strongly recommend scheduling an appointment with a cardiologist for comprehensive evaluation." :
                "Your heart health appears to be good! Continue maintaining a healthy lifestyle with regular exercise and balanced diet."
        });
    }
});

function displayResults(result) {
    const resultContainer = document.getElementById('result');
    const resultIcon = document.getElementById('resultIcon');
    const iconSymbol = document.getElementById('iconSymbol');
    const resultText = document.getElementById('resultText');
    const confidenceText = document.getElementById('confidenceText');
    const recommendationEl = document.getElementById('recommendation');
    
    // Update result based on prediction
    const hasDisease = result.prediction === 1;
    const confidence = result.confidence;
    
    if (hasDisease) {
        // Positive result (heart disease detected)
        resultIcon.className = 'result-icon positive-result';
        iconSymbol.textContent = '❤️‍🩹';
        resultText.textContent = 'Heart Disease Detected';
        resultText.style.color = 'var(--secondary)';
        confidenceText.textContent = `Confidence: ${Math.round(confidence)}%`;
    } else {
        // Negative result (no heart disease)
        resultIcon.className = 'result-icon negative-result';
        iconSymbol.textContent = '❤️';
        resultText.textContent = 'No Heart Disease';
        resultText.style.color = 'var(--primary)';
        confidenceText.textContent = `Confidence: ${Math.round(confidence)}%`;
    }
    
    recommendationEl.textContent = result.recommendation;
    
    // Show result container
    resultContainer.classList.add('show');
}

function showNotification() {
    const notification = document.getElementById('notification');
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
