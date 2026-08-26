from PIL import Image, ImageFilter
import numpy as np

def compute_sharpness(img_path):
    img = Image.open(img_path).convert('L')
    edges = img.filter(ImageFilter.FIND_EDGES)
    arr = np.array(edges, dtype=np.float64)
    return arr.var(), arr.mean()

bg_var, bg_mean = compute_sharpness("/home/ab/Documents/EvoSport/public/images/Login_background.png")
design_var, design_mean = compute_sharpness("/home/ab/Documents/EvoSport/public/images/Login_design.png")

print(f"Login_background.png Edge Variance: {bg_var:.2f}, Edge Mean: {bg_mean:.2f}")
print(f"Login_design.png Edge Variance: {design_var:.2f}, Edge Mean: {design_mean:.2f}")
