"""Tool for monitoring and controlling SCI Web Pendencias extractions."""

import json
import os
import subprocess
import psutil
from typing import Any
from pathlib import Path

from nanobot.agent.tools.base import Tool


class PendenciasTool(Tool):
    """
    Tool to check status and control the Especialista em Pendências.
    """

    def __init__(self, workspace: Path):
        # Derive project root from this file's location
        # __file__ = .../Agente_caio/nanobot/agent/tools/pendencias.py
        # project root = 3 levels up from tools/
        _tool_file = Path(__file__).resolve()
        _project_root = _tool_file.parent.parent.parent.parent  # Agente_caio/

        self.workspace = workspace
        self._status_file = _project_root / "nanobot" / "agents" / "extracao_pendencias" / "status.json"
        self._script_path = _project_root / "nanobot" / "agents" / "extracao_pendencias" / "agendador.py"
        self._venv_python = _project_root / ".venv" / "Scripts" / "python.exe"

    @property
    def name(self) -> str:
        return "pendencias_control"

    @property
    def description(self) -> str:
        return "Check status or control (start/stop/run_once) the Especialista em Pendências (SCI Web extraction)."

    @property
    def parameters(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "description": "Action to perform: 'status' (view logs), 'start' (interval loop), 'stop' (kill process), 'run_once' (manual extraction).",
                    "enum": ["status", "start", "stop", "run_once"]
                }
            },
            "required": ["action"]
        }

    async def execute(self, action: str) -> str:
        if action == "status":
            if not self._status_file.exists():
                return "Status file not found. Specialist might have never run."
            try:
                with open(self._status_file, "r") as f:
                    data = json.load(f)
                
                # Check if process is actually running
                active = False
                for proc in psutil.process_iter(['cmdline']):
                    try:
                        c = proc.info.get('cmdline')
                        if c and "agendador.py" in " ".join(c):
                            active = True
                            break
                    except: pass
                
                status_str = "EXECUTANDO" if active else "PARADO"
                msg = f"--- Especialista em Pendências ({status_str}) ---\n"
                msg += f"Detalhe: {data.get('status_detail', 'N/A')}\n"
                msg += f"Última execução: {data.get('last_run', 'N/A')}\n"
                msg += f"Downloads: {data.get('metrics', {}).get('total_downloads', 0)}\n"
                msg += f"Sucessos: {data.get('metrics', {}).get('uploads_ok', 0)}\n"
                msg += f"Erros: {data.get('metrics', {}).get('uploads_error', 0)}"
                return msg
            except Exception as e:
                return f"Error reading status: {e}"

        elif action in ["start", "stop", "run_once"]:
            # Logic similar to api.py
            active_proc = None
            for proc in psutil.process_iter(['pid', 'cmdline']):
                try:
                    c = proc.info.get('cmdline')
                    if c and "agendador.py" in " ".join(c):
                        active_proc = proc
                        break
                except: pass

            if action == "start":
                if active_proc: return "O agendador já está rodando."
                args = [str(self._venv_python), str(self._script_path), "--headless", "--intervalo", "10"]
                subprocess.Popen(args, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP)
                return "Agendador iniciado com sucesso (intervalo 10 min)."

            elif action == "run_once":
                if active_proc: return "Aguarde o agendador atual terminar ou pare-o antes de executar manualmente."
                args = [str(self._venv_python), str(self._script_path), "--headless", "--uma-vez"]
                subprocess.Popen(args, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP)
                return "Extração manual iniciada agora! Acompanhe o status pedindo 'status' daqui a pouco."

            elif action == "stop":
                if not active_proc: return "O agendador já está parado."
                active_proc.terminate()
                return "Agendador interrompido com sucesso."

        return "Invalid action."
