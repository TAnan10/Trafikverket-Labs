import os
import plotly.graph_objects as go
import networkx as nx
import osmnx as ox

##### Interface to OSMNX    
def generate_path(origin_point, target_point, perimeter):

    # Splice the geographical coordinates in long and lat
    origin_lat = origin_point[0]
    origin_long = origin_point[1]

    target_lat = target_point[0]
    target_long = target_point[1]
    
    # Build the geocoordinate structure of the path's graph

    # If the origin is further from the equator than the target
    if origin_lat > target_lat:
        north = origin_lat 
        south = target_lat
    else:
        north = target_lat
        south = origin_lat

    # If the origin is further from the prime meridian than the target
    if origin_long > target_long:
        east = origin_long 
        west = target_long
    else:
        east = target_long
        west = origin_long

    # Construct the road graph
    # Modes 'drive', 'bike', 'walk'
    mode = 'drive'

    # Create the path/road network graph via setting the bbox parameter
    roadgraph = ox.graph_from_bbox(north + perimeter, south - perimeter, east + perimeter, west - perimeter, network_type=mode, simplify=False)

    # Get the nearest nodes in the OSMNX graph for the origin and target points
    origin_node = ox.nearest_nodes(roadgraph, origin_long, origin_lat)
    target_node = ox.nearest_nodes(roadgraph, target_long, target_lat)

    # Get the optimal path via Dijkstra
    route = nx.shortest_path(roadgraph, origin_node, target_node, weight='length', method='dijkstra')

    lat = []
    long = []

    for node in route:
        point = roadgraph.nodes[node]
        long.append(point['x'])
        lat.append(point['y'])
        
    return long, lat

##### Plot the results using Mapbox and Plotly
def plot_map(origin_point, target_points, longitudes, latitudes):
    print(origin_point)
    print(target_points)
    print(longitudes)
    print(latitudes)

    # Create a Plotly map and add the origin point to the map
    print("Setting up figure...")  
    fig = go.Figure(go.Scattermapbox(
        name="Origin",
        mode="markers",
        lon=[origin_point[1]],
        lat=[origin_point[0]],
        marker={'size': 16, 'color': "#333333"},
    ))

    # Plot the optimal paths to the map
    print("Generating paths...")   
    for i in range(len(latitudes)):
        fig.add_trace(go.Scattermapbox(
            name="Path " + str(i+1),
            mode="lines",
            lon=longitudes[i],
            lat=latitudes[i],
            marker={'size': 10},
            showlegend=True if i == 0 else False,  
            line=dict(width=4.5, color='#ffd700')
        ))

    # Plot the target geocoordinates to the map
    print("Generating target...")  
    for target_point in target_points:
        fig.add_trace(go.Scattermapbox(
            name="Destination",
            mode="markers",
            showlegend=False,
            lon=[target_point[1]],
            lat=[target_point[0]],
            marker={'size': 16, 'color': '#ffd700'}
        ))

    # Style the map layout
    fig.update_layout(
        mapbox_style="light", 
        mapbox_accesstoken="" , #Replace with your token 
        legend=dict(yanchor="top", y=1, xanchor="left", x=0.83), #x 0.9
        title="<span style='font-size: 32px;'><b>The Shortest Paths Dijkstra Map</b></span>",
        font_family="Times New Roman",
        font_color="#333333",
        title_font_size=32,
        font_size=18,
        width=1000, 
        height=1000,
        margin={"r": 0, "t": 0, "l": 0, "b": 0},
    )

    # Set the center of the map
    lat_center = 58.383041
    long_center = 12.304612

    # Add the center to the map layout
    fig.update_layout(
        title=dict(yanchor="top", y=0.97, xanchor="left", x=0.03), #x 0.75
        mapbox={
            'center': {'lat': lat_center, 'lon': long_center},
            'zoom': 12.2
        }
    )

    # Save map in output folder
    print("Saving image to output folder...")
    fig.write_image(os.path.join(os.getcwd(), 'dijkstra_map.jpg'), scale=3)

    # Show the map in the web browser
    print("Generating map in browser...")
    fig.show()
    

# Set the origin geocoordinate from which the paths are calculated
origin_point = (58.383041, 12.304612) 

# Define target points (latitude, longitude)
target_points = [
    (58.367631, 12.269542),
    (58.366792, 12.283748),
]

# Create lists for storing the paths
longitudes = []
latitudes = []

# Calculate paths for each target point
for target_point in target_points:
    # Perimeter is the scope of the road network around a geocoordinate
    perimeter = 0.10

    # Process the optimal path
    print("Processing target point:", target_point)
    long, lat = generate_path(origin_point, target_point, perimeter)
    
    # Append the paths
    longitudes.append(long)
    latitudes.append(lat)

# Plot the map with all paths and points
plot_map(origin_point, target_points, longitudes, latitudes)