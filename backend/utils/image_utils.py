import cv2
import numpy as np

IMG_SIZE = 224

def preprocess_image(image_path):

    img_bgr = cv2.imread(image_path)
    if img_bgr is None:
        raise ValueError(f"Unable to read image at {image_path}")

    img_bgr = cv2.resize(img_bgr, (IMG_SIZE, IMG_SIZE))
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

    # IMPORTANT: Do NOT scale by 1/255 here.
    # The trained model includes `tf.keras.applications.densenet.preprocess_input`.
    img_rgb = img_rgb.astype(np.float32)
    img_rgb = np.expand_dims(img_rgb, axis=0)

    return img_rgb
