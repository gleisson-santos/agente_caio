"""
EventStore — SQLite-backed agent event persistence.

Stores all agent events (start, running, completed, failed, alert) for
real-time feeds and historical auditing.
"""

from __future__ import annotations

import sqlite3
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from loguru import logger

# Default DB path
_DEFAULT_DB = Path.home() / ".nanobot" / "agent_events.db"


class EventStore:
    """Thread-safe SQLite event store for agent events."""

    def __init__(self, db_path: Path | str | None = None):
        self.db_path = Path(db_path) if db_path else _DEFAULT_DB
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        self._init_db()

    def _init_db(self) -> None:
        """Create the events table if it doesn't exist."""
        with self._lock:
            conn = sqlite3.connect(str(self.db_path))
            try:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS agent_events (
                        id TEXT PRIMARY KEY,
                        agent TEXT NOT NULL,
                        event TEXT NOT NULL,
                        status TEXT NOT NULL DEFAULT 'info',
                        message TEXT,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_events_agent
                    ON agent_events(agent)
                """)
                conn.execute("""
                    CREATE INDEX IF NOT EXISTS idx_events_created
                    ON agent_events(created_at DESC)
                """)
                conn.commit()
            finally:
                conn.close()
        logger.debug("EventStore initialized at {}", self.db_path)

    def emit(
        self,
        agent: str,
        event_type: str,
        status: str = "info",
        message: str = "",
    ) -> str:
        """Store a new event. Returns the event ID."""
        event_id = uuid.uuid4().hex[:12]
        now = datetime.now(timezone.utc).isoformat()
        with self._lock:
            conn = sqlite3.connect(str(self.db_path))
            try:
                conn.execute(
                    "INSERT INTO agent_events (id, agent, event, status, message, created_at) "
                    "VALUES (?, ?, ?, ?, ?, ?)",
                    (event_id, agent, event_type, status, message, now),
                )
                conn.commit()
            finally:
                conn.close()
        return event_id

    def upsert(
        self,
        agent: str,
        event_type: str,
        status: str = "info",
        message: str = "",
    ) -> str:
        """Update the latest event for agent+event_type, or insert if none exists.
        
        This prevents event accumulation — keeps only ONE event per agent+type.
        """
        now = datetime.now(timezone.utc).isoformat()
        with self._lock:
            conn = sqlite3.connect(str(self.db_path))
            try:
                # Try to update existing
                cursor = conn.execute(
                    "UPDATE agent_events SET status = ?, message = ?, created_at = ? "
                    "WHERE id = (SELECT id FROM agent_events WHERE agent = ? AND event = ? "
                    "ORDER BY created_at DESC LIMIT 1)",
                    (status, message, now, agent, event_type),
                )
                if cursor.rowcount > 0:
                    conn.commit()
                    # Also clean up any older duplicates for same agent+type
                    conn.execute(
                        "DELETE FROM agent_events WHERE agent = ? AND event = ? "
                        "AND id != (SELECT id FROM agent_events WHERE agent = ? AND event = ? "
                        "ORDER BY created_at DESC LIMIT 1)",
                        (agent, event_type, agent, event_type),
                    )
                    conn.commit()
                    return "updated"
                else:
                    # Insert new
                    event_id = uuid.uuid4().hex[:12]
                    conn.execute(
                        "INSERT INTO agent_events (id, agent, event, status, message, created_at) "
                        "VALUES (?, ?, ?, ?, ?, ?)",
                        (event_id, agent, event_type, status, message, now),
                    )
                    conn.commit()
                    return event_id
            finally:
                conn.close()

    def query(
        self,
        limit: int = 50,
        agent_id: str | None = None,
        event_type: str | None = None,
        since: datetime | None = None,
    ) -> list[dict[str, Any]]:
        """Query events with optional filters."""
        conditions = []
        params: list[Any] = []

        if agent_id:
            conditions.append("agent = ?")
            params.append(agent_id)
        if event_type:
            conditions.append("event = ?")
            params.append(event_type)
        if since:
            conditions.append("created_at >= ?")
            params.append(since.isoformat())

        where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        sql = f"SELECT id, agent, event, status, message, created_at FROM agent_events {where} ORDER BY created_at DESC LIMIT ?"
        params.append(limit)

        with self._lock:
            conn = sqlite3.connect(str(self.db_path))
            conn.row_factory = sqlite3.Row
            try:
                rows = conn.execute(sql, params).fetchall()
                return [dict(row) for row in rows]
            finally:
                conn.close()

    def count_by_type(self, since: datetime | None = None) -> dict[str, int]:
        """Count events grouped by type."""
        params: list[Any] = []
        where = ""
        if since:
            where = "WHERE created_at >= ?"
            params.append(since.isoformat())

        sql = f"SELECT event, COUNT(*) as cnt FROM agent_events {where} GROUP BY event"
        with self._lock:
            conn = sqlite3.connect(str(self.db_path))
            try:
                rows = conn.execute(sql, params).fetchall()
                return {row[0]: row[1] for row in rows}
            finally:
                conn.close()

    def cleanup(self, keep_days: int = 30) -> int:
        """Delete events older than keep_days. Returns count deleted."""
        from datetime import timedelta
        cutoff = (datetime.now(timezone.utc) - timedelta(days=keep_days)).isoformat()
        with self._lock:
            conn = sqlite3.connect(str(self.db_path))
            try:
                cursor = conn.execute(
                    "DELETE FROM agent_events WHERE created_at < ?", (cutoff,)
                )
                conn.commit()
                return cursor.rowcount
            finally:
                conn.close()
