# Shortest Paths Dijkstra Map

## Overview

The Shortest Paths Dijkstra Map program calculates and visualizes the shortest paths between a given origin point and multiple target points using Dijkstra's algorithm. It leverages the OSMNX library to build a road network graph from OpenStreetMap data and Plotly to create an interactive map with the shortest paths to real locations derived from Trafikverkets API.

## Components

1. **Path Calculation**: Uses OSMNX and NetworkX to generate the shortest paths between the origin and target points.
2. **Map Visualization**: Utilizes Plotly to visualize the paths on an interactive map.

## Installation

To run this program, you need to have the following Python packages installed:

- `osmnx`
- `networkx`
- `plotly`

You can install these packages using pip:

---------------------------------
pip install osmnx networkx plotly
---------------------------------

## Configuration

1. **API Token**: The Plotly map requires a Mapbox access token for rendering. Replace the placeholder token in the `plot_map` function with your own Mapbox access token if necessary.

2. **Geocoordinates**: Modify the `origin_point` and `target_points` variables to suit your desired locations for path calculations.

## Usage

1. **Run the Script**: Execute the script to calculate and visualize the shortest paths. The script will generate a map with the shortest paths and save it as an image file.

    ----------------------------
    python shortest_paths_map.py
    ----------------------------

2. **View the Results**: The program will:
   - Calculate the shortest paths from the origin point to each target point.
   - Generate an interactive map displaying the origin, target points, and paths.
   - Save the map as `dijkstra_map.jpg` in the current working directory.
   - Display the map in a web browser for interactive exploration.

## Example

In the script, the origin point is set to `(58.383041, 12.304612)` and target points are specified as:

- `(58.367631, 12.269542)`
- `(58.366792, 12.283748)`

The script calculates the shortest paths from the origin to each target point, visualizes these paths on a Plotly map, and saves the result as an image.

## Troubleshooting

- **Missing Packages**: Ensure all required packages are installed. Use the provided `pip` commands to install them.
- **Mapbox Token Error**: If you encounter issues with the Mapbox token, verify that the token is correctly set and valid.
- **Path Calculation Issues**: Verify that the geocoordinates are correct and within the specified perimeter range. Adjust the `perimeter` value if necessary.