from caiocore.cli.commands import register_specialists
from caiocore.agents.registry import agent_registry

# Execute dynamic registration
register_specialists()

for a in agent_registry.list_all():
    print(a.get("agent_id") or a.get("id") or a.get("agent"))
