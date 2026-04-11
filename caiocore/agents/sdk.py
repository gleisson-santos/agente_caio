"""
Agent SDK — BaseAgent abstract class.

Every monitoring agent extends BaseAgent, which provides:
- Standard status/heartbeat/metrics interface
- Event emission (pushed to the shared EventStore)
- Background loop lifecycle (start/stop)
"""

from __future__ import annotations

import asyncio
import time
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any

from loguru import logger


class BaseAgent(ABC):
    """Abstract base class for all monitoring agents."""

    def __init__(self, agent_id: str, name: str, role: str, tier: int = 1):
        self.agent_id = agent_id
        self.name = name
        self.role = role
        self.tier = tier
        self.status: str = "offline"  # online | offline | error | running
        self.started_at: datetime | None = None
        self._metrics: dict[str, Any] = {}
        self._last_heartbeat: float = 0.0
        self._task: asyncio.Task | None = None
        self._running = False
        self._event_store = None  # set by registry on registration

    # ── Public interface ────────────────────────────────────────────

    def get_status(self) -> dict[str, Any]:
        """Standard status payload consumed by the Gateway API."""
        return {
            "agent": self.agent_id,
            "name": self.name,
            "role": self.role,
            "tier": self.tier,
            "status": self.status,
            "last_update": datetime.now(timezone.utc).isoformat(),
            "uptime": self._uptime_str(),
            "metrics": self.get_metrics(),
        }

    def get_metrics(self) -> dict[str, Any]:
        """Return agent-specific metrics (override in subclass for extras)."""
        return dict(self._metrics)

    def heartbeat(self) -> dict[str, Any]:
        """Respond to a Life-agent ping. Returns status + response time."""
        start = time.monotonic()
        self._last_heartbeat = time.time()
        return {
            "agent": self.agent_id,
            "status": self.status,
            "response_time_ms": round((time.monotonic() - start) * 1000, 2),
            "last_task": self._metrics.get("last_task", "idle"),
        }

    def emit_event(self, event_type: str, message: str, status: str = "info") -> None:
        """Push a NEW event to the shared EventStore (creates new row every time)."""
        if self._event_store:
            self._event_store.emit(
                agent=self.agent_id,
                event_type=event_type,
                status=status,
                message=message,
            )
        logger.debug("Agent {} event: [{}] {}", self.agent_id, event_type, message)

    def emit_event_upsert(self, event_type: str, message: str, status: str = "info") -> None:
        """Update the latest event of this type, or create if none exists.
        
        Use this for repetitive/periodic events (health scans, status changes)
        to keep only the most recent entry instead of accumulating rows.
        """
        if self._event_store:
            self._event_store.upsert(
                agent=self.agent_id,
                event_type=event_type,
                status=status,
                message=message,
            )
        logger.debug("Agent {} upsert: [{}] {}", self.agent_id, event_type, message)

    # ── Lifecycle ───────────────────────────────────────────────────

    async def start(self) -> None:
        """Start the agent's background loop."""
        if self._running:
            return
        self._running = True
        self.started_at = datetime.now(timezone.utc)
        self.status = "online"
        self.emit_event_upsert("agent_started", f"{self.name} started")
        self._task = asyncio.create_task(self._safe_loop())
        logger.info("Agent {} started", self.agent_id)

    async def stop(self) -> None:
        """Stop the agent's background loop."""
        self._running = False
        self.status = "offline"
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None
        self.emit_event_upsert("agent_stopped", f"{self.name} stopped")
        logger.info("Agent {} stopped", self.agent_id)

    async def _safe_loop(self) -> None:
        """Wrapper that catches exceptions in the run loop."""
        try:
            await self._run_loop()
        except asyncio.CancelledError:
            pass
        except Exception as e:
            self.status = "error"
            self.emit_event("task_failed", f"Agent loop crashed: {e}", status="error")
            logger.exception("Agent {} loop crashed", self.agent_id)

    @abstractmethod
    async def _run_loop(self) -> None:
        """Background loop — override in each agent subclass."""
        ...

    # ── Helpers ─────────────────────────────────────────────────────

    def _uptime_str(self) -> str:
        if not self.started_at:
            return "0s"
        delta = datetime.now(timezone.utc) - self.started_at
        secs = int(delta.total_seconds())
        if secs < 60:
            return f"{secs}s"
        if secs < 3600:
            return f"{secs // 60}m {secs % 60}s"
        hours = secs // 3600
        mins = (secs % 3600) // 60
        return f"{hours}h {mins}m"
