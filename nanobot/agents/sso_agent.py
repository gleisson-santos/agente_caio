"""
SSO Agent — VPS / server metrics monitoring.

Collects OS-level metrics (CPU, RAM, Disk, Network, Uptime) using psutil.
Falls back to subprocess commands if psutil is not available.
"""

from __future__ import annotations

import asyncio
import platform
import time
from datetime import datetime, timezone
from typing import Any

from loguru import logger

from nanobot.agents.sdk import BaseAgent

# Try psutil, fall back to OS commands
try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False
    logger.warning("SSOAgent: psutil not installed — using OS command fallback")


class SSOAgent(BaseAgent):
    """
    VPS / server monitoring agent.

    Collects system metrics every N seconds:
    - CPU usage %
    - Memory usage %
    - Disk usage %
    - Network I/O
    - System uptime
    - Load average (Linux/Mac)

    Emits alerts when thresholds are exceeded.
    """

    # Thresholds for alerts
    CPU_ALERT = 90
    MEMORY_ALERT = 85
    DISK_ALERT = 90

    def __init__(self, metrics_interval: int = 10):
        super().__init__(
            agent_id="agent-sso",
            name="Agente SSO",
            role="Monitor de Infraestrutura VPS",
            tier=1,
        )
        self._interval = metrics_interval
        self._current: dict[str, Any] = {}
        self._history: list[dict[str, Any]] = []  # last 360 snapshots (1 hour at 10s)
        self._alerts_emitted: set[str] = set()  # dedup alerts
        
        # Initial collection to avoid zero-metrics on startup
        try:
            if HAS_PSUTIL:
                self._current = self._collect_psutil()
            else:
                self._current = self._collect_fallback()
        except Exception:
            self._current = {}

    def get_metrics(self) -> dict[str, Any]:
        return dict(self._current) if self._current else {
            "cpu": 0, "memory": 0, "disk": 0,
            "uptime": "0s", "ping": "—",
            "hostname": platform.node(),
            "os": f"{platform.system()} {platform.release()}",
        }

    def get_detailed_metrics(self) -> dict[str, Any]:
        """Extended metrics for /agent/server/metrics endpoint."""
        return {
            "current": self.get_metrics(),
            "history": self._history[-60:],  # last 10 minutes
            "hostname": platform.node(),
            "os": f"{platform.system()} {platform.release()}",
            "python": platform.python_version(),
            "arch": platform.machine(),
        }

    def _collect_psutil(self) -> dict[str, Any]:
        """Collect metrics using psutil."""
        cpu = psutil.cpu_percent(interval=1)
        mem = psutil.virtual_memory()
        disk = psutil.disk_usage("/")

        # Network I/O
        net = psutil.net_io_counters()
        net_sent_mb = round(net.bytes_sent / 1_048_576, 1)
        net_recv_mb = round(net.bytes_recv / 1_048_576, 1)

        # Uptime
        boot = psutil.boot_time()
        uptime_secs = int(time.time() - boot)

        # Load average (not available on Windows)
        try:
            load = psutil.getloadavg()
            load_str = f"{load[0]:.1f} / {load[1]:.1f} / {load[2]:.1f}"
        except (AttributeError, OSError):
            load_str = "N/A"

        return {
            "cpu": round(cpu, 1),
            "memory": round(mem.percent, 1),
            "memory_used_gb": round(mem.used / 1_073_741_824, 1),
            "memory_total_gb": round(mem.total / 1_073_741_824, 1),
            "disk": round(disk.percent, 1),
            "disk_used_gb": round(disk.used / 1_073_741_824, 1),
            "disk_total_gb": round(disk.total / 1_073_741_824, 1),
            "net_sent_mb": net_sent_mb,
            "net_recv_mb": net_recv_mb,
            "uptime": self._format_uptime(uptime_secs),
            "uptime_seconds": uptime_secs,
            "load": load_str,
            "hostname": platform.node(),
            "os": f"{platform.system()} {platform.release()}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def _collect_fallback(self) -> dict[str, Any]:
        """Collect metrics using OS commands (fallback when psutil unavailable)."""
        import subprocess

        metrics: dict[str, Any] = {
            "hostname": platform.node(),
            "os": f"{platform.system()} {platform.release()}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        if platform.system() == "Windows":
            # Windows: use wmic/powershell
            try:
                # CPU
                result = subprocess.run(
                    ["powershell", "-Command",
                     "(Get-CimInstance Win32_Processor).LoadPercentage"],
                    capture_output=True, text=True, timeout=5
                )
                metrics["cpu"] = float(result.stdout.strip()) if result.stdout.strip() else 0
            except Exception:
                metrics["cpu"] = 0

            try:
                # Memory
                result = subprocess.run(
                    ["powershell", "-Command",
                     "$m=Get-CimInstance Win32_OperatingSystem; "
                     "[math]::Round(($m.TotalVisibleMemorySize - $m.FreePhysicalMemory) / $m.TotalVisibleMemorySize * 100, 1)"],
                    capture_output=True, text=True, timeout=5
                )
                metrics["memory"] = float(result.stdout.strip()) if result.stdout.strip() else 0
            except Exception:
                metrics["memory"] = 0

            try:
                # Disk
                result = subprocess.run(
                    ["powershell", "-Command",
                     "$d=Get-PSDrive C; [math]::Round(($d.Used / ($d.Used + $d.Free)) * 100, 1)"],
                    capture_output=True, text=True, timeout=5
                )
                metrics["disk"] = float(result.stdout.strip()) if result.stdout.strip() else 0
            except Exception:
                metrics["disk"] = 0

            metrics["uptime"] = "N/A"
            metrics["load"] = "N/A"
        else:
            # Linux/Mac
            try:
                import os
                load = os.getloadavg()
                metrics["load"] = f"{load[0]:.1f} / {load[1]:.1f} / {load[2]:.1f}"
                # Rough CPU from load
                cpu_count = os.cpu_count() or 1
                metrics["cpu"] = round(min(load[0] / cpu_count * 100, 100), 1)
            except Exception:
                metrics["cpu"] = 0
                metrics["load"] = "N/A"

            try:
                result = subprocess.run(["free", "-b"], capture_output=True, text=True, timeout=5)
                lines = result.stdout.strip().split("\n")
                if len(lines) >= 2:
                    parts = lines[1].split()
                    total = int(parts[1])
                    used = int(parts[2])
                    metrics["memory"] = round(used / total * 100, 1) if total > 0 else 0
            except Exception:
                metrics["memory"] = 0

            try:
                result = subprocess.run(["df", "-B1", "/"], capture_output=True, text=True, timeout=5)
                lines = result.stdout.strip().split("\n")
                if len(lines) >= 2:
                    parts = lines[1].split()
                    metrics["disk"] = float(parts[4].rstrip("%"))
            except Exception:
                metrics["disk"] = 0

            try:
                result = subprocess.run(["uptime", "-s"], capture_output=True, text=True, timeout=5)
                boot_str = result.stdout.strip()
                boot_dt = datetime.strptime(boot_str, "%Y-%m-%d %H:%M:%S")
                uptime_secs = int((datetime.now() - boot_dt).total_seconds())
                metrics["uptime"] = self._format_uptime(uptime_secs)
            except Exception:
                metrics["uptime"] = "N/A"

        return metrics

    def _check_thresholds(self, metrics: dict[str, Any]) -> None:
        """Emit alerts if thresholds are exceeded."""
        checks = [
            ("cpu", self.CPU_ALERT, "CPU"),
            ("memory", self.MEMORY_ALERT, "Memória"),
            ("disk", self.DISK_ALERT, "Disco"),
        ]
        for key, threshold, label in checks:
            val = metrics.get(key, 0)
            alert_key = f"{key}_high"
            if val > threshold:
                if alert_key not in self._alerts_emitted:
                    self._alerts_emitted.add(alert_key)
                    self.emit_event_upsert(
                        "alert",
                        f"{label} em {val}% (threshold: {threshold}%)",
                        status="warning",
                    )
            else:
                self._alerts_emitted.discard(alert_key)

    @staticmethod
    def _format_uptime(seconds: int) -> str:
        if seconds < 60:
            return f"{seconds}s"
        if seconds < 3600:
            return f"{seconds // 60}m"
        hours = seconds // 3600
        if hours < 24:
            return f"{hours}h {(seconds % 3600) // 60}m"
        days = hours // 24
        return f"{days}d {hours % 24}h"

    async def _run_loop(self) -> None:
        """Collect metrics every N seconds."""
        while self._running:
            try:
                self.status = "running"
                self._metrics["last_task"] = "collecting_metrics"

                if HAS_PSUTIL:
                    snapshot = self._collect_psutil()
                else:
                    snapshot = self._collect_fallback()

                self._current = snapshot
                self._history.append(snapshot)

                # Keep bounded (1 hour at 10s intervals = 360 snapshots)
                if len(self._history) > 360:
                    self._history = self._history[-360:]

                # Check thresholds
                self._check_thresholds(snapshot)

                self.status = "online"

            except Exception as e:
                self.status = "error"
                logger.error("SSOAgent: collection error: {}", e)
                self.emit_event("task_failed", f"Metrics collection failed: {e}", status="error")

            await asyncio.sleep(self._interval)
