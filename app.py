from flask import Flask, render_template, request, jsonify
import tensorflow as tf
import numpy as np
import os
from gradcam import make_gradcam_heatmap, overlay_heatmap
import cv2

from utils.preprocess import preprocess_image

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

model = tf.keras.models.load_model("output/final_model.keras")

print(model.summary())
for layer in model.layers:
    print(layer.name)

class_names = ["glioma", "meningioma", "notumor", "pituitary"]

@app.route("/predict", methods=["POST"])
def predict():

    file = request.files["image"]

    img, original_img = preprocess_image(file)

    # 🔥 DEBUG (keep for now)
    print("IMG SHAPE:", img.shape)
    print("IMG MIN/MAX:", img.min(), img.max())

    pred = model.predict(img)

    idx = int(np.argmax(pred))
    confidence = float(np.max(pred))

    # 🔥 Grad-CAM
    heatmap = make_gradcam_heatmap(img, model, "activation_17")

    print("HEATMAP MIN/MAX:", heatmap.min(), heatmap.max())

    # 🔥 Overlay
    overlay = overlay_heatmap(
        original_img,
        heatmap
    )

    # 🔥 SAFE conversion (important fix)
    overlay = np.clip(overlay, 0, 255).astype(np.uint8)

    # Ensure folder exists
    os.makedirs("static/gradcam", exist_ok=True)

    gradcam_path = os.path.join(
        "static",
        "gradcam",
        "gradcam.jpg"
    )

    cv2.imwrite(gradcam_path, overlay)

    return jsonify({
        "prediction": class_names[idx],
        "confidence": confidence,
        "gradcam": "/static/gradcam/gradcam.jpg"
    })

@app.route("/")
def home():
    return render_template("index.html")

# -----------------------------
# RUN SERVER (production-safe config)
# -----------------------------
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False  # IMPORTANT: disable debug in production
    )