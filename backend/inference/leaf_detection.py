import cv2
import numpy as np


def _get_mask(image):
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    mask_green  = cv2.inRange(hsv, (25, 40, 40),  (85, 255, 255))
    mask_yellow = cv2.inRange(hsv, (18, 80, 60),  (30, 255, 255))
    mask = cv2.bitwise_or(mask_green, mask_yellow)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN,  kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    return mask


def _best_contour(mask, img_w, img_h):
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None

    largest = max(contours, key=cv2.contourArea)
    contour_area = float(cv2.contourArea(largest))
    total = float(img_w * img_h)

    if contour_area < 800:
        return None

    # Filter by contour area (not bbox): must be 1%–15% of frame
    contour_ratio = contour_area / total
    if contour_ratio < 0.01 or contour_ratio > 0.15:
        return None

    # Filter by bounding box: bbox must also be ≤25% of frame
    bx, by, bw, bh = cv2.boundingRect(largest)
    bbox_ratio = (bw * bh) / total
    if bbox_ratio > 0.25:
        return None

    # Solidity check: contour area / convex hull area ≥ 0.45 (leaf-like shape)
    hull = cv2.convexHull(largest)
    hull_area = float(cv2.contourArea(hull))
    if hull_area < 1:
        return None
    solidity = contour_area / hull_area
    if solidity < 0.45:
        return None

    return largest


def detect_leaf(image_path):
    image = cv2.imread(image_path)
    return _get_mask(image)


def get_leaf_bbox(image_path):
    image = cv2.imread(image_path)
    if image is None:
        return None

    h, w = image.shape[:2]
    mask = _get_mask(image)
    largest = _best_contour(mask, w, h)
    if largest is None:
        return None

    bx, by, bw, bh = cv2.boundingRect(largest)
    area = float(cv2.contourArea(largest))
    return {
        "x": bx / w,
        "y": by / h,
        "w": bw / w,
        "h": bh / h,
        "area": area / float(w * h)
    }


def get_leaf_contour(image_path, max_points=96):
    image = cv2.imread(image_path)
    if image is None:
        return None

    h, w = image.shape[:2]
    mask = _get_mask(image)
    largest = _best_contour(mask, w, h)
    if largest is None:
        return None

    epsilon = 0.01 * cv2.arcLength(largest, True)
    approx = cv2.approxPolyDP(largest, epsilon, True)
    pts = approx.reshape(-1, 2)

    if pts.shape[0] > max_points:
        step = int(pts.shape[0] / max_points) + 1
        pts = pts[::step]

    return [{"x": float(px) / w, "y": float(py) / h} for px, py in pts]
