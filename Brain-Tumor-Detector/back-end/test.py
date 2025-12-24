import requests

with open("N.jpeg", "rb") as f:
    response = requests.post("http://localhost:8000/segment", files={"file": f})
    
result = response.json()
segmented_base64 = result["segmented_image"]

# To save the image:
import base64
img_data = base64.b64decode(segmented_base64)
with open("output.png", "wb") as f:
    f.write(img_data)