import numpy as np
from PIL import Image


def preprocess_image(file_stream):

    original = Image.open(file_stream).convert("RGB")

    original = original.resize((224, 224))

    original_np = np.array(original)

    model_input = original_np.astype(np.float32) / 255.0

    model_input = np.expand_dims(model_input, axis=0)

    return model_input, original_np