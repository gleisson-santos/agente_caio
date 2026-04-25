import json
import networkx as nx
from networkx.readwrite import json_graph
from graphify.export import to_obsidian

print("Loading graph data...")
with open("graphify-out/graph.json") as f:
    data = json.load(f)

data['edges'] = data.pop('links')
G = json_graph.node_link_graph(data)

communities = {}
for node_id, node_data in G.nodes(data=True):
    layer = node_data.get('community', 0)
    if layer not in communities:
        communities[layer] = []
    communities[layer].append(node_id)

print("Exporting Graph to Obsidian Vault...")
to_obsidian(G, communities, "graphify-out/obsidian")
print("Export complete!")
