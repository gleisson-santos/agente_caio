import os
from pathlib import Path

def find_folders(target_names):
    root = Path.cwd()
    results = {}
    print(f"Scanning from: {root}")
    for path in root.rglob("*"):
        if path.is_dir() and any(name in path.name for name in target_names):
            results[path.name] = str(path)
            print(f"FOUND: {path}")
    return results

if __name__ == "__main__":
    targets = ["skills_BAT", "ESTUDOS", "SKILLS_BAT", "estudos"]
    found = find_folders(targets)
    if not found:
        print("No folders found matching targets.")
