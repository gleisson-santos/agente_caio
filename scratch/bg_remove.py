from rembg import remove
from PIL import Image
import os

input_path = "C:/Users/gdesi/.gemini/antigravity/brain/a47904c7-b4f1-4aa9-9189-1d05eaca4f9c/media__1776387888243.png"
output_path = "c:/Users/gdesi/Desktop/Agente_caio/docs/mascote.png"

os.makedirs(os.path.dirname(output_path), exist_ok=True)

try:
    print(f"Loading image from: {input_path}")
    input_image = Image.open(input_path)
    print("Removing background...")
    output_image = remove(input_image)
    print(f"Saving to: {output_path}")
    output_image.save(output_path, "PNG")
    print("Done!")
except Exception as e:
    print(f"Error: {e}")
