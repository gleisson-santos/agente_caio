"""
Token Agent — monitors token consumption across all LLM API calls.

Data source: hook in LiteLLMProvider._parse_response() → AgentRegistry.record_tokens()
"""

from __future__ import annotations

import asyncio
import time
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from nanobot.agents.sdk import BaseAgent


@dataclass
class TokenRecord:
    """Single token usage record from one LLM call."""
    model: str
    tokens_input: int
    tokens_output: int
    total_tokens: int
    timestamp: float = field(default_factory=time.time)
    agent_source: str = "caio"  # which agent made the call


class TokenAgent(BaseAgent):
    """
    Tracks every LLM API call's token consumption.

    - In-memory ring buffer of recent records
    - Aggregated daily/per-model/per-agent stats
    - Trend calculation
    """

    MAX_RECORDS = 10_000  # keep last N records in memory

    def __init__(self):
        super().__init__(
            agent_id="agent-token",
            name="Agente Token",
            role="Monitor de Consumo de Tokens",
            tier=1,
        )
        self._records: list[TokenRecord] = []
        self._daily_totals: dict[str, int] = defaultdict(int)  # date_str -> total
        self._model_totals: dict[str, int] = defaultdict(int)  # model -> total
        self._agent_totals: dict[str, int] = defaultdict(int)  # agent_source -> total

    def record(self, model: str, usage: dict, agent_source: str = "caio") -> None:
        """Called by AgentRegistry.record_tokens() on every LLM response."""
        if not usage:
            return

        rec = TokenRecord(
            model=model,
            tokens_input=usage.get("prompt_tokens", 0),
            tokens_output=usage.get("completion_tokens", 0),
            total_tokens=usage.get("total_tokens", 0),
            agent_source=agent_source,
        )
        self._records.append(rec)

        # Keep bounded
        if len(self._records) > self.MAX_RECORDS:
            self._records = self._records[-self.MAX_RECORDS:]

        # Update aggregates
        day = datetime.now().strftime("%Y-%m-%d")
        self._daily_totals[day] += rec.total_tokens
        self._model_totals[model] += rec.total_tokens
        self._agent_totals[agent_source] += rec.total_tokens

        # Update status
        self.status = "online"
        self._metrics["last_task"] = f"recorded {rec.total_tokens} tokens ({model})"

    def get_metrics(self) -> dict[str, Any]:
        today = datetime.now().strftime("%Y-%m-%d")
        today_records = [r for r in self._records if datetime.fromtimestamp(r.timestamp).strftime("%Y-%m-%d") == today]
        tokens_today = sum(r.total_tokens for r in today_records)
        calls_today = len(today_records)

        return {
            "tokens_total_today": tokens_today,
            "calls_today": calls_today,
            "tokens_input_today": sum(r.tokens_input for r in today_records),
            "tokens_output_today": sum(r.tokens_output for r in today_records),
            "total_records": len(self._records),
            "trend": self._calculate_trend(),
        }

    def get_stats(self) -> dict[str, Any]:
        """Extended stats for /agent/token/stats endpoint."""
        metrics = self.get_metrics()
        today = datetime.now().strftime("%Y-%m-%d")
        today_records = [r for r in self._records if datetime.fromtimestamp(r.timestamp).strftime("%Y-%m-%d") == today]

        # Model breakdown (today)
        model_breakdown = defaultdict(lambda: {"calls": 0, "tokens": 0})
        for r in today_records:
            model_breakdown[r.model]["calls"] += 1
            model_breakdown[r.model]["tokens"] += r.total_tokens

        # Recent calls (last 20)
        recent = []
        for r in self._records[-20:][::-1]:
            recent.append({
                "model": r.model,
                "input": r.tokens_input,
                "output": r.tokens_output,
                "total": r.total_tokens,
                "agent": r.agent_source,
                "time": datetime.fromtimestamp(r.timestamp).strftime("%H:%M:%S"),
            })

        return {
            **metrics,
            "model_breakdown": dict(model_breakdown),
            "recent_calls": recent,
            "daily_history": dict(self._daily_totals),
        }

    def get_ranking(self) -> list[dict[str, Any]]:
        """Per-agent token ranking for /agent/token/ranking endpoint."""
        ranking = []
        for agent_src, total in sorted(self._agent_totals.items(), key=lambda x: -x[1]):
            ranking.append({
                "agent": agent_src,
                "total_tokens": total,
                "calls": sum(1 for r in self._records if r.agent_source == agent_src),
            })
        return ranking

    def _calculate_trend(self) -> str:
        """Compare today vs yesterday token usage."""
        today = datetime.now().strftime("%Y-%m-%d")
        from datetime import timedelta
        yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        t_today = self._daily_totals.get(today, 0)
        t_yesterday = self._daily_totals.get(yesterday, 0)
        if t_yesterday == 0:
            return "→ estável" if t_today == 0 else "↑ novo"
        diff = ((t_today - t_yesterday) / t_yesterday) * 100
        if diff > 10:
            return f"↑ +{diff:.0f}%"
        elif diff < -10:
            return f"↓ {diff:.0f}%"
        return "→ estável"

    async def _run_loop(self) -> None:
        """Periodic cleanup and trend recalculation."""
        while self._running:
            await asyncio.sleep(60)
            # Compact old records (keep last 7 days)
            cutoff = time.time() - 7 * 86400
            self._records = [r for r in self._records if r.timestamp >= cutoff]
