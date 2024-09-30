import requests
import datetime

def fetch_traffic_data(locations):
    url = "https://api.trafikinfo.trafikverket.se/v2/data.json"
    authentication_key = "d68896103a8141a186a79910d41ce683"

    filter_conditions = "\n".join(f'<EQ name="LocationSignature" value="{location}"/>' for location in locations)

    request_body = f"""
    <REQUEST>
        <LOGIN authenticationkey="{authentication_key}"/>
        <QUERY objecttype="TrainAnnouncement" orderby="AdvertisedTimeAtLocation" schemaversion="1.9" limit="1000">
        <FILTER>
             <OR>
                {filter_conditions}
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
    """

    headers = {
        "Content-Type": "application/xml"
    }

    response = requests.post(url, data=request_body, headers=headers)
    data = response.json()
    TrainAnnouncement = data['RESPONSE']['RESULT'][0]['TrainAnnouncement']

    required_keys = ["LocationSignature", "FromLocation", "ViaFromLocation",
                     "ToLocation", "AdvertisedTimeAtLocation", "TrainOwner", "AdvertisedTrainIdent"]
    complete_datasets = [dataset for dataset in TrainAnnouncement if all(
        key in dataset for key in required_keys)]

    if response.status_code == 200 or response.status_code == 206:
        return complete_datasets
    else:
        print("Error:", response.status_code)
        return None


def process_traffic_data(traffic_data):
    location_signature_data = {}

    for train_announcement in traffic_data:
        location_signature = train_announcement.get('LocationSignature')
        if location_signature not in location_signature_data:
            location_signature_data[location_signature] = []
        location_signature_data[location_signature].append(train_announcement)

    train_locations = {}

    for station, trains in location_signature_data.items():
        for train in trains:
            train_id = train['AdvertisedTrainIdent']
            if train_id not in train_locations:
                train_locations[train_id] = [train['LocationSignature']]
            else:
                train_locations[train_id].append(train['LocationSignature'])

    graph = {}

    for train_id, locations in train_locations.items():
        if len(locations) > 1:
            times_by_location = {}

            for location in locations:
                for announcement in location_signature_data[location]:
                    if announcement['AdvertisedTrainIdent'] == train_id:
                        time_at_location = datetime.datetime.fromisoformat(
                            announcement['AdvertisedTimeAtLocation'])
                        times_by_location[location] = time_at_location

            for location1, time1 in times_by_location.items():
                for location2, time2 in times_by_location.items():
                    if location1 != location2:
                        time_difference = abs(time1 - time2)
                        graph_entry = {
                            'StartNode': location1, 'EndNode': location2, 'TravelTime': time_difference}
                        graph[f"{location1}-{location2}"] = graph_entry

    return graph