# traffic.py
import os
import time
from skimage import io, color, filters
import numpy as np

IMAGE_DIR = os.path.join(os.path.dirname(__file__), "images")


def compute_traffic_score(image_path: str) -> int:
    """Load an image and return your sobel‐edge count score."""
    img = io.imread(image_path)
    gray = color.rgb2gray(img)
    edges = filters.sobel(gray)
    # count “strong” edges
    return int(np.sum(edges > 0.1))


def list_images_and_scores() -> list[tuple[str, int]]:
    """
    Returns a list of (image_path, score, timestamp) tuples,
    sorted newest first.
    """
    files = sorted(
        os.listdir(IMAGE_DIR),
        key=lambda fn: os.path.getmtime(os.path.join(IMAGE_DIR, fn)),
        reverse=True
    )
    out = []
    for fn in files:
        if not fn.lower().endswith((".jpg", "jpeg", "png")):
            continue
        full = os.path.join(IMAGE_DIR, fn)
        score = compute_traffic_score(full)
        # parse timestamp from filename if you like, or use mtime:
        ts = time.strftime(
            "%Y-%m-%d %H:%M:%S",
            time.localtime(os.path.getmtime(full))
        )
        out.append((full, score, ts))
    return out
