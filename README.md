<h1 align="center">NeuroMap — Brain Tumor Detection & Classification</h1>

<p align="center">
  Deep Learning based Brain Tumor Classification System with Grad-CAM Explainability
</p>

<hr>

<h2>Overview</h2>

<p>
NeuroMap is a Flask-based web application that uses a Convolutional Neural Network (CNN) to classify brain MRI scans into four categories:
</p>

<ul>
  <li>Glioma</li>
  <li>Meningioma</li>
  <li>Pituitary Tumor</li>
  <li>No Tumor</li>
</ul>

<p>
The system also integrates Grad-CAM visualization to highlight regions in the MRI image that influenced the model’s decision.
</p>

<hr>

<h2>Tech Stack</h2>

<ul>
  <li>Python</li>
  <li>TensorFlow / Keras</li>
  <li>OpenCV</li>
  <li>Flask</li>
  <li>NumPy</li>
  <li>HTML, CSS, JavaScript</li>
</ul>

<hr>

<h2>Features</h2>

<ul>
  <li>Brain MRI classification using a trained CNN model</li>
  <li>Grad-CAM heatmap visualization for interpretability</li>
  <li>REST API endpoint for predictions</li>
  <li>Web interface for image upload and results display</li>
</ul>

<hr>

<h2>Project Structure</h2>

<pre>
Brain Tumor Detector/
│── app.py
│── gradcam.py
│── model/
│── static/
│── templates/
│── utils/
│── uploads/
</pre>

<hr>

<h2>How to Run</h2>

<pre>
1. Clone repository
   git clone https://github.com/your-username/NeuroMap.git

2. Install dependencies
   pip install -r requirements.txt

3. Run Flask app
   python app.py

4. Open browser
   http://127.0.0.1:5000
</pre>

<hr>

<h2>API Usage</h2>

<pre>
POST /predict
Form Data:
    image: MRI image file

Response:
{
  "prediction": "glioma",
  "confidence": 0.91,
  "gradcam": "/static/gradcam/gradcam.jpg"
}
</pre>

<hr>

<h2>Notes</h2>

<ul>
  <li>Model file is excluded from repo due to GitHub size limit (use external storage or LFS)</li>
  <li>Grad-CAM is based on last convolutional layer activation mapping</li>
</ul>

<hr>

<h2>License</h2>

<p>
For educational and research purposes only.
</p>
# Brain-Tumor-Detection-Classification
# Brain-Tumor-Detection-Classification
