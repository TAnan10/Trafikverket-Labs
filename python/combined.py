import requests
import datetime
import heapq
import json
import os
import pytz
import dateutil.parser
from typing import List, Dict

def fetch_traffic_data():
    url = "https://api.trafikinfo.trafikverket.se/v2/data.json"
    authentication_key = "d68896103a8141a186a79910d41ce683"

    request_body = """
    <REQUEST>
        <LOGIN authenticationkey="d68896103a8141a186a79910d41ce683"/>
        <QUERY objecttype="TrainAnnouncement" orderby="AdvertisedTimeAtLocation" schemaversion="1.9" limit="1000">
        <FILTER>
             <OR>
                <EQ name="LocationSignature" value="M"/>
                <EQ name="LocationSignature" value="G"/>
                <EQ name="LocationSignature" value="Lp>"/>
                <EQ name="LocationSignature" value="Csy"/>
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
    """.format(authentication_key=authentication_key)

    headers = {
        "Content-Type": "application/xml"
    }

    response = requests.post(url, data=request_body, headers=headers)
    data = response.json()
    TrainAnnouncement = response.json()['RESPONSE']['RESULT'][0]['TrainAnnouncement']

    # Filter out incomplete datasets
    required_keys = ["LocationSignature", "FromLocation", "ViaFromLocation", "ToLocation", "AdvertisedTimeAtLocation", "TrainOwner", "AdvertisedTrainIdent"]
    complete_datasets = [dataset for dataset in TrainAnnouncement if all(key in dataset for key in required_keys)]

    if response.status_code == 200 or response.status_code == 206:
        return complete_datasets
    else:
        print("Error:", response.status_code)
        return None

traffic_data = fetch_traffic_data()

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

# Initialize the graph dictionary to store time difference data
graph = {}

for train_id, locations in train_locations.items():
    if len(locations) > 1:
        times_by_location = {}
        
        for location in locations:
            for announcement in location_signature_data[location]:
                if announcement['AdvertisedTrainIdent'] == train_id:
                    time_at_location = datetime.datetime.fromisoformat(announcement['AdvertisedTimeAtLocation'])
                    times_by_location[location] = time_at_location
                    
        for location1, time1 in times_by_location.items():
            for location2, time2 in times_by_location.items():
                if location1 != location2:
                    time_difference = abs(time1 - time2)
                    # Create a new dictionary entry for each pair of locations
                    graph_entry = {'StartNode': location1, 'EndNode': location2, 'TravelTime': time_difference}
                    # Append this new dictionary to the graph dictionary
                    graph[f"{location1}-{location2}"] = graph_entry

# Now, the graph dictionary contains the time difference data for each pair of locations)
# Specify a custom directory and filename

def create_graph_from_dict(graph_dict):
    """
    Convert the graph dictionary into a graph object suitable for Dijkstra's algorithm.
    """
    graph = {}
    for key, value in graph_dict.items():
        start_node, end_node = key.split('-')
        if start_node not in graph:
            graph[start_node] = {}
        if end_node not in graph:
            graph[end_node] = {}
        graph[start_node][end_node] = value['TravelTime']
        graph[end_node][start_node] = value['TravelTime'] # Assuming the graph is undirected
    return graph

def dijkstra(graph, start_node, end_node):
    """
    Implement Dijkstra's algorithm to find the shortest path between start_node and end_node.
    """
    queue = [(0, start_node, [])]
    seen = set()
    while queue:
        (cost, node, path) = heapq.heappop(queue)
        if node not in seen:
            seen.add(node)
            path = path + [node]
            if node == end_node:
                return cost, path
            for next_node, edge_cost in graph[node].items():
                if next_node not in seen:
                    # Convert edge_cost to seconds and add it to cost
                    edge_cost_seconds = edge_cost.total_seconds()
                    heapq.heappush(queue, (cost + edge_cost_seconds, next_node, path))
    return float("inf"), []

# Convert the graph dictionary into a graph object
graph_obj = create_graph_from_dict(graph)

# Define your start and end nodes
start_node = "M" # Replace with your start node
end_node = "Ör" # Replace with your end node

# Find the shortest path using Dijkstra's algorithm
shortest_path_cost, shortest_path = dijkstra(graph_obj, start_node, end_node)

print(f"Shortest path between {start_node} to {end_node}:")
print(f"Number of changes: {len(shortest_path) - 2}")
print(f"Time: {shortest_path_cost} seconds")
print(f"The path is: {shortest_path}")

desired_dir = "/Users/erikolofsson/Desktop/JSON_DATA" # Custom directory
filename = "custom_traffic_data.json" # Custom filename
full_path = os.path.join(desired_dir, filename)

# Save the data to the specified JSON file
with open(full_path, 'w') as json_file:
    json.dump(location_signature_data, json_file, indent=4)
print(f"Data saved to {full_path}")