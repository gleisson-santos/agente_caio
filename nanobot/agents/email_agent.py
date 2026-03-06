"""
Email Agent — monitoring specialist for the email channel.

Tracks email channel health: inbox count, unread, last check, errors.
This is a MONITORING agent shown in the Dashboard, not the communication channel.
"""

from __future__ import annotations

import asyncio
import time
from typing import Any

from loguru import logger

from nanobot.agents.sdk import BaseAgent


class EmailAgent(BaseAgent):
    """
    Email monitoring specialist.
    
    Monitors the health of the email channel:
    - Tracks unread count, last check, errors
    - Reports status to the Dashboard
    - Attempts IMAP connectivity test every 60s
    """

    def __init__(self, config: dict | None = None):
        super().__init__(
            agent_id="spec-email",
            name="Esp. Email",
            role="Security Guard",
            tier=2,
        )
        self._config = config or {}
        self._check_interval = 60  # seconds
        self._last_check: str = "—"
        self._unread_count: int = 0
        self._errors_24h: int = 0
        self._connection_ok: bool = False

    def get_metrics(self) -> dict[str, Any]:
        return {
            "unread": self._unread_count,
            "last_check": self._last_check,
            "errors_24h": self._errors_24h,
            "connection_ok": self._connection_ok,
            "imap_host": self._config.get("imap_host", "—"),
        }

    async def _test_imap_connection(self) -> bool:
        """Test IMAP connectivity without fetching messages."""
        import imaplib
        host = self._config.get("imap_host", "")
        port = self._config.get("imap_port", 993)
        username = self._config.get("imap_username", "")
        password = self._config.get("imap_password", "")
        use_ssl = self._config.get("imap_use_ssl", True)
        
        if not host or not username or not password:
            return False
        
        try:
            def _connect():
                if use_ssl:
                    client = imaplib.IMAP4_SSL(host, port)
                else:
                    client = imaplib.IMAP4(host, port)
                client.login(username, password)
                status, data = client.select("INBOX")
                # Get unread count
                status2, data2 = client.search(None, "UNSEEN")
                unread = len(data2[0].split()) if status2 == "OK" and data2[0] else 0
                client.logout()
                return unread
            
            unread = await asyncio.wait_for(
                asyncio.to_thread(_connect),
                timeout=15.0
            )
            self._unread_count = unread
            return True
        except Exception as e:
            logger.warning("EmailAgent: IMAP test failed: {}", e)
            self._errors_24h += 1
            return False

    async def _run_loop(self) -> None:
        """Periodic IMAP health check."""
        await asyncio.sleep(10)  # Wait for system to stabilize
        
        while self._running:
            try:
                self.status = "running"
                self._metrics["last_task"] = "imap_health_check"
                
                ok = await self._test_imap_connection()
                self._connection_ok = ok
                self._last_check = time.strftime("%H:%M:%S")
                
                if ok:
                    self.status = "online"
                    self.emit_event_upsert(
                        "heartbeat",
                        f"IMAP OK — {self._unread_count} não lidos",
                        status="info"
                    )
                else:
                    self.status = "error"
                    self.emit_event_upsert(
                        "alert",
                        "IMAP connection failed — verificar credenciais",
                        status="warning"
                    )
                    
            except Exception as e:
                self.status = "error"
                logger.error("EmailAgent: loop error: {}", e)
            
            await asyncio.sleep(self._check_interval)
