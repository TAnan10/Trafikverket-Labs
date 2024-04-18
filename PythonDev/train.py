import requests
import datetime
import json
import os
import pytz
import dateutil.parser
from typing import List, Dict


def fetch_data_from_api():  # Function 1
    url = "https://api.trafikinfo.trafikverket.se/v2/data.json"
    authentication_key = "ab40edaaea014a42a5b8ef8ba170aaad"
    request_body = """
    <REQUEST>
    <LOGIN authenticationkey="ab40edaaea014a42a5b8ef8ba170aaad"/>
    <QUERY objecttype="TrainAnnouncement" orderby="AdvertisedTimeAtLocation" schemaversion="1.9" limit="1000">
    <FILTER>
      <OR>
                <EQ name="LocationSignature" value="M"/>
                <EQ name="LocationSignature" value="G"/>
                <EQ name="LocationSignature" value="Lp>"/>
                <EQ name="LocationSignature" value="Cst"/>
                <EQ name="LocationSignature" value="My"/>
                <EQ name="LocationSignature" value="Hpbg"/>
                <EQ name="LocationSignature" value="N"/>
                <EQ name="LocationSignature" value="F"/>
                <EQ name="LocationSignature" value="Ör"/>
            </OR>
    </FILTER>
    <INCLUDE>LocationSignature</INCLUDE>
    <INCLUDE>FromLocation</INCLUDE>
    <INCLUDE>ViaFromLocation</INCLUDE>
    <INCLUDE>ViaToLocation</INCLUDE>
    <INCLUDE>ToLocation</INCLUDE>
    <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
    <INCLUDE>TrainOwner</INCLUDE>
    <INCLUDE>AdvertisedTrainIdent</INCLUDE>
    </QUERY>
    </REQUEST>
    """.format(
        authentication_key=authentication_key
    )

    headers = {"Content-Type": "application/xml"}
    response = requests.post(url, data=request_body, headers=headers)
    data = response.json()

    TrainAnnouncement = response.json(
    )['RESPONSE']['RESULT'][0]['TrainAnnouncement']

    # Filter out incomplete datasets
    required_keys = ["LocationSignature", "FromLocation", "ViaFromLocation",
                     "ToLocation", "AdvertisedTimeAtLocation", "TrainOwner", "AdvertisedTrainIdent"]
    complete_datasets = [dataset for dataset in TrainAnnouncement if all(
        key in dataset for key in required_keys)]

    if response.status_code == 200 or response.status_code == 206:
        return complete_datasets
    else:
        print("Error:", response.status_code)
        return None


traffic_data = fetch_data_from_api()

# Initialize an empty dictionary to store data for each LocationSignature
location_signature_data = {}

for train_announcement in traffic_data:
    location_signature = train_announcement.get('LocationSignature')
    # If the LocationSignature is not already a key in the dictionary, add it
    if location_signature not in location_signature_data:
        location_signature_data[location_signature] = []
    # Append the train_announcement to the list for its LocationSignature
    location_signature_data[location_signature].append(train_announcement)

train_locations = {}

# Iterate through each station
for station, trains in location_signature_data.items():
    for train in trains:
        train_id = train['AdvertisedTrainIdent']
        if train_id not in train_locations:
            train_locations[train_id] = [train['LocationSignature']]
        else:
            train_locations[train_id].append(train['LocationSignature'])

# Find trains that are advertised at more than one location
for train_id, locations in train_locations.items():
    if len(locations) > 1:
        times_by_location = {}

        # Iterate through each location for the train
        for location in locations:
            # Find the train announcement for the current location
            for announcement in location_signature_data[location]:
                if announcement['AdvertisedTrainIdent'] == train_id:
                    # Parse the AdvertisedTimeAtLocation into a datetime object
                    time_at_location = datetime.datetime.fromisoformat(
                        announcement['AdvertisedTimeAtLocation'])

                    # Store the time in the dictionary
                    times_by_location[location] = time_at_location

        for location1, time1 in times_by_location.items():
            for location2, time2 in times_by_location.items():
                if location1 != location2:
                    time_difference = abs(time1 - time2)
                    print(
                        f"Time difference between {location1} and {location2} for train {train_id}: {time_difference}")
# --------------------------------------------------------------------------------------------------
    # Write the data to a JSON file
    filename = "api_data.json"

with open(filename, "w") as json_file:
    json.dump(location_signature_data, json_file, indent=4)
print("Data saved to api_data.json")
