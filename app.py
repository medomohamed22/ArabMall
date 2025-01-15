import base64
from flask import Flask, render_template, request, jsonify
import requests
import os

app = Flask(__name__)

API_KEY = "AIzaSyBbRnH6zZsKyQMbxIg7thGKCappZsJl5GI"  # استبدل هذا بمفتاح API الخاص بك

class APIError(Exception):
    pass

def generate_image(prompt, style="photorealistic"):
    """Generates an image based on the provided prompt using the API."""
    headers = {"Authorization": f"Bearer {API_KEY}"}
    data = {"prompt": prompt, "style": style}

    try:
        response = requests.post("https://api.example.com/generate", headers=headers, json=data) # استبدل هذا برابط API الفعلي
        response.raise_for_status()
        response_data = response.json()
        image_data = base64.b64decode(response_data["image"])
        return image_data
    except requests.exceptions.RequestException as e:
        raise APIError(f"API error: {e}") from e


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        prompt = request.form.get("prompt")
        style = request.form.get("style", "photorealistic")  # Default to 'photorealistic' if style is not provided
        try:
            image_data = generate_image(prompt, style)
            with open("output.png", "wb") as f:
                f.write(image_data)
            return render_template("index.html", image_path="/output.png")  # return image path to display
        except APIError as e:
            return render_template("index.html", error=f"Error generating image: {e}")
    return render_template("index.html")



if __name__ == "__main__":
    app.run(debug=True)
