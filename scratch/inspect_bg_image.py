from PIL import Image
import numpy as np

img_bg = Image.open("/home/ab/Documents/EvoSport/public/images/Login_background.png")
img_design = Image.open("/home/ab/Documents/EvoSport/public/images/Login_design.png")

print("BG Image Size:", img_bg.size)
print("Design Image Size:", img_design.size)

# Sample top-left corner (50,50) to (350, 350) from both
crop_bg = img_bg.crop((50, 50, 350, 350))
crop_design = img_design.crop((50, 50, 350, 350))

# Save crops to inspect sharpness
crop_bg.save("/home/ab/.gemini/antigravity-cli/brain/5936c987-e368-45bc-8097-935ee3d2f5f6/crop_bg_raw.png")
crop_design.save("/home/ab/.gemini/antigravity-cli/brain/5936c987-e368-45bc-8097-935ee3d2f5f6/crop_design_ref.png")

print("Saved crop_bg_raw.png and crop_design_ref.png")
