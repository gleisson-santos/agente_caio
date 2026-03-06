"""
Nanobot Gateway API — serves real monitoring agent data.

Routes:
  /api/status          — aggregate status of all agents
  /api/agents          — list all agents with status
  /api/agent/{id}/status — individual agent status
  /api/agent/token/stats — token consumption stats
  /api/agent/token/ranking — per-agent token ranking
  /api/agent/db/status — database agent status
  /api/agent/db/metrics — database metrics
  /api/agent/db/connections — connection details
  /api/agent/life/health — health matrix
  /api/agent/life/alerts — active alerts
  /api/agent/server/metrics — VPS metrics (CPU/RAM/Disk)
  /api/agent/heartbeat — POST heartbeat from external agent
  /events              — real-time event feed
  /api/notify          — send Telegram notification
  /api/extras/generate/{type} — run extra scripts
"""

import asyncio
import os
import subprocess
import signal
import psutil
from pathlib import Path as _Path
from datetime import datetime, timezone
import time
import uuid
from typing import Any, List, Optional

import json
from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loguru import logger

# Get logger (for pydantic, if needed, otherwise loguru is primary)
# logger = logging.get_logger(__name__) # Keeping loguru as primary logger

from nanobot.server.chat_handler import router as chat_router

app = FastAPI(title="Nanobot Gateway API", version="2.0.0")

app.include_router(chat_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store references to gateway components
_agent = None
_bus = None
_config = None
_cron = None
_channels = None
_doc_agent = None
_start_time = datetime.now(timezone.utc)


# ── Pydantic models ─────────────────────────────────────────────────

class NotificationRequest(BaseModel):
    title: str
    message: str
    type: str = "info"
    chat_id: Optional[str] = None


class HeartbeatRequest(BaseModel):
    agent: str
    status: str = "online"
    response_time: Optional[float] = None
    last_task: Optional[str] = None


# ── Helpers ──────────────────────────────────────────────────────────

def _get_registry():
    from nanobot.agents.registry import agent_registry
    return agent_registry


def _get_event_store():
    reg = _get_registry()
    return reg._event_store


def _uptime_str() -> str:
    delta = datetime.now(timezone.utc) - _start_time
    secs = int(delta.total_seconds())
    if secs < 60:
        return f"{secs}s"
    if secs < 3600:
        return f"{secs // 60}m {secs % 60}s"
    hours = secs // 3600
    mins = (secs % 3600) // 60
    return f"{hours}h {mins}m"


# ── Pendencias Agent endpoints ───────────────────────────────────────

_pendencias_proc = None

def _get_pendencias_status():
    """Helper to read pendencias status.json and check process."""
    status_file = os.path.join(os.path.dirname(__file__), "..", "agents", "extracao_pendencias", "status.json")
    data = {
        "status": "offline",
        "status_detail": "Parado",
        "last_run": None,
        "next_run": None,
        "metrics": {
            "total_downloads": 0,
            "uploads_ok": 0,
            "uploads_error": 0,
            "last_duration": None
        }
    }
    
    if os.path.exists(status_file):
        try:
            with open(status_file, "r", encoding="utf-8") as f:
                data.update(json.load(f))
        except: pass

    # Check if process is actually running
    is_running = False
    global _pendencias_proc
    if _pendencias_proc and _pendencias_proc.poll() is None:
        is_running = True
    else:
        # Search for any process running agendador.py in this folder
        for proc in psutil.process_iter(['pid', 'cmdline']):
            try:
                cmd = proc.info.get('cmdline')
                if cmd and "agendador.py" in " ".join(cmd):
                    is_running = True
                    break
            except: pass

    if not is_running:
        data["status"] = "offline"
        data["status_detail"] = "Parado"
    
    return data
class PendenciasControl(BaseModel):
    command: str

@app.get("/api/agent/pendencias/status")
async def get_pendencias_status():
    return _get_pendencias_status()

@app.post("/api/agent/pendencias/control")
async def control_pendencias(action: PendenciasControl):
    global _pendencias_proc
    cmd = action.command.strip()
    logger.info(f"Pendencias control - command received: '{cmd}' (len={len(cmd)})")
    
    script_path = os.path.join(os.path.dirname(__file__), "..", "agents", "extracao_pendencias", "agendador.py")
    venv_python = os.path.join(os.path.dirname(__file__), "..", "..", ".venv", "Scripts", "python.exe")

    # Check if any agendador.py is already running
    active_proc = None
    for proc in psutil.process_iter(['pid', 'cmdline']):
        try:
            c = proc.info.get('cmdline')
            if c and "agendador.py" in " ".join(c):
                active_proc = proc
                break
        except: pass

    if cmd == "start":
        if active_proc:
            return {"status": "error", "message": "O agendador já está rodando."}
            
        args = [venv_python, script_path, "--headless", "--intervalo", "10"]
        _pendencias_proc = subprocess.Popen(args, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP)
        return {"status": "success", "message": "Agendador iniciado (10 min)."}
        
    elif cmd == "run_once":
        if active_proc:
            return {"status": "error", "message": "Aguarde o agendador atual terminar ou pare-o antes de executar manualmente."}
            
        args = [venv_python, script_path, "--headless", "--uma-vez"]
        _pendencias_proc = subprocess.Popen(args, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP)
        return {"status": "success", "message": "Extração manual iniciada agora!"}

    elif cmd == "stop":
        if not active_proc:
            return {"status": "success", "message": "O agendador não estava rodando."}
        
        try:
            active_proc.terminate()
            _pendencias_proc = None
            return {"status": "success", "message": "Agendador interrompido."}
        except Exception as e:
            return {"status": "error", "message": f"Erro ao parar: {e}"}
        
    return {"status": "error", "message": "Comando inválido"}


# ── Core endpoints ──────────────────────────────────────────────────

@app.get("/api/chat/ping")
async def chat_ping():
    """Diagnóstico rápido do Web Chat."""
    return {
        "agent_available": _agent is not None,
        "model": getattr(_agent, 'model', 'desconhecido') if _agent else None,
        "status": "pronto" if _agent else "aguardando_inicialização",
    }


@app.get("/api/status")
async def get_status():
    """Aggregate status of all monitoring agents + services."""
    registry = _get_registry()
    life_agent = registry.get("agent-life")
    
    # Base count includes Caio CEO
    caio_online = 1 if _agent else 0
    online = caio_online
    total = 1 # Start with Caio CEO

    # Use health matrix if life agent is available
    if life_agent:
        health = life_agent.get_health_matrix()
        # LifeAgent health matrix now includes itself and all others
        online += sum(1 for a in health if a.get("status") in ("online", "running", "aguardando", "executando"))
        total += len(health)
    else:
        agents = registry.list_all()
        online += sum(1 for a in agents if a.get("status") in ("online", "running", "executando"))
        total += len(agents)

    # Token metrics
    token_agent = registry.get("agent-token")
    tokens_today = 0
    if token_agent:
        metrics = token_agent.get_metrics()
        tokens_today = metrics.get("tokens_total_today", 0)

    # Life alerts
    alerts = 0
    if life_agent:
        alerts = life_agent.get_metrics().get("alerts_active", 0)

    # Services status
    # ... (rest of the services logic remains same)
    services = []
    if _config and hasattr(_config, "channels") and _config.channels:
        tg = getattr(_config.channels, "telegram", None)
        if tg and tg.enabled:
            services.append({
                "id": "tg", "name": "Telegram",
                "status": "online", "uptime": _uptime_str(), "response": "~120ms",
            })
        email = getattr(_config.channels, "email", None)
        if email and email.enabled:
            services.append({
                "id": "email", "name": "Email",
                "status": "online", "uptime": _uptime_str(), "response": "~4s",
            })

    return {
        "status": "online",
        "agents_online": online,
        "agents_total": total,
        "tokens_today": tokens_today,
        "alerts": alerts,
        "uptime": _uptime_str(),
        "services": services,
    }

@app.get("/api/agents")
async def get_agents():
    """List all registered monitoring agents with real status."""
    registry = _get_registry()
    life_agent = registry.get("agent-life")
    
    live_agents = []
    if life_agent:
        # LifeAgent provides the most accurate status for both active and passive agents
        live_agents = life_agent.get_health_matrix()
        # Transform keys to match expected output (agent_id -> agent)
        for a in live_agents:
            # Check if agent_id exists before popping to avoid KeyError on repeat calls
            if "agent_id" in a:
                a["agent"] = a.pop("agent_id")
    else:
        live_agents = registry.list_all()

    # Add Caio (CEO) as virtual agent (the main orchestrator)
    caio = {
        "agent": "caio-ceo",
        "name": "Agente Caio",
        "role": "Orquestrador Central",
        "tier": 0,
        "status": "online" if _agent else "offline",
        "last_update": datetime.now(timezone.utc).isoformat(),
        "uptime": _uptime_str(),
        "metrics": {
            "model": getattr(_agent, "model", "unknown") if _agent else "unknown",
        },
    }


    # Add Pendencias (Extraction) Agent data
    try:
        pend_data = _get_pendencias_status()
        pend_agent = {
            "agent": "spec-pendencias",
            "name": "Especialista em Pendências",
            "role": "Data Extractor",
            "tier": 2,
            "status": pend_data["status"],
            "status_detail": pend_data["status_detail"],
            "last_update": pend_data.get("last_run", datetime.now(timezone.utc).isoformat()),
            "metrics": pend_data["metrics"],
            "monitor_data": {
                "last_run": pend_data.get("last_run"),
                "next_run": pend_data.get("next_run")
            }
        }
        live_agents.append(pend_agent)
    except Exception as e:
        logger.error(f"Error adding pendencias agent: {e}")

    return [caio] + live_agents




@app.get("/api/agent/{agent_id}/status")
async def get_agent_status(agent_id: str):
    """Get status of a specific agent."""
    registry = _get_registry()

    # Handle Caio CEO
    if agent_id == "caio-ceo":
        return {
            "agent": "caio-ceo",
            "name": "Agente Caio",
            "role": "Orquestrador Central",
            "tier": 0,
            "status": "online" if _agent else "offline",
            "last_update": datetime.now(timezone.utc).isoformat(),
            "uptime": _uptime_str(),
            "metrics": {},
        }

    agent = registry.get(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
    return agent.get_status()


# ── Token Agent endpoints ───────────────────────────────────────────

@app.get("/api/agent/token/stats")
async def get_token_stats():
    """Token consumption statistics."""
    registry = _get_registry()
    agent = registry.get("agent-token")
    if not agent:
        raise HTTPException(status_code=404, detail="Token agent not running")
    return agent.get_stats()


@app.get("/api/agent/token/ranking")
async def get_token_ranking():
    """Per-agent token consumption ranking."""
    registry = _get_registry()
    agent = registry.get("agent-token")
    if not agent:
        raise HTTPException(status_code=404, detail="Token agent not running")
    return agent.get_ranking()


# ── Email Agent endpoints ───────────────────────────────────────────

@app.get("/api/agent/email/inbox")
async def get_email_inbox():
    """Get recent emails from the IMAP inbox cache."""
    if not _channels:
        return {"inbox": []}
    email_ch = _channels.get_channel("email")
    if not email_ch:
        return {"inbox": []}
    
    recent = email_ch.get_recent_emails(5)
    inbox = []
    for item in recent:
        inbox.append({
            "from": item.get("sender", "(Desconhecido)"),
            "subject": item.get("subject", "(Sem assunto)"),
            "priority": "normal",
            "time": item.get("time", ""),
            "read": False,
            "body": item.get("body", ""),
        })
    return {"inbox": inbox}


# ── Schedule Agent endpoints ──────────────────────────────────────────

@app.get("/api/agent/schedule/data")
async def get_schedule_data():
    """Get live cron jobs and upcoming Google Calendar events."""
    crons = []
    events = []
    metrics = {"activeCrons": 0, "eventsToday": 0}
    
    if _cron:
        jobs = _cron.list_jobs(include_disabled=True)
        for j in jobs:
            try:
                # Format lastRun and nextRun
                last_run = ""
                if j.state.last_run_at_ms:
                    last_run = datetime.fromtimestamp(j.state.last_run_at_ms / 1000).strftime("%H:%M")
                
                next_run = ""
                if j.state.next_run_at_ms:
                    next_run = datetime.fromtimestamp(j.state.next_run_at_ms / 1000).strftime("%H:%M")

                expr = j.schedule.expr if j.schedule.kind == "cron" else f"{j.schedule.kind}"
                crons.append({
                    "name": j.name,
                    "expr": expr,
                    "status": "active" if j.enabled else "stopped",
                    "lastRun": last_run,
                    "nextRun": next_run
                })
                if j.enabled:
                    metrics["activeCrons"] += 1
            except Exception as e:
                logger.error(f"Error parsing cron {j.name}: {e}")
                
    # Fetch upcoming Google Calendar events
    try:
        from nanobot.agent.tools.google_calendar import GoogleCalendarTool
        import json
        
        gc_tool = GoogleCalendarTool()
        try:
            service = gc_tool._get_service()
            events_json = gc_tool._list_events(service, max_results=10)
            events_data = json.loads(events_json)
        except Exception as err:
            logger.warning(f"Google Calendar not authenticated or failed: {err}")
            events_data = {"events": []}
            
        now_date = datetime.now().astimezone().date()
        
        for e in events_data.get("events", []):
            start = e.get("start")
            title = e.get("summary", "Sem Título")
            
            time_str = ""
            urgent = False
            if start:
                try:
                    dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
                    dt = dt.astimezone() # convert to local time
                    if dt.date() == now_date:
                        metrics["eventsToday"] += 1
                        time_str = dt.strftime("%H:%M")
                        
                        # Mark urgent if within 2 hours
                        diff = (dt - datetime.now().astimezone()).total_seconds()
                        if 0 <= diff <= 7200:
                            urgent = True
                    else:
                        time_str = dt.strftime("%d/%m %H:%M")
                except Exception:
                    time_str = start
            
            events.append({
                "title": title,
                "time": time_str,
                "location": str(e.get("location", "—")),
                "urgent": urgent
            })
    except Exception as e:
        logger.warning(f"Could not load Google Calendar tools: {e}")
        
    return {
        "metrics": metrics,
        "crons": crons,
        "upcomingEvents": events
    }





# ── BD Agent endpoints ──────────────────────────────────────────────

@app.get("/api/agent/db/status")
async def get_db_status():
    """Database agent status."""
    registry = _get_registry()
    agent = registry.get("agent-bd")
    if not agent:
        raise HTTPException(status_code=404, detail="BD agent not running")
    return agent.get_status()


@app.get("/api/agent/db/metrics")
async def get_db_metrics():
    """Database metrics (response time, queries, errors)."""
    registry = _get_registry()
    agent = registry.get("agent-bd")
    if not agent:
        raise HTTPException(status_code=404, detail="BD agent not running")
    return agent.get_metrics()


@app.get("/api/agent/db/connections")
async def get_db_connections():
    """Detailed connection status for each Supabase database."""
    registry = _get_registry()
    agent = registry.get("agent-bd")
    if not agent:
        raise HTTPException(status_code=404, detail="BD agent not running")
    return agent.get_connection_status()


# ── Life Agent endpoints ────────────────────────────────────────────

@app.get("/api/agent/life/health")
async def get_life_health():
    """Health matrix of all supervised agents."""
    registry = _get_registry()
    agent = registry.get("agent-life")
    if not agent:
        raise HTTPException(status_code=404, detail="Life agent not running")
    return {
        "matrix": agent.get_health_matrix(),
        "metrics": agent.get_metrics(),
    }


@app.get("/api/agent/life/alerts")
async def get_life_alerts():
    """Active and recent alerts."""
    registry = _get_registry()
    agent = registry.get("agent-life")
    if not agent:
        raise HTTPException(status_code=404, detail="Life agent not running")
    return agent.get_alerts()


# ── SSO Agent endpoints ─────────────────────────────────────────────

@app.get("/api/agent/server/metrics")
async def get_server_metrics():
    """VPS / server metrics (CPU, RAM, Disk, Network, Uptime)."""
    registry = _get_registry()
    agent = registry.get("agent-sso")
    if not agent:
        raise HTTPException(status_code=404, detail="SSO agent not running")
    return agent.get_detailed_metrics()


# ── Heartbeat endpoint ──────────────────────────────────────────────

@app.post("/api/agent/heartbeat")
async def post_heartbeat(req: HeartbeatRequest):
    """Receive heartbeat from an external agent."""
    event_store = _get_event_store()
    if event_store:
        event_store.emit(
            agent=req.agent,
            event_type="heartbeat",
            status=req.status,
            message=f"Heartbeat from {req.agent}: {req.status}",
        )
    return {"received": True, "agent": req.agent}


# ── Events endpoint ─────────────────────────────────────────────────

@app.get("/events")
async def get_events(
    limit: int = Query(50, ge=1, le=200),
    agent_id: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
):
    """Real-time event feed from all agents."""
    event_store = _get_event_store()
    if not event_store:
        return []
    return event_store.query(
        limit=limit,
        agent_id=agent_id,
        event_type=event_type,
    )


# ── Existing endpoints (notify, extras, tasks) ─────────────────────

# (tasks API moved to dedicated section below)

@app.post("/api/extras/generate/{script_type}")
async def generate_extra(script_type: str, background_tasks: BackgroundTasks):
    """Execute document generator scripts."""
    scripts = {
        "pdf": "generate_pdf.py",
        "pptx": "generate_pptx.py",
        "xlsx": "generate_xlsx.py",
        "docx": "generate_docx.py",
    }

    if script_type not in scripts:
        raise HTTPException(status_code=404, detail="Script type not found")

    # Check new path first, fallback to old
    script_name = scripts[script_type]
    new_path = os.path.join(os.getcwd(), "nanobot", "documentos", "generators", script_name)
    old_path = os.path.join(os.getcwd(), "nanobot", "extras", script_name)
    script_path = new_path if os.path.exists(new_path) else old_path

    if not os.path.exists(script_path):
        raise HTTPException(status_code=500, detail=f"Script file {script_name} missing")

    out_dir = os.path.join(os.getcwd(), "out")
    os.makedirs(out_dir, exist_ok=True)

    def run_script():
        try:
            logger.info("Docs: Running generator {}", script_path)
            subprocess.run([_sys.executable, script_path], check=True, cwd=os.getcwd())
            logger.info("Docs: Generator {} completed", script_name)
        except Exception as e:
            logger.error("Docs: Error running {}: {}", script_name, e)

    background_tasks.add_task(run_script)
    return {"message": f"Execution of {script_type} generator started in background"}


# ── Documents API ────────────────────────────────────────────────────

import sys as _sys
from pathlib import Path as _Path
import shutil

_DOCS_OUT = os.path.join(os.getcwd(), "out")
_DOCS_TEMPLATES = os.path.join(os.getcwd(), "nanobot", "documentos", "templates")

_DOC_ICONS = {
    ".pdf": "📕", ".pptx": "📊", ".xlsx": "📗", ".docx": "📘",
    ".md": "📝", ".txt": "📄", ".csv": "📋",
    ".html": "🌐", ".bat": "⚙️", ".sh": "⚙️"
}


@app.get("/api/documents")
async def list_documents():
    """List all generated documents from out/ directory and recover strays."""
    docs = []
    
    # Check both the project local /out and the global agent workspace /out
    out_dir_local = _Path(_DOCS_OUT)
    out_dir_agent = _Path(os.path.expanduser("~")) / ".nanobot" / "workspace" / "out"
    
    # Optional fallback for the user's desktop folder 'Direta' to ensure files are visible
    desktop_direta = _Path(os.path.expanduser("~")) / "Desktop" / "Direta"
    stray_desktop_pdf = _Path(os.path.expanduser("~")) / "Desktop" / "PDF_20260305_211524.pdf"
    
    # Recover stray PDF from desktop
    if stray_desktop_pdf.exists():
        try:
            shutil.move(str(stray_desktop_pdf), str(out_dir / stray_desktop_pdf.name))
        except Exception:
            pass

    # Recover direty files from Direta folder
    if desktop_direta.exists():
        for f in desktop_direta.iterdir():
            if f.is_file() and f.suffix.lower() in _DOC_ICONS:
                try:
                    shutil.copy2(str(f), str(out_dir_local / f.name))
                except Exception:
                    pass

    seen_files = set()
    
    # Process files from both directories
    for search_dir in [out_dir_local, out_dir_agent]:
        if search_dir.exists():
            for f in sorted(search_dir.iterdir(), key=lambda x: x.stat().st_mtime, reverse=True):
                if f.is_file() and not f.name.startswith(".") and f.name not in seen_files:
                    seen_files.add(f.name)
                    stat = f.stat()
                    ext = f.suffix.lower()
                    docs.append({
                        "name": f.name,
                        "icon": _DOC_ICONS.get(ext, "📄"),
                        "size": stat.st_size,
                        "sizeFormatted": f"{stat.st_size / 1024:.1f} KB" if stat.st_size < 1048576 else f"{stat.st_size / 1048576:.1f} MB",
                        "createdAt": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                        "type": ext.lstrip("."),
                        "status": "ready",
                        "fullPath": str(f)
                    })
    
    # Sort final combined list by date
    docs.sort(key=lambda x: x["createdAt"], reverse=True)
    return docs

@app.get("/api/documents/templates")
async def list_templates():
    """List available document templates."""
    templates_dir = _Path(_DOCS_TEMPLATES)
    templates = []
    template_meta = {
        "contrato_prestacao.md": {
            "title": "Contrato de Prestação de Serviços",
            "description": "Modelo completo com cláusulas padrão",
            "icon": "⚖️", "category": "legal",
        },
        "procuracao.md": {
            "title": "Procuração",
            "description": "Instrumento particular de procuração",
            "icon": "📜", "category": "legal",
        },
        "relatorio_gerencial.md": {
            "title": "Relatório Gerencial",
            "description": "Estrutura com KPIs, análises e recomendações",
            "icon": "📊", "category": "empresarial",
        },
        "ata_reuniao.md": {
            "title": "Ata de Reunião",
            "description": "Registro de participantes, deliberações e encaminhamentos",
            "icon": "📋", "category": "empresarial",
        },
    }
    if not _doc_agent:
        from nanobot.documentos.engine import get_templates
        return get_templates()
    return _doc_agent.get_templates()


@app.get("/api/documents/templates/{template_id}")
async def get_template_detail(template_id: str):
    if not _doc_agent:
        from nanobot.documentos.engine import get_template_content
        return get_template_content(template_id)
    return _doc_agent.get_template_detail(template_id)


class DocGenerateRequest(BaseModel):
    type: str  # pdf, pptx, xlsx, docx
    title: str = ""
    description: str = ""
    template_id: str = ""


@app.post("/api/documents/generate")
async def generate_document(req: dict):
    """Generate a document (DocAgent quick flow)."""
    if not _doc_agent:
        raise HTTPException(status_code=503, detail="DocAgent not initialized")
    try:
        doc_type = req.get("type", "docx")
        result = _doc_agent.generate_quick(doc_type)
        return result
    except Exception as e:
        logger.error(f"Error generating document: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/documents/ai-generate")
async def ai_generate_document(req: dict, background_tasks: BackgroundTasks):
    """Generate a document using CAIO (IA) content + Engine formatting."""
    if not _agent or not _doc_agent:
        raise HTTPException(status_code=503, detail="Agents not initialized")

    prompt = req.get("prompt")
    format = req.get("format", "docx")
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    try:
        # 1. Ask Caio to generate the content
        # We use a specialized system prompt for Caio to generate clean Markdown
        system_instructions = (
            "Você é o Especialista em Documentos. Sua tarefa é gerar o CONTEÚDO de um documento em formato Markdown.\n"
            "Use cabeçalhos (# ##), listas, tabelas e parágrafos claros.\n"
            "NÃO use introduções conversacionais como 'Aqui está o documento'. Comece direto no título.\n"
            "IMPORTANTE: Se for um contrato, use cláusulas. Se for relatório, use seções de análise."
        )
        full_prompt = f"{system_instructions}\n\nDocumento solicitado: {prompt}"
        
        # Call CAIO (the main agent)
        ai_content = await _agent.process_direct(full_prompt, session_key="doc_gen")
        
        # 2. Use engine to create the real file from AI text
        from nanobot.documentos.engine import generate_from_ai_content
        doc_id = f"AI_{int(time.time())}"
        filepath = generate_from_ai_content(ai_content, doc_format=format, title=doc_id)
        
        return {
            "status": "success",
            "doc_id": doc_id,
            "filename": os.path.basename(filepath),
            "content_preview": ai_content[:200] + "..."
        }
    except Exception as e:
        logger.error(f"AI generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/documents/from-template")
async def generate_from_template(req: dict):
    """Generate a document based on a template with AI filling it."""
    if not _agent or not _doc_agent:
        raise HTTPException(status_code=503, detail="Agents not initialized")

    template_id = req.get("template_id")
    format = req.get("format", "docx")
    if not template_id:
        raise HTTPException(status_code=400, detail="template_id is required")

    try:
        # 1. Get template content
        tpl = _doc_agent.get_template_detail(template_id)
        content = tpl["content"]

        # 2. Ask CAIO to fill the template with realistic data
        fill_prompt = (
            "Preencha o seguinte template de documento com dados fictícios, mas realistas e profissionais.\n"
            "Mantenha a estrutura Markdown. Substitua [PLACEHOLDERS] por informações sensatas.\n"
            f"TEMPLATE:\n{content}"
        )
        filled_content = await _agent.process_direct(fill_prompt, session_key="doc_tpl")

        # 3. Generate file
        from nanobot.documentos.engine import generate_from_ai_content
        doc_id = f"TPL_{template_id}_{int(time.time())}"
        filepath = generate_from_ai_content(filled_content, doc_format=format, title=doc_id)

        return {
            "status": "success",
            "doc_id": doc_id,
            "filename": os.path.basename(filepath)
        }
    except Exception as e:
        logger.error(f"Template generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/documents/{filename}/download")
async def download_document(filename: str):
    """Download a generated document."""
    from starlette.responses import FileResponse
    
    file_path_local = os.path.join(_DOCS_OUT, filename)
    file_path_agent = os.path.join(os.path.expanduser("~"), ".nanobot", "workspace", "out", filename)
    
    target_path = file_path_local if os.path.exists(file_path_local) else file_path_agent
    
    if not os.path.exists(target_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(target_path, filename=filename)


@app.delete("/api/documents/{filename}")
async def delete_document(filename: str):
    """Delete a generated document."""
    file_path_local = os.path.join(_DOCS_OUT, filename)
    file_path_agent = os.path.join(os.path.expanduser("~"), ".nanobot", "workspace", "out", filename)
    
    target_path = file_path_local if os.path.exists(file_path_local) else file_path_agent
    
    if not os.path.exists(target_path):
        raise HTTPException(status_code=404, detail="File not found")
    os.remove(target_path)
    logger.info("Docs: Deleted {}", filename)
    return {"status": "deleted", "filename": filename}


@app.post("/api/notify")
async def send_notification(req: NotificationRequest):
    """Send a notification directly to Telegram via HTTP API."""
    import httpx

    target_chat_id = req.chat_id
    tg_token = None

    if _config and _config.channels and _config.channels.telegram:
        tg_cfg = _config.channels.telegram
        tg_token = tg_cfg.token
        if not target_chat_id:
            target_chat_id = tg_cfg.notify_chat_id or (
                tg_cfg.allow_from[0] if tg_cfg.allow_from else None
            )

    if not target_chat_id or not tg_token:
        raise HTTPException(
            status_code=400,
            detail=f"Missing chat_id ({target_chat_id}) or token ({bool(tg_token)})",
        )

    full_message = f"[NOTIFICACAO] *{req.title}*\n\n{req.message}"

    url = f"https://api.telegram.org/bot{tg_token}/sendMessage"
    payload = {
        "chat_id": target_chat_id,
        "text": full_message,
        "parse_mode": "Markdown",
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, timeout=10)
            resp_data = resp.json()

        if resp.status_code == 200 and resp_data.get("ok"):
            logger.info(f"API: Telegram notification sent: {req.title}")
            return {"status": "sent", "chat_id": target_chat_id}
        else:
            detail = resp_data.get("description", resp.text)
            logger.error(f"API: Telegram error: {detail}")
            raise HTTPException(status_code=502, detail=f"Telegram API error: {detail}")
    except httpx.HTTPError as e:
        logger.exception(f"API: HTTP error sending notification: {e}")
        raise HTTPException(status_code=502, detail=str(e))


# ── Agent initialization ────────────────────────────────────────────

def _init_monitoring_agents(config):
    """Initialize and start all monitoring agents based on config."""
    import json
    from nanobot.agents.registry import agent_registry
    from nanobot.agents.events import EventStore
    from nanobot.agents.token_agent import TokenAgent
    from nanobot.agents.bd_agent import BDAgent
    from nanobot.agents.life_agent import LifeAgent
    from nanobot.agents.sso_agent import SSOAgent

    # Create shared EventStore
    event_store = EventStore()
    agent_registry.set_event_store(event_store)

    # Read raw config.json for monitoring section (Pydantic strips unknown fields)
    monitoring_cfg = {}
    supabase_conns = []
    try:
        from nanobot.config.loader import get_config_path
        config_path = get_config_path()
        if config_path.exists():
            with open(config_path, encoding="utf-8") as f:
                raw = json.load(f)
            agents_cfg = raw.get("agents", {})
            monitoring_cfg = agents_cfg.get("monitoring", {})
            supabase_conns = raw.get("supabase_connections", [])
    except Exception as e:
        logger.warning("Could not read monitoring config: {}", e)

    # Token Agent
    token_cfg = monitoring_cfg.get("token_agent", {})
    if token_cfg.get("enabled", True):
        token_agent = TokenAgent()
        agent_registry.register(token_agent)
        logger.info("Monitoring: TokenAgent registered")

    # BD Agent
    bd_cfg = monitoring_cfg.get("bd_agent", {})
    if bd_cfg.get("enabled", True):
        bd_agent = BDAgent(connections=supabase_conns)
        agent_registry.register(bd_agent)
        logger.info("Monitoring: BDAgent registered (connections: {})", len(supabase_conns))

    # Life Agent
    life_cfg = monitoring_cfg.get("life_agent", {})
    if life_cfg.get("enabled", True):
        interval = life_cfg.get("heartbeat_interval_s", 30)
        life_agent = LifeAgent(
            registry=agent_registry,
            heartbeat_interval=interval,
        )
        agent_registry.register(life_agent)
        logger.info("Monitoring: LifeAgent registered (interval: {}s)", interval)

    # SSO Agent
    sso_cfg = monitoring_cfg.get("sso_agent", {})
    if sso_cfg.get("enabled", True):
        interval = sso_cfg.get("metrics_interval_s", 10)
        sso_agent = SSOAgent(metrics_interval=interval)
        agent_registry.register(sso_agent)
        logger.info("Monitoring: SSOAgent registered (interval: {}s)", interval)

    return agent_registry


async def _start_agent_loops():
    """Start background loops for all registered agents."""
    from nanobot.agents.registry import agent_registry
    for agent_id in agent_registry.list_ids():
        agent = agent_registry.get(agent_id)
        if agent and hasattr(agent, "start"):
            await agent.start()
    logger.info("Monitoring: all agent loops started")


@app.on_event("startup")
async def on_startup():
    """Start monitoring agent loops when FastAPI starts."""
    # Small delay to let start_api() finish registering agents
    await asyncio.sleep(1)
    await _start_agent_loops()


# ── Tasks API ────────────────────────────────────────────────────────

import uuid as _uuid

# In-memory task store — primary source of truth within a gateway session
# Loaded from disk on first access, persisted to disk on every write
_tasks_store: list | None = None

def _tasks_json_path() -> str:
    """Compute tasks.json path fresh each time — no caching to avoid stale paths."""
    # Priority 1: use workspace from config (set in start_api)
    if _config and hasattr(_config, 'workspace_path'):
        return str(_config.workspace_path / "tasks.json")
    # Priority 2: project root next to config.json
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    return os.path.join(project_root, "tasks.json")

def _load_tasks() -> list:
    """Load tasks from in-memory store, initializing from disk if needed."""
    global _tasks_store
    if _tasks_store is not None:
        return list(_tasks_store)
    # Initialize from disk
    path = _tasks_json_path()
    logger.info("Tasks: initializing from {}", path)
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    _tasks_store = data
                    logger.info("Tasks: loaded {} tasks from disk", len(_tasks_store))
                    return list(_tasks_store)
        except Exception as e:
            logger.error("Tasks: failed to load from {}: {}", path, e)
    _tasks_store = []
    return []

def _save_tasks(tasks: list) -> None:
    """Save tasks to in-memory store and persist to disk."""
    global _tasks_store
    _tasks_store = list(tasks)
    path = _tasks_json_path()
    try:
        parent = os.path.dirname(path)
        if parent:
            os.makedirs(parent, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(tasks, f, ensure_ascii=False, indent=2)
        logger.info("Tasks: saved {} tasks to {}", len(tasks), path)
    except Exception as e:
        logger.error("Tasks: FAILED to persist to {}: {}", path, e)
        # In-memory store still updated — tasks survive this session but not restarts

class TaskCreate(BaseModel):
    title: str
    description: str = ""
    assignedTo: str = ""
    priority: str = "medium"


@app.get("/api/tasks")
async def get_tasks():
    return _load_tasks()


@app.post("/api/tasks", status_code=201)
async def create_task(body: TaskCreate):
    task = {
        "id": f"TASK-{_uuid.uuid4().hex[:6].upper()}",
        "title": body.title,
        "description": body.description,
        "assignedTo": body.assignedTo,
        "priority": body.priority,
        "status": "pending",
        "progress": 0,
        "createdAt": datetime.now().isoformat(),
        "completedAt": None,
        "duration": None,
        "result": None,
    }
    tasks = _load_tasks()
    tasks.insert(0, task)
    _save_tasks(tasks)
    logger.info("Task created: {} ({})", task["title"], task["id"])
    return task


@app.post("/api/tasks/{task_id}/execute")
async def execute_task(task_id: str, background_tasks: BackgroundTasks):
    tasks = _load_tasks()
    task = next((t for t in tasks if t["id"] == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task["status"] == "running":
        return {"status": "already_running"}

    # Mark as running
    task["status"] = "running"
    task["progress"] = 5
    _save_tasks(tasks)

    async def _run_task():
        start = datetime.now()
        assigned = task.get('assignedTo', '')
        specialist_line = ""
        if assigned:
            specialist_line = f"\nESPECIALISTA ATRIBUÍDO: {assigned}\nDirecione esta tarefa ao {assigned} usando as ferramentas dele.\n"
        prompt = (
            f"TAREFA ATRIBUÍDA: {task['title']}\n"
            f"Descrição: {task['description'] or 'Sem descrição adicional'}\n"
            f"Prioridade: {task['priority']}\n"
            f"{specialist_line}\n"
            "Execute esta tarefa usando todas as ferramentas disponíveis. "
            "Seja direto e objetivo. Ao concluir, informe o resultado. "
            "Notifique o usuário tanto no Telegram quanto no chat do Dashboard."
        )

        try:
            response = await _agent.process_direct(
                prompt,
                session_key=f"task:{task_id}",
                channel="dashboard",
                chat_id="dashboard-default",
            )
            duration_s = (datetime.now() - start).total_seconds()
            task["status"] = "completed"
            task["progress"] = 100
            task["completedAt"] = datetime.now().isoformat()
            task["duration"] = f"{duration_s:.0f}s"
            task["result"] = (response or "")[:500]
        except Exception as e:
            task["status"] = "failed"
            task["progress"] = 0
            task["result"] = str(e)[:200]
        # Atomic save: reload full list, update only this task, save back
        current = _load_tasks()
        found = False
        for t in current:
            if t["id"] == task_id:
                t["status"] = task["status"]
                t["progress"] = task["progress"]
                t["completedAt"] = task.get("completedAt")
                t["duration"] = task.get("duration")
                t["result"] = task.get("result")
                found = True
                break
        if found and current:
            _save_tasks(current)  # Never saves empty list
        else:
            logger.warning("Task {} not found in list after execution — skipping save", task_id)

    if _agent:
        background_tasks.add_task(_run_task)
    return {"status": "started", "task_id": task_id}


@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str):
    tasks = _load_tasks()
    new_tasks = [t for t in tasks if t["id"] != task_id]
    if len(new_tasks) == len(tasks):
        raise HTTPException(status_code=404, detail="Task not found")
    _save_tasks(new_tasks)
    return {"deleted": True}


def start_api(agent, bus, config, cron, channels=None, doc_agent=None):
    """Start the FastAPI server with all dependencies injected."""
    global _agent, _bus, _config, _cron, _channels, _doc_agent
    _agent = agent
    _bus = bus
    _config = config
    _cron = cron
    _channels = channels
    _doc_agent = doc_agent

    # Initialize monitoring agents
    _init_monitoring_agents(config)

    import uvicorn
    import threading

    def run():
        uvicorn.run(app, host="0.0.0.0", port=18795, log_level="info")

    thread = threading.Thread(target=run, daemon=True)
    thread.start()
    logger.info("Nanobot API Server started on port 18795 (with monitoring agents)")
