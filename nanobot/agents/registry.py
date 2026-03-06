"""
Agent Registry — singleton that tracks all active monitoring agents.

The Gateway API reads from this registry to serve real agent data.
Token recording is also routed through here so any agent can be instrumented.
"""

from __future__ import annotations

from typing import Any

from loguru import logger


class AgentRegistry:
    """Central registry for all monitoring agents."""

    def __init__(self):
        self._agents: dict[str, Any] = {}  # agent_id -> BaseAgent
        self._event_store = None
        self._token_agent = None  # fast-path for token recording

    def set_event_store(self, store) -> None:
        """Assign the shared EventStore to the registry."""
        self._event_store = store
        # Propagate to already-registered agents
        for agent in self._agents.values():
            agent._event_store = store

    def register(self, agent) -> None:
        """Register a monitoring agent."""
        self._agents[agent.agent_id] = agent
        if self._event_store:
            agent._event_store = self._event_store
        # Cache token agent for fast recording
        if agent.agent_id == "agent-token":
            self._token_agent = agent
        logger.info("AgentRegistry: registered monitoring agent {}", agent.agent_id)

    def register_passive(self, agent_id: str, name: str, role: str, tier: int = 2) -> None:
        """
        Register a passive agent (specialist) that doesn't have a BaseAgent instance.
        Used for virtual nodes tracked by the LifeAgent.
        """
        if agent_id not in self._agents:
            # We create a simple dictionary-based representation for the registry
            # but LifeAgent will be the one providing the real-time status.
            self._agents[agent_id] = {
                "agent_id": agent_id,
                "name": name,
                "role": role,
                "tier": tier,
                "status": "offline", # Default
                "is_passive": True
            }
            logger.info("AgentRegistry: registered passive specialist {}", agent_id)

    def get(self, agent_id: str):
        """Get an agent by ID."""
        return self._agents.get(agent_id)

    def list_all(self) -> list[dict[str, Any]]:
        """Return status of all registered agents (real and passive)."""
        results = []
        for agent in self._agents.values():
            if hasattr(agent, "get_status"):
                results.append(agent.get_status())
            else:
                # Passive agent dict
                results.append({
                    "agent": agent["agent_id"],
                    "name": agent["name"],
                    "role": agent["role"],
                    "tier": agent["tier"],
                    "status": agent["status"],
                    "last_update": None,
                    "uptime": "—",
                    "metrics": {}
                })
        return results

    def list_ids(self) -> list[str]:
        """Return all registered agent IDs."""
        return list(self._agents.keys())

    def get_metrics(self, agent_id: str) -> dict[str, Any]:
        """Get metrics for a specific agent."""
        agent = self._agents.get(agent_id)
        return agent.get_metrics() if agent else {}

    def heartbeat_all(self) -> list[dict[str, Any]]:
        """Ping all agents and return heartbeat responses."""
        results = []
        for agent in self._agents.values():
            try:
                results.append(agent.heartbeat())
            except Exception as e:
                results.append({
                    "agent": agent.agent_id,
                    "status": "error",
                    "response_time_ms": -1,
                    "error": str(e),
                })
        return results

    def record_tokens(self, model: str, usage: dict) -> None:
        """Record token usage from an LLM call. Called by the LiteLLM provider hook."""
        if self._token_agent and hasattr(self._token_agent, "record"):
            self._token_agent.record(model, usage)


# ── Module-level singleton ──────────────────────────────────────────
agent_registry = AgentRegistry()
