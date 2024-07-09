

from flask import Flask, render_template, Response
import requests
import json
import folium
import logging
import time

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)  # Adjust log level as needed

API_KEY = "02a306c35ef0407ba3e61c8acfa215e3"

def get_sse_url():
    request_xml_trainPosition = f"""
    <REQUEST>
      <LOGIN authenticationkey="{API_KEY}"/>
      <QUERY objecttype="TrainPosition" namespace="järnväg.trafikinfo" schemaversion="1.1" limit="500" sseurl="true">
        <FILTER></FILTER>
        <INCLUDE>Train.OperationalTrainNumber</INCLUDE>
        <INCLUDE>Position.WGS84</INCLUDE>
        <INCLUDE>Status</INCLUDE>
      </QUERY>
    </REQUEST>
    """
    
    headers = {'Content-Type': 'text/xml'}
    response_trainPosition = requests.post("https://api.trafikinfo.trafikverket.se/v2/data.json", data=request_xml_trainPosition, headers=headers)
    response_json = response_trainPosition.json()
    
    try:
        sse_url = response_json['RESPONSE']['RESULT'][0]['INFO']['SSEURL']
        logging.info(f"SSE URL retrieved: {sse_url}")
        return sse_url
    except KeyError:
        logging.error("INFO key not found in the response.")
        return None

def parse_sse_data(data):
    try:
        logging.info(f"Raw SSE data received: {data}")
        
        if not data.strip():
            logging.warning("Received empty SSE data.")
            return []
        
        json_data = json.loads(data)
        train_positions = []
        
        if 'TrainPosition' in json_data['RESPONSE']['RESULT'][0]:
            train_positions_data = json_data['RESPONSE']['RESULT'][0]['TrainPosition']
            
            for position in train_positions_data:
                train_number = position['Train']['OperationalTrainNumber']
                wgs84_position = position['Position']['WGS84']
                
                # Extract latitude and longitude from WGS84 string
                coordinates_str = wgs84_position.strip('POINT ()').split()
                longitude = float(coordinates_str[0])
                latitude = float(coordinates_str[1])
                
                logging.info(f"Parsed SSE data: Train {train_number} at ({latitude}, {longitude})")
                
                train_positions.append({
                    'train_number': train_number,
                    'latitude': latitude,
                    'longitude': longitude
                })
        
        else:
            logging.warning("TrainPosition key not found in JSON data.")
        
        return train_positions
            
    except ValueError as e:
        logging.error(f"Error parsing SSE data: {e}")
        return []
    except Exception as e:
        logging.error(f"Error handling SSE data: {e}")
        return []

def stream_data():
    sse_url = get_sse_url()
    if not sse_url:
        yield "data: SSE URL not found\n\n"
        return

    # Create the map once outside the loop
    map = folium.Map(location=[59.3293, 18.0686], zoom_start=6)  # Initial map location and zoom

    with requests.get(sse_url, stream=True) as response:
        for line in response.iter_lines():
            if line:
                try:
                    line = line.decode('utf-8')
                    if line.startswith('data: '):
                        data = line[6:]  # Remove 'data: ' prefix
                        train_positions = parse_sse_data(data)
                        
                        # Clear existing markers
                        for layer in map._children.values():
                            if isinstance(layer, folium.Marker):
                                map.remove_layer(layer)
                        
                        # Add markers for all train positions
                        for position in train_positions:
                            train_number = position['train_number']
                            latitude = position['latitude']
                            longitude = position['longitude']
                            
                            folium.Marker([latitude, longitude], popup=f'Train {train_number}').add_to(map)
                        
                        map.save('templates/map.html')
                        logging.info("Map updated with all train positions")
                        yield f"data: {open('templates/map.html').read()}\n\n"
                        
                    time.sleep(2)  # Delay of 2 seconds between updates
                
                except Exception as e:
                    logging.error(f"Error processing SSE data: {e}")

@app.route('/')
def index():
    return render_template('map.html')  # Render the map.html template

@app.route('/stream')
def stream():
    return Response(stream_data(), content_type='text/event-stream')

if __name__ == '__main__':
    app.run(debug=True)
