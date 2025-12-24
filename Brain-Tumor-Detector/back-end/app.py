from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from PIL import Image, ImageDraw, ImageFont
import io
import base64
import json
import numpy as np

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

client = genai.Client(api_key="")

def parse_json(json_output: str):
    """Extract JSON from model output."""
    lines = json_output.splitlines()
    start = None
    end = None

    for i, line in enumerate(lines):
        if line.strip().lower() == "```json":
            start = i + 1
            for j in range(start, len(lines)):
                if lines[j].strip() == "```":
                    end = j
                    break
            break

    if start is not None and end is not None:
        return "\n".join(lines[start:end]).strip()

    json_output = json_output.strip()
    import re
    match = re.search(r'[\[{].*[\]}]', json_output, flags=re.DOTALL)
    if match:
        return match.group(0).strip()

    return json_output

def get_color_for_index(i):
    """Generate distinct colors for different masks"""
    colors = [
        (255, 0, 0, 120),
        (0, 255, 0, 120),
        (0, 0, 255, 120),
        (255, 255, 0, 120),
        (255, 0, 255, 120),
        (0, 255, 255, 120),
        (255, 128, 0, 120),
        (128, 0, 255, 120),
    ]
    return colors[i % len(colors)]

def segment_image(image: Image.Image):
    """Process image and return composite overlay as base64"""
    
    # Resize image
    image.thumbnail([1024, 1024], Image.Resampling.LANCZOS)

    prompt = """
    Give the segmentation masks for the tumor on the brain MRI image.
    Output a JSON of segmentation masks which contains the 2D
    bounding box in the key "box_2d", the segmentation mask in key "mask", and
    the short text (with max 20 characters) in the key "label" that indicate the type of tumor.
    """

    config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=0)
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[prompt, image],
        config=config
    )

    # Parse JSON response
    items = json.loads(parse_json(response.text))

    # Create composite overlay
    composite_overlay = Image.new('RGBA', image.size, (0, 0, 0, 0))
    composite_draw = ImageDraw.Draw(composite_overlay)

    # Process each mask
    for i, item in enumerate(items):
        box = item["box_2d"]
        y0 = int(box[0] / 1000 * image.size[1])
        x0 = int(box[1] / 1000 * image.size[0])
        y1 = int(box[2] / 1000 * image.size[1])
        x1 = int(box[3] / 1000 * image.size[0])

        if y0 >= y1 or x0 >= x1:
            continue

        png_str = item["mask"]
        if not png_str.startswith("data:image/png;base64,"):
            continue

        png_str = png_str.removeprefix("data:image/png;base64,")
        mask_data = base64.b64decode(png_str)
        mask = Image.open(io.BytesIO(mask_data))

        mask = mask.resize((x1 - x0, y1 - y0), Image.Resampling.BILINEAR)
        mask_array = np.array(mask)

        color = get_color_for_index(i)
        box_color = (color[0], color[1], color[2], 255)

        # Apply mask overlay
        for y in range(y0, y1):
            for x in range(x0, x1):
                if y - y0 < mask_array.shape[0] and x - x0 < mask_array.shape[1]:
                    if mask_array[y - y0, x - x0] > 128:
                        composite_draw.point((x, y), fill=color)

        # Draw bounding box
        composite_draw.rectangle([x0, y0, x1, y1], outline=box_color, width=3)

        # Add label
        label = item.get('label', f'Tumor_{i}')
        try:
            font = ImageFont.truetype("arial.ttf", 20)
        except:
            font = ImageFont.load_default()
        
        text_bbox = composite_draw.textbbox((x0, y0 - 25), label, font=font)
        composite_draw.rectangle(text_bbox, fill=(0, 0, 0, 180))
        composite_draw.text((x0, y0 - 25), label, fill=box_color, font=font)

    # Create final composite
    final_composite = Image.alpha_composite(image.convert('RGBA'), composite_overlay)

    # Convert to base64
    buffered = io.BytesIO()
    final_composite.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

    return img_base64

@app.post("/segment")
async def segment_endpoint(file: UploadFile = File(...)):
    """
    Accept an image upload and return segmented overlay as base64
    """
    try:
        # Read uploaded file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Process image
        segmented_base64 = segment_image(image)
        
        return JSONResponse(content={
            "segmented_image": segmented_base64
        })
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.get("/")
async def root():
    return {"message": "Brain Tumor Segmentation API. Use POST /segment to upload an image."}

# Run with: uvicorn filename:app --reload