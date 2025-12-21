from PIL import Image
import sys

input_path = "public/header-logo-new.png"
output_path = "public/header-logo-trimmed.png"

try:
    img = Image.open(input_path)
    img = img.convert("RGBA")
    bbox = img.getbbox()
    if bbox:
        cropped = img.crop(bbox)
        cropped.save(output_path)
        print(f"Successfully trimmed image. Original size: {img.size}, New size: {cropped.size}")
    else:
        print("Image is empty or fully transparent.")
except Exception as e:
    print(f"Error: {e}")
