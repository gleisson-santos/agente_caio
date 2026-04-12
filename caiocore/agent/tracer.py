import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Any

logger = logging.getLogger("caiocore.tracer")

class AgentTracer:
    """
    Rastreia a execução do Agente, tempos, tokens e uso de ferramentas.
    Grava os logs em formato JSONL para fácil leitura pelo Dashboard (Monitor)
    """
    def __init__(self, workspace_path: Path):
        self.log_dir = workspace_path / "tracing"
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.trace_file = self.log_dir / "traces.jsonl"

    async def log_thought(
        self,
        session_id: str,
        agent_id: str,
        step: str,
        content: str = "",
        metadata: dict[str, Any] | None = None
    ):
        """Emite um 'pensamento' ou passo intermediário do agente para o Stream SSE."""
        try:
            from caiocore.agents.events import broadcaster
            
            entry = {
                "timestamp": datetime.now().isoformat(),
                "type": "thought",
                "session_id": session_id,
                "agent_id": agent_id,
                "step": step,
                "content": content,
                "metadata": metadata or {}
            }
            
            # Broadcast real-time
            await broadcaster.broadcast(entry)
            
            # Optional: log to file if it's an important step
            if step in ["thought", "tool_call", "tool_result"]:
                with open(self.log_dir / "thoughts.jsonl", "a", encoding="utf-8") as f:
                    f.write(json.dumps(entry, ensure_ascii=False) + "\n")
                    
        except Exception as e:
            logger.error(f"Erro ao emitir thought: {e}")

    def log_run(
        self,
        session_id: str,
        agent_id: str,
        channel: str,
        prompt: str,
        response_content: str,
        tools_used: list[str],
        duration_ms: float,
        model: str = "unknown",
        token_usage: dict[str, int] | None = None
    ):
        """Salva uma execução completa (run) no arquivo de trace."""
        try:
            trace_entry = {
                "timestamp": datetime.now().isoformat(),
                "type": "run_complete",
                "session_id": session_id,
                "agent_id": agent_id,
                "channel": channel,
                "model": model,
                "prompt_preview": prompt[:200] + ("..." if len(prompt) > 200 else ""),
                "response_preview": response_content[:200] + ("..." if len(response_content) > 200 else ""),
                "tools_used": tools_used,
                "duration_ms": round(duration_ms, 2),
                "token_usage": token_usage or {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
            }
            
            with open(self.trace_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(trace_entry, ensure_ascii=False) + "\n")
            
            # Broadcast completion
            import asyncio
            from caiocore.agents.events import broadcaster
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    loop.create_task(broadcaster.broadcast(trace_entry))
            except: pass

        except Exception as e:
            logger.error(f"Erro ao salvar trace: {e}")

    def get_recent_traces(self, limit: int = 50) -> list[dict]:
        """Lê os últimos traces armazenados para exibir no dashboard."""
        if not self.trace_file.exists():
            return []
            
        traces = []
        try:
            with open(self.trace_file, "r", encoding="utf-8") as f:
                lines = f.readlines()
                # Pega as últimas 'limit' linhas, do mais novo (fim do arquivo) ao mais antigo
                for line in reversed(lines[-limit:]):
                    if line.strip():
                        item = json.loads(line)
                        if item.get("type") == "run_complete" or "agent_id" in item:
                             traces.append(item)
        except Exception as e:
            logger.error(f"Erro ao ler traces: {e}")
            
        return traces
