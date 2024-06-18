import heapq
from datetime import timedelta

def create_graph_from_dict(graph_dict):
    graph = {}
    for key, value in graph_dict.items():
        start_node, end_node = key.split('-')
        if start_node not in graph:
            graph[start_node] = {}
        if end_node not in graph:
            graph[end_node] = {}
        graph[start_node][end_node] = value['TravelTime']
        graph[end_node][start_node] = value['TravelTime']
    return graph


def dijkstra_all_paths_with_time(graph, start_node, end_node):
    queue = [(0, start_node, [], timedelta(0))]
    paths_with_time = []
    while queue:
        (cost, node, path, time) = heapq.heappop(queue)
        if node == end_node:
            paths_with_time.append((path + [node], time))
        for next_node, edge_cost in graph[node].items():
            if next_node not in path:
                edge_cost_seconds = edge_cost.total_seconds()
                heapq.heappush(
                    queue, (cost + edge_cost_seconds, next_node, path + [node], time + edge_cost))
    return paths_with_time
