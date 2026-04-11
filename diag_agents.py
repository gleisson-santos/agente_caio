import sys
import os
from pathlib import Path

# Add project root to sys.path
sys.path.append(os.getcwd())

from caiocore.agents.registry import agent_registry
from caiocore.agents.specialist import SpecialistAgent

def diag():
    print(f"Total agents: {len(agent_registry.list_ids())}")
    for aid in agent_registry.list_ids():
        agent = agent_registry.get(aid)
        if isinstance(agent, SpecialistAgent):
            print(f"Specialist: {aid} | Has Instructions: {agent.get_status().get('has_instructions')} | Len: {len(agent.get_instructions())}")
        else:
            print(f"Core Agent: {aid}")

if __name__ == "__main__":
    # We need to mimic the registration done in cli/commands.py
    # because the registry is a singleton in memory of the RUNNING process.
    # This script will only show what IT registers.
    # To see what the RUNNING gateway has, we'd need an API endpoint.
    pass
