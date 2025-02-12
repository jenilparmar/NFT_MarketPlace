from gradio_client import Client
import base64
import json

# Initialize Gradio Client
client = Client("https://21e732452171127981.gradio.live/")

# Generate the image
result = client.predict(
    prompt="cat flying in black cat",
    api_name="/predict"
)

# Read the image file (assuming `result` is a file path)
with open(result, "rb") as image_file:
    image_base64 = base64.b64encode(image_file.read()).decode("utf-8")

# Create a JSON structure
data = {"image_base64": image_base64}

# Save to a JSON file
with open("image_data.json", "w") as json_file:
    json.dump(data, json_file)

print("Image successfully saved to image_data.json")
