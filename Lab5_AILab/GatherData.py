import requests
import csv

def gatherTrafficData():

  url = "https://api.trafikinfo.trafikverket.se/v2/data.json"
  API_KEY = "Replace_with_your_own_key"

  request_body = """
  <REQUEST>
  <LOGIN authenticationkey="{API_KEY}"/>
    <QUERY objecttype="TrafficFlow" namespace="road.trafficinfo" schemaversion="1.5" limit="10000">
      <FILTER>
      </FILTER>
      <INCLUDE>VehicleFlowRate</INCLUDE>
      <INCLUDE>MeasurementTime</INCLUDE>
    </QUERY>
  </REQUEST>
    """.format(API_KEY=API_KEY)

  headers = {
        "Content-Type": "application/xml"
  }

  response = requests.post(url, data=request_body, headers=headers)
  data = response.json()
  csvFilePath = 'C:/Users/123/Desktop/Python projekt/AI projekt/traffic_data.csv'

  if response.status_code == 200 or response.status_code == 206:
        return data
  else:
        print("Error:", response.status_code)
        return None

def save_to_csv(data, filepath):
    # Define the CSV file headers
    headers = ['VehicleFlowRate', 'MeasurementTime']

    # Open the CSV file for writing
    with open(filepath, mode='w', newline='') as file:
        writer = csv.writer(file)

        # Write the headers to the CSV file
        writer.writerow(headers)

        # Write the data to the CSV file
        for item in data['RESPONSE']['RESULT'][0]['TrafficFlow']:
            writer.writerow([
                item.get('VehicleFlowRate', 'N/A'),
                item.get('MeasurementTime', 'N/A')
            ])

trafficData = gatherTrafficData()

if trafficData:
    # Specify the file path where you want to save the CSV file
    filepath = 'C:/Users/123/Desktop/Python projekt/AI projekt/traffic_data.csv'
    save_to_csv(trafficData, filepath)
    print(f"Data saved to CSV file at {filepath}.")
else:
    print("No data to save.")