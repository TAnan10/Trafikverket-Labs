import networkx as nx
import matplotlib.pyplot as plt

def display_graph(graph, paths_with_time):
    G = nx.Graph()

    for path, time in paths_with_time:
        for i in range(len(path) - 1):
            G.add_edge(path[i], path[i + 1], weight=time.total_seconds() / (len(path) - 1))

    pos = nx.spring_layout(G)
    edge_labels = {(u, v): f"{int(d['weight']//3600)}h {int((d['weight']%3600)//60)}m" for u, v, d in G.edges(data=True)}
    
    plt.figure(figsize=(10, 6))
    nx.draw(G, pos, with_labels=True, node_size=700, node_color="lightblue", font_size=10, font_weight="bold")
    nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, font_color='red')
    
    plt.title("Train Routes and Travel Times")
    plt.show()
