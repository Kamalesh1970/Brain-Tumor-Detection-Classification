import tensorflow as tf
import numpy as np
import cv2

def make_gradcam_heatmap(img, model, last_conv_layer_name="activation_17"):
    grad_model = tf.keras.models.Model(
        inputs=model.inputs,
        outputs=[
            model.get_layer(last_conv_layer_name).output,
            model.output
        ]
    )

    # Force float32 to match model weights
    img = tf.cast(tf.convert_to_tensor(img), tf.float32)

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img, training=False)
        pred_index = tf.argmax(predictions[0])
        class_channel = predictions[:, pred_index]

    grads = tape.gradient(class_channel, conv_outputs)

    # DEBUG - remove once working
    print("GRADS MIN/MAX:", tf.reduce_min(grads).numpy(), tf.reduce_max(grads).numpy())
    print("CONV_OUTPUTS MIN/MAX:", tf.reduce_min(conv_outputs).numpy(), tf.reduce_max(conv_outputs).numpy())

    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    conv_outputs = conv_outputs[0]

    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    heatmap = tf.maximum(heatmap, 0)

    max_val = tf.reduce_max(heatmap)
    if max_val == 0:
        # avoid divide-by-degenerate-zero, return flat heatmap instead of NaNs
        return np.zeros(heatmap.shape, dtype=np.float32)

    heatmap = heatmap / max_val
    return heatmap.numpy()


def overlay_heatmap(image, heatmap):
    heatmap = cv2.resize(heatmap, (image.shape[1], image.shape[0]))
    heatmap = np.uint8(255 * heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)  # BGR

    if image.max() <= 1:
        image = (image * 255).astype(np.uint8)

    # original_np is RGB (from PIL) -> convert to BGR to match heatmap
    image_bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

    overlay = cv2.addWeighted(image_bgr, 0.6, heatmap, 0.4, 0)
    return overlay