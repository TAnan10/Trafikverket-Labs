import os
from skimage import io, color, filters
import numpy as np

# Make sure the 'images' folder exists
folder_path = os.path.abspath(os.path.join(
    os.path.dirname(__file__), 'images'))

# Now check if the path exists
if not os.path.exists(folder_path):
    print(f"Folder not found: {folder_path}")
    exit(1)

# List all images
image_files = [file for file in os.listdir(
    folder_path) if file.endswith(('.jpg', '.png', '.jpeg'))]

# Threshold for traffic jam detection
# TODO: Find average traffic score from the images
THRESHOLD = 15000

for filename in image_files:
    image_path = os.path.join(folder_path, filename)
    image = io.imread(image_path)

    gray_image = color.rgb2gray(image)
    edges = filters.sobel(gray_image)
    traffic_score = np.sum(edges > 0.1)

    print(f"Image: {filename}")
    print(f"Traffic score: {traffic_score}")

    if traffic_score > THRESHOLD:
        print("There is more traffic than usual\n")
    else:
        print("There is less traffic than usual\n")
