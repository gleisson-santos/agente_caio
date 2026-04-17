import sys, json
from graphify.build import build_from_json
from graphify.export import to_obsidian

print("Building Obsidian vault...")
with open("graphify-out/graph.json") as f:
    data = json.load(f)

# Extract G and communities from data. graph.json usually stores the graph format.
# Wait, graph.json is cytoscape format usually. 
# graphify update . should have created graphify-out/graph.json
# Let's see if we can use the graphify build functions.
extraction = data  # Assuming graph.json contains the whole graph?
# Actually, the SKILL.md reads graphify-out/.graphify_extract.json and .graphify_analysis.json.
# Let's try running graphify with obsidian flag via CLI using the python module.
