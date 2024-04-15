import json
import heapq
import os
from collections import defaultdict
from datetime import datetime

# Load and parse the JSON file
desired_dir = "/Users/erikolofsson/Desktop/JSON_DATA" # Custom directory
filename = "custom_traffic_data.json" # Custom filename
full_path = os.path.join(desired_dir, filename)

# Save the data to the specified JSON file
with open(full_path, 'r') as file:
    data = json.load(file)

# Step 1: Create a graph
graph = defaultdict(dict)

for station, trains in data.items():
    for train in trains:
        for via in train['ViaFromLocation']:
            if via['LocationName'] != station:
                # Convert ISO 8601 datetime string to seconds
                edge_cost_seconds = (datetime.fromisoformat(train['AdvertisedTimeAtLocation']) - datetime.fromisoformat('2024-04-15T00:00:00+02:00')).total_seconds()
                graph[station][via['LocationName']] = edge_cost_seconds

# Step 2: Dijkstra's algorithm
def dijkstra(graph, start, end):
    queue = [(0, start, [])]
    seen = set()
    while queue:
        (cost, node, path) = heapq.heappop(queue)
        if node not in seen:
            seen.add(node)
            path = path + [node]
            if node == end:
                return cost, path
            for next_node, edge_cost in graph[node].items():
                if next_node not in seen:
                    heapq.heappush(queue, (cost + edge_cost, next_node, path))
    return float("inf"), None # Return a tuple with None for the path if no path is found

# Step 3: Find the shortest paths
start_station = 'M'
end_station = 'Ör'
shortest_paths = []
for _ in range(3): # Find top 3 shortest paths
    cost, path = dijkstra(graph, start_station, end_station)
    shortest_paths.append((cost, path))
    # Remove the last station from the graph to find the next shortest path
    if path:
        last_station = path[-1]
        graph.pop(last_station, None) # Use pop() to safely remove the key

# Step 4: Print the results
for cost, path in shortest_paths:
    if path is None:
        print(f"No path found, Total Time: {cost} seconds")
    else:
        print(f"Path: {path}, Total Time: {cost} seconds, Number of Changes: {len(path) - 1}")