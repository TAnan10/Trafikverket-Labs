## Overview

The script performs the following tasks:
1. Fetches traffic data related to train announcements from Trafikverkets open API.
2. Filters and organizes the data by location and train ID.
3. Constructs a graph based on travel times between locations.
4. Finds all possible paths between specified locations using Dijkstra's algorithm.
5. Saves the traffic data to a JSON file.

## Dependencies

Ensure you have the following Python packages installed:
- `requests`
- `datetime`
- `heapq`
- `json`
- `typing`

You can install the required packages using pip:
--------------------
pip install requests
--------------------

## How It Works

### 1. Fetch Traffic Data

The `fetch_traffic_data` function sends a POST request to the Trafikverket API to retrieve train announcement data. It filters out incomplete datasets and returns only those with all required fields.

### 2. Data Processing

The script organizes the fetched data into dictionaries:
- `location_signature_data` maps location signatures to train announcements.
- `train_locations` maps train IDs to their locations.

### 3. Create Graph

A graph is constructed where each edge represents the travel time between locations. The `create_graph_from_dict` function converts the dictionary format into a graph suitable for pathfinding.

### 4. Pathfinding with Dijkstra's Algorithm

The `dijkstra_all_paths_with_time` function uses Dijkstra's algorithm to find all possible paths between two nodes in the graph, along with the time required for each path.

### 5. Saving Data

The traffic data is saved to a JSON file specified by `filename`.

## Usage

1. **Run the Script**

   To execute the script, simply run it with Python:
   --------------------------
   python your_script_name.py
   --------------------------

2. **Specify Start and End Nodes**

   Modify the `start_node` and `end_node` variables in the script to define your desired starting and ending locations.

3. **Custom Filename**

   Change the `filename` variable if you want to specify a different name for the output JSON file.

## Example Output

The script prints all possible paths between the start and end nodes along with the travel time. It also saves the location signature data to a JSON file.

Example path output:

All paths between M to Ör along with time:
Path: ['M', 'G', 'Ör']
Time: 1 hours and 15 minutes


The saved JSON file will contain data in the following format:

json
{
    "M": [
        {
            "LocationSignature": "M",
            "FromLocation": "Stockholm",
            ...
        }
    ],
    ...
}


## Notes

- Ensure you have a valid API key for accessing the Trafikverket API.
- The graph construction assumes an undirected graph; modify if necessary for directed graphs.