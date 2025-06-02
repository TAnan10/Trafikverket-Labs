import requests
import json
import os
import time

API_KEY = "ad56290a9f264c73937fb006a1a42b94"

request_JPG = f"""
    <REQUEST>
    <LOGIN authenticationkey="{API_KEY}"/>
    <QUERY objecttype="Camera" namespace="road.infrastructure" schemaversion="1.1" limit="10">
        <FILTER>
            <EQ name="Id" value="SE_STA_CAMERA_Orion_488"/>
        </FILTER>
    </QUERY>
    </REQUEST>
"""

headers = {'Content-Type': 'text/xml'}

# Make sure the 'images' folder exists
os.makedirs('images', exist_ok=True)

while True:
    try:
        response_trainPosition = requests.post(
            "https://api.trafikinfo.trafikverket.se/v2/data.json",
            data=request_JPG,
            headers=headers
        )
        response_json = response_trainPosition.json()

        cameras = response_json.get('RESPONSE', {}).get(
            'RESULT', [])[0].get('Camera', [])

        for camera in cameras:
            photo_url = camera.get('PhotoUrl')
            camera_name = camera.get('Name', 'unknown_camera')

            if photo_url:
                # Clean the name to be a valid filename
                safe_name = camera_name.replace(" ", "_").replace("/", "_")
                timestamp = time.strftime("%Y%m%d_%H%M%S")
                image_path = os.path.join(
                    'images', f'{safe_name}_{timestamp}.jpg')

                # Download the image
                img_response = requests.get(photo_url)

                if img_response.status_code == 200:
                    with open(image_path, 'wb') as f:
                        f.write(img_response.content)
                    print(f"[{timestamp}] Saved {image_path}")
                else:
                    print(
                        f"[{timestamp}] Failed to download image from {photo_url}")
            else:
                print("No photo URL found for a camera.")

    except Exception as e:
        print(f"An error occurred: {e}")

    print("Waiting 10 minutes before next download...")
    time.sleep(600)  # Sleep for 600 seconds = 10 minutes
