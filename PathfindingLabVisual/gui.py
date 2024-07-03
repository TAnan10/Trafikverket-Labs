import tkinter as tk
from tkinter import messagebox, scrolledtext
from fetch_traffic_data import fetch_traffic_data, process_traffic_data
from dijkstra import create_graph_from_dict, dijkstra_all_paths_with_time
from graph_display import display_graph


def fetch_and_display_paths():
    locations_input = locations_entry.get().strip()
    if not locations_input:
        messagebox.showerror("Input Error", "Please enter locations separated by commas.")
        return

    locations = [location.strip() for location in locations_input.split(",")]

    traffic_data = fetch_traffic_data(locations)
    if not traffic_data:
        messagebox.showerror("Error", "Failed to fetch traffic data.")
        return

    graph = process_traffic_data(traffic_data)
    graph_obj = create_graph_from_dict(graph)

    start_node = start_entry.get().strip()
    end_node = end_entry.get().strip()

    if not start_node or not end_node:
        messagebox.showerror("Input Error", "Please enter both start and end locations.")
        return

    all_paths_with_time = dijkstra_all_paths_with_time(graph_obj, start_node, end_node)

    if not all_paths_with_time:
        result_text.delete(1.0, tk.END)
        result_text.insert(tk.END, f"No paths found between {start_node} and {end_node}.")
        return

    result_text.delete(1.0, tk.END)
    result_text.insert(tk.END, f"All paths between {start_node} to {end_node} along with time:\n\n")
    for path_time_tuple in all_paths_with_time:
        path = path_time_tuple[0]
        time = path_time_tuple[1]

        result_text.insert(tk.END, "Path: " + " -> ".join(path) + "\n")
        hours = int(time.total_seconds() // 3600)
        minutes = int((time.total_seconds() % 3600) // 60)
        result_text.insert(tk.END, f"Time: {hours} hours and {minutes} minutes\n\n")

    return graph_obj, all_paths_with_time


def fetch_and_display_graph():
    graph_obj, paths_with_time = fetch_and_display_paths()
    if graph_obj and paths_with_time:
        display_graph(graph_obj, paths_with_time)


root = tk.Tk()
root.title("Train Route Finder")

frame = tk.Frame(root)
frame.pack(pady=10)

locations_label = tk.Label(frame, text="Locations (comma separated):")
locations_label.grid(row=0, column=0, padx=5, pady=5)
locations_entry = tk.Entry(frame)
locations_entry.grid(row=0, column=1, padx=5, pady=5)

start_label = tk.Label(frame, text="Start Location:")
start_label.grid(row=1, column=0, padx=5, pady=5)
start_entry = tk.Entry(frame)
start_entry.grid(row=1, column=1, padx=5, pady=5)

end_label = tk.Label(frame, text="End Location:")
end_label.grid(row=2, column=0, padx=5, pady=5)
end_entry = tk.Entry(frame)
end_entry.grid(row=2, column=1, padx=5, pady=5)

fetch_button = tk.Button(frame, text="Fetch and Display Paths", command=fetch_and_display_paths)
fetch_button.grid(row=3, column=0, columnspan=2, pady=10)

graph_button = tk.Button(frame, text="Display Graph", command=fetch_and_display_graph)
graph_button.grid(row=4, column=0, columnspan=2, pady=10)

result_text = scrolledtext.ScrolledText(root, width=80, height=20)
result_text.pack(pady=10)

root.mainloop()
