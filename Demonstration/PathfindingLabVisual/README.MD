# Train Route Finder

## Overview

The Train Route Finder is a Python application that allows users to visualize train routes and travel times between specified locations using real-time traffic data from Trafikverkets API. It utilizes Dijkstra's algorithm to compute all possible paths and their associated travel times, and displays this information in both text and graphical formats.

## Components

1. **`dijkstra.py`** - Contains functions for creating a graph from data and computing all possible paths using Dijkstra's algorithm.
2. **`fetch_traffic_data.py`** - Fetches real-time train traffic data from the Trafikinfo API, processes it, and converts it into a format suitable for graph creation.
3. **`graph_display.py`** - Utilizes NetworkX and Matplotlib to visualize the graph of train routes and travel times.
4. **`gui.py`** - Provides a Tkinter-based graphical user interface (GUI) for interacting with the application.

## Installation

To run this application, ensure you have the following Python packages installed:

- `requests`
- `networkx`
- `matplotlib`
- `tkinter` (usually included with Python)

You can install the required packages using pip:
----------------------------------------
pip install requests networkx matplotlib
----------------------------------------

## Configuration

1. **API Key**: The `fetch_traffic_data.py` script uses an API key for Trafikinfo. Update the `authentication_key` variable in the `fetch_traffic_data.py` script with your own API key if necessary.

2. **API Endpoint**: Ensure the API endpoint URL in `fetch_traffic_data.py` is correct and accessible.

## Usage

1. **Start the Application**: Run the `gui.py` script to launch the graphical user interface.

    -------------
    python gui.py
    -------------

2. **Input Locations**: In the GUI, enter locations (station names or signatures) separated by commas in the "Locations" field.

3. **Specify Start and End Locations**: Enter the start and end locations for the route query.

4. **Fetch and Display Paths**:
    - Click the "Fetch and Display Paths" button to retrieve and display all possible paths between the start and end locations along with their travel times in the text area.

5. **Display Graph**:
    - Click the "Display Graph" button to visualize the graph of train routes and travel times. This will open a Matplotlib window displaying the graph.

## Example

Here’s an example of how the GUI might be used:

- **Locations Input**: `Stockholm, Gothenburg, Malmö`
- **Start Location**: `Stockholm`
- **End Location**: `Malmö`

After clicking "Fetch and Display Paths", the application will show all possible routes and travel times between Stockholm and Malmö. Clicking "Display Graph" will show a graphical representation of these routes.

## Troubleshooting

- **No Paths Found**: Ensure that the locations entered are correct and that there is sufficient data available for the specified routes.
- **Error Fetching Data**: Verify your API key and check if the API endpoint is accessible.
