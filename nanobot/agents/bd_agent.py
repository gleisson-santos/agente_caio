"""
BD Agent — monitors Supabase database connections.

Supports multiple Supabase connections. Pings each periodically,
discovers tables, tracks response times, connection status, and query statistics.
"""

from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass, field
from typing import Any

import httpx
from loguru import logger

from nanobot.agents.sdk import BaseAgent


@dataclass
class SupabaseConnection:
    """Configuration for a single Supabase connection."""
    name: str
    url: str
    service_key: str
    status: str = "unknown"
    last_ping_ms: float = 0.0
    last_check: float = 0.0
    total_queries: int = 0
    failed_queries: int = 0
    avg_response_ms: float = 0.0
    tables: list = field(default_factory=list)
    table_count: int = 0
    _response_times: list = field(default_factory=list)


class BDAgent(BaseAgent):
    """
    Database monitoring agent for Supabase.

    - Pings each connection every 30 seconds
    - Discovers tables via REST API
    - Tracks response time, availability, query stats
    - Emits alerts on failures
    """

    def __init__(self, connections: list[dict] | None = None):
        super().__init__(
            agent_id="agent-bd",
            name="Agente BD",
            role="Monitor de Banco de Dados",
            tier=1,
        )
        self._connections: list[SupabaseConnection] = []
        self._check_interval = 30  # seconds

        # Initialize connections from config
        if connections:
            for conn_cfg in connections:
                self._connections.append(SupabaseConnection(
                    name=conn_cfg.get("name", "default"),
                    url=conn_cfg.get("url", ""),
                    service_key=conn_cfg.get("key", conn_cfg.get("service_key", "")),
                ))

    def add_connection(self, name: str, url: str, service_key: str) -> None:
        """Add a Supabase connection at runtime."""
        self._connections.append(SupabaseConnection(
            name=name, url=url, service_key=service_key,
        ))
        logger.info("BDAgent: added connection '{}'", name)

    def get_metrics(self) -> dict[str, Any]:
        online = sum(1 for c in self._connections if c.status == "online")
        total_queries = sum(c.total_queries for c in self._connections)
        failed = sum(c.failed_queries for c in self._connections)
        total_tables = sum(c.table_count for c in self._connections)
        avg_ms = 0.0
        if self._connections:
            pings = [c.avg_response_ms for c in self._connections if c.avg_response_ms > 0]
            avg_ms = sum(pings) / len(pings) if pings else 0.0

        return {
            "connections_total": len(self._connections),
            "connections_online": online,
            "total_tables": total_tables,
            "total_queries": total_queries,
            "failed_queries": failed,
            "avg_response_ms": round(avg_ms, 1),
        }

    def get_connection_status(self) -> list[dict[str, Any]]:
        """Detailed status per connection for /agent/db/connections."""
        return [
            {
                "name": c.name,
                "url": c.url,
                "status": c.status,
                "last_ping_ms": round(c.last_ping_ms, 1),
                "total_queries": c.total_queries,
                "failed_queries": c.failed_queries,
                "avg_response_ms": round(c.avg_response_ms, 1),
                "table_count": c.table_count,
                "tables": c.tables,
            }
            for c in self._connections
        ]

    async def _check_connection(self, conn: SupabaseConnection) -> None:
        """Ping a single Supabase connection and discover tables."""
        if not conn.url or not conn.service_key:
            conn.status = "offline"
            return

        headers = {
            "apikey": conn.service_key,
            "Authorization": f"Bearer {conn.service_key}",
        }

        start = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                # Health check: query the Supabase REST API root
                resp = await client.get(
                    f"{conn.url}/rest/v1/",
                    headers=headers,
                )

            elapsed_ms = (time.monotonic() - start) * 1000
            conn.last_ping_ms = elapsed_ms
            conn.last_check = time.time()
            conn.total_queries += 1

            # Track rolling response times (keep last 50)
            conn._response_times.append(elapsed_ms)
            if len(conn._response_times) > 50:
                conn._response_times = conn._response_times[-50:]
            conn.avg_response_ms = sum(conn._response_times) / len(conn._response_times)

            if resp.status_code < 400:
                conn.status = "online"

                # Parse table list from the REST API response
                # Supabase PostgREST returns an OpenAPI spec at /rest/v1/
                # The "definitions" or "paths" keys contain table names
                try:
                    data = resp.json()
                    tables = []
                    if isinstance(data, dict):
                        # PostgREST OpenAPI spec: tables are in "definitions"
                        if "definitions" in data:
                            tables = sorted([
                                t for t in data["definitions"].keys()
                                if not t.startswith("_") and t not in ("rpc", "")
                            ])
                        # Alternative: tables are in "paths" as /tablename
                        elif "paths" in data:
                            tables = sorted([
                                p.strip("/") for p in data["paths"].keys()
                                if p.strip("/") and not p.startswith("/rpc")
                            ])
                    conn.tables = tables
                    conn.table_count = len(tables)
                except Exception:
                    pass  # Keep previous table data if parse fails
            else:
                conn.status = "error"
                conn.failed_queries += 1
                self.emit_event(
                    "alert",
                    f"Supabase '{conn.name}' returned HTTP {resp.status_code}",
                    status="warning",
                )

        except Exception as e:
            elapsed_ms = (time.monotonic() - start) * 1000
            conn.last_ping_ms = elapsed_ms
            conn.status = "error"
            conn.failed_queries += 1
            conn.total_queries += 1
            self.emit_event(
                "task_failed",
                f"Supabase '{conn.name}' unreachable: {e}",
                status="error",
            )
            logger.warning("BDAgent: connection '{}' failed: {}", conn.name, e)

    async def _run_loop(self) -> None:
        """Periodic connection health checks."""
        while self._running:
            if self._connections:
                self.status = "running"
                self._metrics["last_task"] = "health_check"

                # Check all connections concurrently
                tasks = [self._check_connection(c) for c in self._connections]
                await asyncio.gather(*tasks, return_exceptions=True)

                # Update overall status
                statuses = [c.status for c in self._connections]
                if all(s == "online" for s in statuses):
                    self.status = "online"
                elif any(s == "error" for s in statuses):
                    self.status = "error"
                else:
                    self.status = "online"
            else:
                # No connections configured — still online, just idle
                self.status = "online"
                self._metrics["last_task"] = "no_connections"

            await asyncio.sleep(self._check_interval)
