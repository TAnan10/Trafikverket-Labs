import os
import requests
import time
import xml.etree.ElementTree as ET
from xml.dom import minidom
import json

# Define the API key
api_key = "d68896103a8141a186a79910d41ce683"

# Define the output directories
output_directory_xml = "C:/Users/123/Desktop/Github/Trafikverket-Labs/ExampleCode/Python/RequestExamples/requests_xml"
output_directory_json = "C:/Users/123/Desktop/Github/Trafikverket-Labs/ExampleCode/Python/RequestExamples/requests_json"

# Ensure the directories exist
os.makedirs(output_directory_xml, exist_ok=True)
os.makedirs(output_directory_json, exist_ok=True)

# Define the requests with descriptive file names and comments
requests_data = {
    "train_position_request": {
        "request": """<REQUEST>
            <!-- Authentication information for accessing the API -->
            <LOGIN authenticationkey="{api_key}"/>
            <!-- Query to retrieve TrainPosition data for the trains with advertisedtrainnumber 123 -->
            <QUERY objecttype="TrainPosition" namespace="järnväg.trafikinfo" schemaversion="1.1">
                <FILTER>
                    <EQ name="Train.AdvertisedTrainNumber" value="123"/>
                </FILTER>
            </QUERY>
        </REQUEST>""",
        "description": "Returns TrainPosition data for the trains with advertised train number 123."
    },

    "train_announcement_request": {
        "request": """<REQUEST>
            <!-- Authentication information for accessing the API -->
            <LOGIN authenticationkey="{api_key}"/>
            <!-- Query to retrieve data for trains that have a ScheduledDepartureDateTime of 2022-07-01T12:25:15.000+02:00 or later -->
            <QUERY orderby="EstimatedTimeAtLocation desc" objecttype="TrainAnnouncement" schemaversion="1.9" limit="10">
                <FILTER>
                    <AND>
                        <GTE name="ScheduledDepartureDateTime" value="2022-07-01T12:25:15.000+02:00"/>
                    </AND>
                </FILTER>
            </QUERY>
        </REQUEST>""",
        "description": "Returns data for trains that have a ScheduledDepartureDateTime of 2022-07-01T12:25:15.000+02:00 or later."
    },

    "traffic_flow_average_siteid_vehicleflowrate": {
        "request": """<REQUEST>
            <!-- Authentication information for accessing the API -->
            <LOGIN authenticationkey="{api_key}"/>
            <!-- Query to retrieve TrafficFlow data with AverageVehicleSpeed, SiteId, and VehicleFlowRate -->
            <QUERY objecttype="TrafficFlow" namespace="road.trafficinfo" schemaversion="1.5" limit="10">
                <FILTER></FILTER>
                <INCLUDE>AverageVehicleSpeed</INCLUDE>
                <INCLUDE>SiteId</INCLUDE>
                <INCLUDE>VehicleFlowRate</INCLUDE>
            </QUERY>
        </REQUEST>""",
        "description": "Returns the following data from TrafficFlow: AverageVehicleSpeed, SiteId, and VehicleFlowRate."
    },

    "train_message_external_description": {
        "request": """<REQUEST>
            <!-- Authentication information for accessing the API -->
            <LOGIN authenticationkey="{api_key}"/>
            <!-- Query to retrieve TrainMessage data where ExternalDescription starts with 'Pågående banarbete' -->
            <QUERY objecttype="TrainMessage" schemaversion="1.7" limit="10">
                <FILTER>
                    <LIKE name="ExternalDescription" value="/^Pågående banarbete/" />
                </FILTER>
            </QUERY>
        </REQUEST>""",
        "description": "Only returns datasets that contain an ExternalDescription that starts with 'Pågående banarbete'."
    },

    "measurement_data_county_direction": {
        "request": """<REQUEST>
            <!-- Authentication information for accessing the API -->
            <LOGIN authenticationkey="{api_key}"/>
            <!-- Query to retrieve MeasurementData100 with County 23 or 24, Direction.Value containing 'Mot', and IRIRightAverageValue greater than 1.0 -->
            <QUERY objecttype="MeasurementData100" namespace="road.pavementinfo" schemaversion="1" limit="10">
                <FILTER>
                    <AND>
                        <IN name="County" value="23,24"/>
                        <LIKE name="Direction.Value" value="/Mot/"/>
                        <GT name="IRIRightAverageValue" value="1.0"/>
                    </AND>
                </FILTER>
            </QUERY>
        </REQUEST>""",
        "description": "Returns all data where County field is 23 or 24, Direction.Value contains 'Mot', and IRIRightAverageValue is greater than 1.0."
    },

    "traffic_flow_siteid_vehicleflowrate_or_speed": {
        "request": """<REQUEST>
            <!-- Authentication information for accessing the API -->
            <LOGIN authenticationkey="{api_key}"/>
            <!-- Query to retrieve TrafficFlow data with SiteId 132 and VehicleFlowRate 60 or AverageVehicleSpeed greater than 10 -->
            <QUERY objecttype="TrafficFlow" namespace="road.trafficinfo" schemaversion="1.5" limit="10">
                <FILTER>
                    <OR>
                        <AND>
                            <EQ name="SiteId" value="132" />
                            <EQ name="VehicleFlowRate" value="60" />
                        </AND>
                        <GT name="AverageVehicleSpeed" value="10" />
                    </OR>
                </FILTER>
                <INCLUDE>AverageVehicleSpeed</INCLUDE>
                <INCLUDE>SiteId</INCLUDE>
                <INCLUDE>VehicleFlowRate</INCLUDE>
            </QUERY>
        </REQUEST>""",
        "description": "Returns data that either has SiteId 132 and VehicleFlowRate 60, or AverageVehicleSpeed greater than 10."
    },

    "reason_code_starting_with_ANA": {
        "request": """<REQUEST>
            <!-- Authentication information for accessing the API -->
            <LOGIN authenticationkey="{api_key}"/>
            <!-- Query to retrieve ReasonCode data where Code starts with 'ANA' -->
            <QUERY objecttype="ReasonCode" schemaversion="1" limit="10">
                <FILTER>
                    <LIKE name="Code" value="/^ANA"/>
                </FILTER>
            </QUERY>
        </REQUEST>""",
        "description": "Returns all data where Code begins with 'ANA'."
    },

    "train_station_message_not_normal": {
        "request": """<REQUEST>
            <!-- Authentication information for accessing the API -->
            <LOGIN authenticationkey="{api_key}"/>
            <!-- Query to retrieve TrainStationMessage data where Status field is not 'Normal' -->
            <QUERY objecttype="TrainStationMessage" schemaversion="1" limit="10">
                <FILTER>
                    <NOTLIKE name="Status" value="Normal"/>
                </FILTER>
            </QUERY>
        </REQUEST>""",
        "description": "Returns all data where Status field is not 'Normal'."
    },

    "measurement_data20_conditions": {
        "request": """<REQUEST>
            <!-- Authentication information for accessing the API -->
            <LOGIN authenticationkey="{api_key}"/>
            <!-- Query to retrieve MeasurementData20 with conditions on EdgeDepth, IRILeft, MeasurementVehicleSpeed, and WaterArea -->
            <QUERY objecttype="MeasurementData20" namespace="road.pavementinfo" schemaversion="1" limit="10">
                <FILTER>
                    <NOT>
                        <GT name="EdgeDepth" value="0"/>
                    </NOT>
                    <AND>
                        <LTE name="IRILeft" value="5"/>
                        <IN name="MeasurementVehicleSpeed" value="30,50"/>
                        <EQ name="WaterArea" value="0"/>
                    </AND>
                </FILTER>
            </QUERY>
        </REQUEST>""",
        "description": "Returns data where EdgeDepth is not greater than 0, IRILeft is less than or equal to 5, MeasurementVehicleSpeed is between 30 and 50, and WaterArea is exactly zero."
    },

    "pavement_data_length_county": {
        "request": """<REQUEST>
            <!-- Authentication information for accessing the API -->
            <LOGIN authenticationkey="{api_key}"/>
            <!-- Query to retrieve PavementData with Length less than 600 and County not equal to 12 -->
            <QUERY objecttype="PavementData" namespace="road.pavementinfo" schemaversion="1" limit="10">
                <FILTER>
                    <AND>
                        <LT name="Length" value="600" />
                        <NE name="County" value="12" />
                    </AND>
                </FILTER>
            </QUERY>
        </REQUEST>""",
        "description": "Returns data where Length is less than 600 and County is not equal to 12."
    },

    "train_position_within_box_wgs84": {
        "request": """<REQUEST>
            <!-- Authentication information for accessing the API -->
            <LOGIN authenticationkey="{api_key}"/>
            <!-- Query to retrieve TrainPosition data within a bounding box defined by WGS84 coordinates -->
            <QUERY objecttype="TrainPosition" namespace="järnväg.trafikinfo" schemaversion="1.1">
                <FILTER>
                    <WITHIN name="Position.WGS84" shape="box" value="59.298384 14.002478, 0.678850 74.822790"/>
                </FILTER>
                <INCLUDE>Train.OperationalTrainNumber</INCLUDE>
            </QUERY>
        </REQUEST>""",
        "description": "Returns TrainPosition data for locations within a bounding box defined by WGS84 coordinates."
    }
}

def clear_directory(directory):
    """Delete all files in the given directory."""
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        try:
            if os.path.isfile(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")

def fetch_data_xml(request_name, request_data, retries=3):
    url = "https://api.trafikinfo.trafikverket.se/v2/data.xml"
    headers = {
        "Content-Type": "application/xml"
    }

    request_body = request_data["request"].format(api_key=api_key)

    for attempt in range(retries):
        try:
            print(f"Fetching XML data for {request_name} (attempt {attempt + 1}) ...")
            response = requests.post(url, headers=headers, data=request_body)
            response.raise_for_status()  # Ensure we notice bad responses
            return request_body, response.text  # Return request and response
        except requests.exceptions.HTTPError as http_err:
            print(f"HTTP error occurred for {request_name}: {http_err}")
        except requests.exceptions.RequestException as err:
            print(f"Error occurred for {request_name}: {err}")
        time.sleep(5)  # Wait before retrying

    print(f"Failed to fetch data for {request_name} after {retries} attempts.")
    return None, None

def fetch_data_json(request_name, request_data, retries=3):
    url = "https://api.trafikinfo.trafikverket.se/v2/data.json"
    headers = {
        "Content-Type": "application/xml"
    }

    request_body = request_data["request"].format(api_key=api_key)

    for attempt in range(retries):
        try:
            print(f"Fetching JSON data for {request_name} (attempt {attempt + 1}) ...")
            response = requests.post(url, headers=headers, data=request_body)
            response.raise_for_status()  # Ensure we notice bad responses
            return request_body, response.json()  # Return request and response
        except requests.exceptions.HTTPError as http_err:
            print(f"HTTP error occurred for {request_name}: {http_err}")
        except requests.exceptions.RequestException as err:
            print(f"Error occurred for {request_name}: {err}")
        time.sleep(5)  # Wait before retrying

    print(f"Failed to fetch data for {request_name} after {retries} attempts.")
    return None, None

def format_xml(data):
    """Format XML data with proper indentation."""
    try:
        parsed = minidom.parseString(data)
        pretty_xml = parsed.toprettyxml(indent="    ")
        # Remove extra new lines and extra spaces
        lines = [line for line in pretty_xml.splitlines() if line.strip()]
        return "\n".join(lines)
    except Exception as e:
        print(f"Failed to format XML: {e}")
        return data

def format_json(data):
    """Format JSON data with pretty print."""
    try:
        return json.dumps(data, indent=4, ensure_ascii=False)
    except Exception as e:
        print(f"Failed to format JSON: {e}")
        return json.dumps(data)

def escape_newlines_in_string(s):
    """Escape newlines in a string for JSON output."""
    return s.replace("\n", "\\n").replace("\r", "\\r")

def save_to_file(request_data, response_data, file_path, file_type="xml"):
    if file_type == "xml":
        formatted_xml_request = format_xml(request_data)
        formatted_xml_response = format_xml(response_data)
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write("<!-- Request sent to the API -->\n")
            file.write(formatted_xml_request)
            file.write("\n\n<!-- Response received from the API -->\n")
            file.write(formatted_xml_response)
    elif file_type == "json":
        with open(file_path, 'w', encoding='utf-8') as file:
            # Write XML-style comments at the top
            file.write("/* Request sent to the API */\n")
            json_request_data = {"request": escape_newlines_in_string(request_data)}
            formatted_json_request = format_json(json_request_data)
            file.write(formatted_json_request)
            file.write("\n\n/* Response received from the API */\n")
            formatted_json_response = format_json(response_data)
            file.write(formatted_json_response)
    print(f"Data saved to {file_path}")

def main():
    # Clear old files in the output directories
    clear_directory(output_directory_xml)
    clear_directory(output_directory_json)
    
    for request_name, request_data in requests_data.items():
        # Fetch XML data
        xml_request, xml_response = fetch_data_xml(request_name, request_data)
        if xml_response:
            xml_file_path = os.path.join(output_directory_xml, f"{request_name}.xml")
            save_to_file(xml_request, xml_response, xml_file_path, file_type="xml")

        # Fetch JSON data
        json_request, json_response = fetch_data_json(request_name, request_data)
        if json_response:
            json_file_path = os.path.join(output_directory_json, f"{request_name}.json")
            save_to_file(json_request, json_response, json_file_path, file_type="json")

if __name__ == "__main__":
    main()