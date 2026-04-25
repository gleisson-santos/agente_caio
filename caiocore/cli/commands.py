"""CLI commands for caiocore."""

import asyncio
import json
import os
import signal
from pathlib import Path
import select
import sys

import sys
import io

# Fix Windows console encoding for emoji/unicode
if sys.platform == "win32":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass # Handle cases where stdout.buffer is not available
    os.environ.setdefault("PYTHONIOENCODING", "utf-8")

from loguru import logger
import typer
from rich.console import Console
from rich.markdown import Markdown
from rich.table import Table
from rich.text import Text

from caiocore import __version__, __logo__
from caiocore.config.schema import Config

_PROMPT_SESSION = None
_SAVED_TERM_ATTRS = None

app = typer.Typer(
    name="caiocore",
    help=f"{__logo__} CaioCore - Operações Inteligentes",
    no_args_is_help=True,
)

console = Console()
EXIT_COMMANDS = {"exit", "quit", "/exit", "/quit", ":q"}

# ---------------------------------------------------------------------------
# CLI input: prompt_toolkit for editing, paste, history, and display
# ---------------------------------------------------------------------------


def _flush_pending_tty_input() -> None:
    """Drop unread keypresses typed while the model was generating output."""
    try:
        fd = sys.stdin.fileno()
        if not os.isatty(fd):
            return
    except Exception:
        return

    try:
        import termios
        termios.tcflush(fd, termios.TCIFLUSH)
        return
    except Exception:
        pass

    try:
        while True:
            ready, _, _ = select.select([fd], [], [], 0)
            if not ready:
                break
            if not os.read(fd, 4096):
                break
    except Exception:
        return


def _restore_terminal() -> None:
    """Restore terminal to its original state (echo, line buffering, etc.)."""
    if _SAVED_TERM_ATTRS is None:
        return
    try:
        import termios
        termios.tcsetattr(sys.stdin.fileno(), termios.TCSADRAIN, _SAVED_TERM_ATTRS)
    except Exception:
        pass


def _init_prompt_session() -> None:
    """Create the prompt_toolkit session with persistent file history."""
    global _PROMPT_SESSION, _SAVED_TERM_ATTRS

    # Save terminal state so we can restore it on exit
    try:
        import termios
        _SAVED_TERM_ATTRS = termios.tcgetattr(sys.stdin.fileno())
    except Exception:
        pass

    from prompt_toolkit import PromptSession
    from prompt_toolkit.history import FileHistory

    history_file = Path.home() / ".caiocore" / "history" / "cli_history"
    history_file.parent.mkdir(parents=True, exist_ok=True)

    _PROMPT_SESSION = PromptSession(
        history=FileHistory(str(history_file)),
        enable_open_in_editor=False,
        multiline=False,   # Enter submits (single line mode)
    )


def _print_agent_response(response: str, render_markdown: bool) -> None:
    """Render assistant response with consistent terminal styling."""
    content = response or ""
    body = Markdown(content) if render_markdown else Text(content)
    console.print()
    console.print(f"[cyan]{__logo__} caio[/cyan]")
    console.print(body)
    console.print()


def _is_exit_command(command: str) -> bool:
    """Return True when input should end interactive chat."""
    return command.lower() in EXIT_COMMANDS


async def _read_interactive_input_async() -> str:
    """Read user input using prompt_toolkit (handles paste, history, display).

    prompt_toolkit natively handles:
    - Multiline paste (bracketed paste mode)
    - History navigation (up/down arrows)
    - Clean display (no ghost characters or artifacts)
    """
    from prompt_toolkit.patch_stdout import patch_stdout
    from prompt_toolkit.formatted_text import HTML

    if _PROMPT_SESSION is None:
        raise RuntimeError("Call _init_prompt_session() first")
    try:
        with patch_stdout():
            return await _PROMPT_SESSION.prompt_async(
                HTML("<b fg='ansiblue'>You:</b> "),
            )
    except EOFError as exc:
        raise KeyboardInterrupt from exc



def version_callback(value: bool):
    if value:
        console.print(f"{__logo__} caio v{__version__}")
        raise typer.Exit()


@app.callback()
def main(
    version: bool = typer.Option(
        None, "--version", "-v", callback=version_callback, is_eager=True
    ),
):
    """CaioCore - Operações Inteligentes."""
    pass


# ============================================================================
# Onboard / Setup
# ============================================================================


@app.command()
def setup():
    """Interactive setup wizard for CaioCore."""
    from caiocore.config.loader import get_config_path, load_config, save_config
    from caiocore.config.schema import Config, ProviderConfig
    from caiocore.utils.helpers import get_workspace_path
    from rich.panel import Panel
    from rich.prompt import Prompt, Confirm
    import sys
    
    config_path = get_config_path()
    config = load_config()

    def print_header():
        console.clear()
        console.print(Panel(
            "[bold white]CaioCore - Assistente de Configuração[/bold white]\n"
            "[blue]Escolha uma das categorias abaixo para configurar o sistema de forma assistida.[/blue]",
            border_style="blue",
            expand=False
        ))

    def pause():
        console.input("\n[dim]Pressione Enter para voltar ao menu...[/dim]")

    while True:
        print_header()
        console.print("\n[bold white]Menu Mestre:[/bold white]")
        console.print("  [bold blue]1.[/bold blue] 🧠 Configurar Inteligência Artificial (Providers)")
        console.print("  [bold blue]2.[/bold blue] 💬 Configurar Canais de Chat (Telegram, WhatsApp, Discord)")
        console.print("  [bold blue]3.[/bold blue] 🛠️  Configurar Ferramentas (Calendário, Buscador)")
        console.print("  [bold blue]4.[/bold blue] 📁 Inicializar Workspace")
        console.print("  [bold blue]0.[/bold blue] 💾 Salvar e Sair")
        
        choice = Prompt.ask("\n[bold white]Selecione uma opção[/bold white]", choices=["0", "1", "2", "3", "4"], default="0")
        
        if choice == "0":
            save_config(config)
            console.print(f"\n[bold green]✓ Toda a configuração foi salva com sucesso em: {config_path}[/bold green]")
            console.print("\n[blue]Próximos passos:[/blue]")
            console.print("  Para iniciar o servidor: [bold white]caiocore gateway[/bold white]")
            break
            
        elif choice == "1":
            print_header()
            console.print("\n[bold white]1. Inteligência Artificial[/bold white]")
            console.print("[dim]Selecione qual central de IAs você deseja usar primariamente.[/dim]\n")
            prov = Prompt.ask(
                "[blue]Escolha o provedor[/blue]", 
                choices=["openrouter", "openai", "gemini", "anthropic", "voltar"], 
                default="openrouter"
            )
            
            if prov == "voltar": continue
            
            if prov == "openrouter":
                console.print("\n[blue]Obtenha sua chave em: https://openrouter.ai/keys[/blue]")
                api_key = Prompt.ask("Cole sua API Key", password=True)
                if api_key:
                    if not getattr(config.providers, "openrouter", None):
                        config.providers.openrouter = ProviderConfig()
                    config.providers.openrouter.api_key = api_key
                    config.agents.defaults.model = "x-ai/grok-4.1-fast"
                    console.print("[green]✓ OpenRouter ativo (Modelo padrão ajustado para grok-4.1-fast).[/green]")
            elif prov == "openai":
                console.print("\n[blue]Obtenha sua chave em: https://platform.openai.com/api-keys[/blue]")
                api_key = Prompt.ask("Cole sua API Key", password=True)
                if api_key:
                    if not getattr(config.providers, "openai", None):
                        config.providers.openai = ProviderConfig()
                    config.providers.openai.api_key = api_key
                    config.agents.defaults.model = "gpt-4o-mini"
                    console.print("[green]✓ OpenAI ativa (Modelo padrão ajustado para gpt-4o-mini).[/green]")
            elif prov == "gemini":
                console.print("\n[blue]Obtenha sua chave do Google Gemini API.[/blue]")
                api_key = Prompt.ask("Cole sua API Key", password=True)
                if api_key:
                    if not getattr(config.providers, "gemini", None):
                        config.providers.gemini = ProviderConfig()
                    config.providers.gemini.api_key = api_key
                    config.agents.defaults.model = "gemini/gemini-2.5-flash"
                    console.print("[green]✓ Gemini ativo (Modelo Padrão ajustado para gemini-2.5-flash).[/green]")
            elif prov == "anthropic":
                console.print("\n[blue]Obtenha sua chave da Anthropic API.[/blue]")
                api_key = Prompt.ask("Cole sua API Key", password=True)
                if api_key:
                    if not getattr(config.providers, "anthropic", None):
                        config.providers.anthropic = ProviderConfig()
                    config.providers.anthropic.api_key = api_key
                    config.agents.defaults.model = "anthropic/claude-3-5-haiku-20241022"
                    console.print("[green]✓ Anthropic ativa (Modelo Padrão ajustado).[/green]")
            
            pause()
            
        elif choice == "2":
            print_header()
            console.print("\n[bold white]2. Canais de Chat[/bold white]")
            channel = Prompt.ask(
                "[blue]Escolha o canal[/blue]", 
                choices=["telegram", "whatsapp", "discord", "voltar"],
                default="telegram"
            )
            
            if channel == "voltar": continue
            
            if channel == "telegram":
                console.print("\n[bold blue]-- Telegram --[/bold blue]")
                console.print("[dim]Use o @BotFather no Telegram para criar seu bot e pegar o Token.[/dim]")
                token = Prompt.ask("Token do Bot (ENTER para pular)", default=config.channels.telegram.token or "")
                chat_id = Prompt.ask("Seu Chat ID (descubra com @userinfobot)", default=config.channels.telegram.notify_chat_id or "")
                if token and token != "XXXXXXXXX":
                    config.channels.telegram.enabled = True
                    config.channels.telegram.token = token
                    config.channels.telegram.notify_chat_id = chat_id
                    if chat_id:
                        config.channels.telegram.allow_from = [chat_id]
                    console.print("[green]✓ Telegram configurado e ativado.[/green]")
                    
            elif channel == "whatsapp":
                console.print("\n[bold blue]-- WhatsApp (via Evolution API) --[/bold blue]")
                base_url = Prompt.ask("URL base da Evolution", default=config.channels.evolution.base_url or "")
                api_key = Prompt.ask("Global API Key da Evolution", default=config.channels.evolution.api_key or "")
                instance = Prompt.ask("Nome da Instância para este Agente", default=config.channels.evolution.instance_name or "Caio")
                if base_url and api_key:
                    config.channels.evolution.enabled = True
                    config.channels.evolution.base_url = base_url
                    config.channels.evolution.api_key = api_key
                    config.channels.evolution.instance_name = instance
                    console.print("[green]✓ WhatsApp via Evolution ativado e configurado.[/green]")
                    
            elif channel == "discord":
                console.print("\n[bold blue]-- Discord --[/bold blue]")
                console.print("[dim]Você precisará de um Bot Token do Discord Developer Portal.[/dim]")
                token = Prompt.ask("Token do seu Bot", password=True)
                if token:
                    config.channels.discord.enabled = True
                    config.channels.discord.token = token
                    console.print("[green]✓ Discord configurado e ativado.[/green]")
                    
            pause()
            
        elif choice == "3":
            print_header()
            console.print("\n[bold white]3. Ferramentas e Integrações do Agente[/bold white]")
            ferramenta = Prompt.ask(
                "[blue]Escolha a ferramenta[/blue]", 
                choices=["calendario", "buscador", "voltar"],
                default="voltar"
            )
            
            if ferramenta == "voltar": continue
            
            if ferramenta == "calendario":
                console.print("\n[bold blue]-- Google Calendar --[/bold blue]")
                if Confirm.ask("Deseja ATIVAR a manipulação de Google Calendar?"):
                    config.tools.google_calendar.enabled = True
                    console.print("[dim]O arquivo `credentials.json` deve estar presente na raiz do sistema.[/dim]")
                    config.tools.google_calendar.credentials_path = Prompt.ask("Caminho do credentials.json", default=config.tools.google_calendar.credentials_path)
                    console.print("[green]✓ Calendário ativado.[/green]")
                else:
                    config.tools.google_calendar.enabled = False
                    console.print("[yellow]Calendário desativado.[/yellow]")
            
            elif ferramenta == "buscador":
                console.print("\n[bold blue]-- Brave Search Engine --[/bold blue]")
                console.print("[dim]Para permitir buscas em tempo real, crie uma chave gratuita no Brave Search API.[/dim]")
                api_key = Prompt.ask("Brave API Key", password=True)
                if api_key:
                    config.tools.web.search.api_key = api_key
                    console.print("[green]✓ Buscador Web ativado.[/green]")

            pause()
            
        elif choice == "4":
            print_header()
            console.print("\n[bold white]4. Inicialização de Workspace[/bold white]")
            workspace = get_workspace_path()
            if not workspace.exists():
                workspace.mkdir(parents=True, exist_ok=True)
                _create_workspace_templates(workspace)
                console.print(f"[green]✓ Espaço de trabalho inicializado perfeitamente em {workspace}[/green]")
            else:
                console.print(f"\n[dim]Excelente: O Workspace já existe e está pronto em {workspace}[/dim]")
            
            pause()


@app.command()
def onboard():
    """🐈 Full onboarding wizard — configure VPS, Traefik, domain, and API keys interactively."""
    from caiocore.cli.onboard import run_onboard
    run_onboard()



def _create_workspace_templates(workspace: Path):
    """Create default workspace template files."""
    templates = {
        "AGENTS.md": """# Agent Instructions

You are a helpful AI assistant. Be concise, accurate, and friendly.

## Guidelines

- Always explain what you're doing before taking actions
- Ask for clarification when the request is ambiguous
- Use tools to help accomplish tasks
- Remember important information in memory/MEMORY.md; past events are logged in memory/HISTORY.md
""",
        "SOUL.md": """# Soul

I am Caio, a lightweight AI assistant.

## Personality

- Helpful and friendly
- Concise and to the point
- Curious and eager to learn

## Values

- Accuracy over speed
- User privacy and safety
- Transparency in actions
""",
        "USER.md": """# User

Information about the user goes here.

## Preferences

- Communication style: (casual/formal)
- Timezone: (your timezone)
- Language: (your preferred language)
""",
    }
    
    for filename, content in templates.items():
        file_path = workspace / filename
        if not file_path.exists():
            file_path.write_text(content, encoding="utf-8")
            console.print(f"  [dim]Created {filename}[/dim]")
    
    # Create memory directory and MEMORY.md
    memory_dir = workspace / "memory"
    memory_dir.mkdir(exist_ok=True)
    memory_file = memory_dir / "MEMORY.md"
    if not memory_file.exists():
        memory_file.write_text("""# Long-term Memory

This file stores important information that should persist across sessions.

## User Information

(Important facts about the user)

## Preferences

(User preferences learned over time)

## Important Notes

(Things to remember)
""", encoding="utf-8")
        console.print("  [dim]Created memory/MEMORY.md[/dim]")
    
    history_file = memory_dir / "HISTORY.md"
    if not history_file.exists():
        history_file.write_text("", encoding="utf-8")
        console.print("  [dim]Created memory/HISTORY.md[/dim]")

    # Create skills directory for custom user skills
    skills_dir = workspace / "skills"
    skills_dir.mkdir(exist_ok=True)


def _make_provider(config: Config):
    """Create the appropriate LLM provider from config."""
    from caiocore.providers.litellm_provider import LiteLLMProvider
    from caiocore.providers.openai_codex_provider import OpenAICodexProvider
    from caiocore.providers.custom_provider import CustomProvider

    model = config.agents.defaults.model
    provider_name = config.get_provider_name(model)
    p = config.get_provider(model)

    # OpenAI Codex (OAuth)
    if provider_name == "openai_codex" or model.startswith("openai-codex/"):
        return OpenAICodexProvider(default_model=model)

    # Custom: direct OpenAI-compatible endpoint, bypasses LiteLLM
    if provider_name == "custom":
        return CustomProvider(
            api_key=p.api_key if p else "no-key",
            api_base=config.get_api_base(model) or "http://localhost:8000/v1",
            default_model=model,
        )

    from caiocore.providers.registry import find_by_name
    spec = find_by_name(provider_name)
    if not model.startswith("bedrock/") and not (p and p.api_key) and not (spec and spec.is_oauth):
        console.print("[red]Error: No API key configured.[/red]")
        console.print("Set one in ~/.caiocore/config.json under providers section")
        raise typer.Exit(1)

    return LiteLLMProvider(
        api_key=p.api_key if p else None,
        api_base=config.get_api_base(model),
        default_model=model,
        extra_headers=p.extra_headers if p else None,
        provider_name=provider_name,
    )


# ============================================================================
# Gateway / Server
# ============================================================================


@app.command()
def gateway(
    port: int = typer.Option(18790, "--port", "-p", help="Gateway port"),
    verbose: bool = typer.Option(False, "--verbose", "-v", help="Verbose output"),
):
    """Start the caio gateway."""
    from caiocore.config.loader import load_config, get_data_dir
    from caiocore.bus.queue import MessageBus
    from caiocore.agent.loop import AgentLoop
    from caiocore.channels.manager import ChannelManager
    from caiocore.session.manager import SessionManager
    from caiocore.cron.service import CronService
    from caiocore.cron.types import CronJob
    from caiocore.heartbeat.service import HeartbeatService
    
    if verbose:
        import logging
        logging.basicConfig(level=logging.DEBUG)
        logger.enable("caiocore")
    
    console.print(f"{__logo__} Starting caio gateway on port {port}...")
    
    config = load_config()
    bus = MessageBus()
    provider = _make_provider(config)
    session_manager = SessionManager(config.workspace_path)
    
    # Create cron service first (callback set after agent creation)
    cron_store_path = get_data_dir() / "cron" / "jobs.json"
    cron = CronService(cron_store_path)
    
    # Build email config for the email_read tool (if IMAP is enabled)
    _em = config.channels.email
    _email_cfg = None
    if _em.enabled:
        _email_cfg = {
            "imap_host": _em.imap_host,
            "imap_port": _em.imap_port,
            "imap_username": _em.imap_username,
            "imap_password": _em.imap_password,
            "imap_use_ssl": _em.imap_use_ssl,
            "smtp_host": _em.smtp_host,
            "smtp_port": _em.smtp_port,
            "smtp_username": _em.smtp_username,
            "smtp_password": _em.smtp_password,
            "smtp_use_tls": _em.smtp_use_tls,
            "smtp_use_ssl": _em.smtp_use_ssl,
            "from_address": _em.from_address,
        }

    # Create agent with cron service
    agent = AgentLoop(
        bus=bus,
        provider=provider,
        workspace=config.workspace_path,
        model=config.agents.defaults.model,
        temperature=config.agents.defaults.temperature,
        max_tokens=config.agents.defaults.max_tokens,
        max_iterations=config.agents.defaults.max_tool_iterations,
        memory_window=config.agents.defaults.memory_window,
        brave_api_key=config.tools.web.search.api_key or None,
        exec_config=config.tools.exec,
        cron_service=cron,
        restrict_to_workspace=config.tools.restrict_to_workspace,
        session_manager=session_manager,
        mcp_servers=config.tools.mcp_servers,
        email_config=_email_cfg,
        gcal_config=config.tools.google_calendar.model_dump(),
        fallback_models=config.agents.defaults.fallback_models,
    )
    
    # Set cron callback (needs agent)
    async def on_cron_job(job: CronJob) -> str | None:
        """Execute a cron job — delivers to original channel, persists to history, cross-notifies Telegram."""
        from caiocore.bus.events import OutboundMessage

        if job.payload.deliver and job.payload.kind == "agent_turn" and job.payload.to:
            logger.info("Cron: delivering notification for job '{}'", job.name)

            # 1. Deliver to the original channel (dashboard web chat SSE)
            await bus.publish_outbound(OutboundMessage(
                channel=job.payload.channel or "cli",
                chat_id=job.payload.to,
                content=job.payload.message
            ))

            # 2. Persist to dashboard session history so it's visible after page refresh
            if job.payload.channel == "dashboard":
                try:
                    session_id = job.payload.to  # chat_id = session_id from dashboard
                    session_key = f"dashboard:{session_id}"
                    session = session_manager.get_or_create(session_key)
                    session.add_message("assistant", job.payload.message)
                    session_manager.save(session)
                    logger.info("Cron: persisted notification to session '{}'", session_key)
                except Exception as e:
                    logger.warning("Cron: could not persist to session: {}", e)

            # 3. Cross-notify to Telegram regardless of origin channel
            tg = config.channels.telegram
            if tg.enabled:
                tg_chat_id = tg.notify_chat_id or (tg.allow_from[0] if tg.allow_from else None)
                if tg_chat_id and (job.payload.channel != "telegram" or job.payload.to != tg_chat_id):
                    logger.info("Cron: cross-notifying Telegram chat {} for job '{}'", tg_chat_id, job.name)
                    await bus.publish_outbound(OutboundMessage(
                        channel="telegram",
                        chat_id=tg_chat_id,
                        content=(
                            f"⏰ *Lembrete de Evento*\n\n"
                            f"📌 *Detalhe:* {job.payload.message}\n\n"
                            f"✅ *Notificação automática do Agente*"
                        )
                    ))
            return job.payload.message

        # Otherwise, run through the agent for reasoning/tools
        response = await agent.process_direct(
            job.payload.message,
            session_key=f"cron:{job.id}",
            channel=job.payload.channel or "cli",
            chat_id=job.payload.to or "direct",
        )
        return response
    cron.on_job = on_cron_job

    
    # Create heartbeat service
    async def on_heartbeat(prompt: str) -> str:
        """Execute heartbeat through the agent, routing to Telegram if available."""
        tg = config.channels.telegram
        if tg.enabled:
            chat_id = tg.notify_chat_id or (tg.allow_from[0] if tg.allow_from else "direct")
            return await agent.process_direct(
                prompt, session_key="heartbeat",
                channel="telegram", chat_id=chat_id,
            )
        return await agent.process_direct(prompt, session_key="heartbeat")
    
    heartbeat = HeartbeatService(
        workspace=config.workspace_path,
        on_heartbeat=on_heartbeat,
        interval_s=30 * 60,  # 30 minutes (production mode)
        enabled=True
    )

    # ── Register permanent daily briefing CRON (06:00 America/Sao_Paulo) ──
    # Only add if it doesn't already exist (identified by name)
    _briefing_job_name = "Resumo Diário Caio"
    existing_jobs = cron.list_jobs(include_disabled=True)
    if not any(j.name == _briefing_job_name for j in existing_jobs):
        from caiocore.cron.types import CronSchedule
        briefing_prompt = (
            "TAREFA: Gerar Resumo Executivo Diário — 06:00\n\n"
            "Olá Gleisson! Gerando seu resumo diário de status.\n"
            "Por favor, apresente um resumo claro e direto sobre as atividades das últimas 24h:\n\n"
            "1. Atividades: Consolidação do que foi processado ontem.\n"
            "2. Status: Resumo geral da saúde do sistema.\n"
            "3. Especialistas: Destaques das ações do Sentinel, Schedule e Pesquisa.\n"
            )
        tg = config.channels.telegram
        tg_chat_id = tg.notify_chat_id or (tg.allow_from[0] if tg.allow_from else "direct") if tg.enabled else "direct"
        cron.add_job(
            name=_briefing_job_name,
            schedule=CronSchedule(kind="cron", expr="0 6 * * *", tz="America/Sao_Paulo"),
            message=briefing_prompt,
            deliver=False,  # Run through agent for reasoning
            channel="telegram",
            to=tg_chat_id,
            delete_after_run=False,
        )
        logger.info("Daily briefing CRON registered: 06:00 America/Sao_Paulo")
    
    # Create channel manager
    channels = ChannelManager(config, bus)
    
    if channels.enabled_channels:
        console.print(f"[green]✓[/green] Channels enabled: {', '.join(channels.enabled_channels)}")
    else:
        console.print("[yellow]Warning: No channels enabled[/yellow]")
    
    cron_status = cron.status()
    if cron_status["jobs"] > 0:
        console.print(f"[green]✓[/green] Cron: {cron_status['jobs']} scheduled jobs")
    
    console.print(f"[green]✓[/green] Heartbeat: every 30m")
    
    # Create and register DocAgent
    from caiocore.agents.doc_agent import DocAgent
    from caiocore.agents.specialist import SpecialistAgent
    from caiocore.agents.registry import agent_registry
    
    doc_agent = DocAgent(out_dir="out")
    agent_registry.register(doc_agent)

    # Register Specialists dynamically from agents_list.json (Tier 2)
    try:
        # Tenta no diretório atual (Docker /app) ou no pacote via __file__
        local_tools_path = Path.cwd() / "tools" / "agents_list.json"
        pkg_tools_path = Path(__file__).parent.parent.parent / "tools" / "agents_list.json"
        
        agents_list_path = local_tools_path if local_tools_path.exists() else pkg_tools_path

        if agents_list_path.exists():
            with open(agents_list_path, "r", encoding="utf-8") as f:
                all_agents_metadata = json.load(f)
            
            for agent_meta in all_agents_metadata:
                if agent_meta.get("tier") == 2:
                    agent_id = agent_meta.get("id") or agent_meta.get("agent")
                    if not agent_id:
                        continue
                    
                    # Tenta encontrar o arquivo de instrução
                    instr_file = f"{agent_id}.md"
                    instr_file_alt = f"{agent_id.replace('-', '_')}.md"
                    
                    # Tenta no subdiretório current/local vs pacote
                    local_premium_dir = Path.cwd() / "caiocore" / "agents" / "premium"
                    pkg_premium_dir = Path(__file__).parent.parent / "agents" / "premium"
                    
                    premium_dir = local_premium_dir if local_premium_dir.exists() else pkg_premium_dir
                    target_file = None
                    
                    if (premium_dir / instr_file).exists():
                        target_file = instr_file
                    elif (premium_dir / instr_file_alt).exists():
                        target_file = instr_file_alt
                    
                    if target_file:
                        # Precisamos garantir que criamos a SpecialistAgent com o path absoluto para ele conseguir abrir
                        abs_target_path = premium_dir / target_file
                        # We must bypass the internal __file__ check inside SpecialistAgent by patching it
                        spec_agent = SpecialistAgent(
                            agent_id=f"spec-{agent_id}" if not agent_id.startswith("spec-") else agent_id,
                            name=agent_meta["name"],
                            role=agent_meta["role"],
                            instruction_file=None, # Bypass standard logic
                            allowed_tools=agent_meta.get("tools")
                        )
                        # Manually load the instruction from the correct absolute path
                        spec_agent.instruction_path = abs_target_path
                        spec_agent._load_instructions()
                        agent_registry.register(spec_agent)
                        tools_info = agent_meta.get("tools", "ALL")
                        logger.info(f"Registered specialist: {agent_id} (tools: {tools_info})")
                    else:
                        logger.warning(f"Instruction file {instr_file} or {instr_file_alt} missing for specialist {agent_id}")
        else:
            logger.warning("agents_list.json not found, dynamic registration skipped.")
    except Exception as e:
        logger.error(f"Error registering dynamic specialists: {e}")
    
    # Start the Dashboard API
    from caiocore.server.api import start_api, start_api_server
    start_api(agent, bus, config, cron, channels=channels, doc_agent=doc_agent)
    
    async def run():
        try:
            await cron.start()
            await heartbeat.start()
            
            # RUN everything in the SAME loop to prevent 504 and thread-safety hangs
            await asyncio.gather(
                agent.run(),
                channels.start_all(),
                start_api_server(host=config.gateway.host, port=config.gateway.port)
            )
        except KeyboardInterrupt:
            console.print("\nShutting down...")
        finally:
            await agent.close_mcp()
            heartbeat.stop()
            cron.stop()
            agent.stop()
            await channels.stop_all()
    
    asyncio.run(run())




# ============================================================================
# Agent Commands
# ============================================================================


@app.command()
def agent(
    message: str = typer.Option(None, "--message", "-m", help="Message to send to the agent"),
    session_id: str = typer.Option("cli:direct", "--session", "-s", help="Session ID"),
    markdown: bool = typer.Option(True, "--markdown/--no-markdown", help="Render assistant output as Markdown"),
    logs: bool = typer.Option(False, "--logs/--no-logs", help="Show caio runtime logs during chat"),
):
    """Interact with the agent directly."""
    from caiocore.config.loader import load_config, get_data_dir
    from caiocore.bus.queue import MessageBus
    from caiocore.agent.loop import AgentLoop
    from caiocore.cron.service import CronService
    from loguru import logger
    
    config = load_config()
    
    # Build email config
    _em = config.channels.email
    _email_cfg = None
    if _em.enabled:
        _email_cfg = {
            "imap_host": _em.imap_host,
            "imap_port": _em.imap_port,
            "imap_username": _em.imap_username,
            "imap_password": _em.imap_password,
            "imap_use_ssl": _em.imap_use_ssl,
            "smtp_host": _em.smtp_host,
            "smtp_port": _em.smtp_port,
            "smtp_username": _em.smtp_username,
            "smtp_password": _em.smtp_password,
            "smtp_use_tls": _em.smtp_use_tls,
            "smtp_use_ssl": _em.smtp_use_ssl,
            "from_address": _em.from_address,
        }
    
    bus = MessageBus()
    provider = _make_provider(config)

    # Create cron service for tool usage (no callback needed for CLI unless running)
    cron_store_path = get_data_dir() / "cron" / "jobs.json"
    cron = CronService(cron_store_path)

    if logs:
        logger.enable("caiocore")
    else:
        logger.disable("caiocore")
    
    agent_loop = AgentLoop(
        bus=bus,
        provider=provider,
        workspace=config.workspace_path,
        model=config.agents.defaults.model,
        temperature=config.agents.defaults.temperature,
        max_tokens=config.agents.defaults.max_tokens,
        max_iterations=config.agents.defaults.max_tool_iterations,
        memory_window=config.agents.defaults.memory_window,
        brave_api_key=config.tools.web.search.api_key or None,
        exec_config=config.tools.exec,
        cron_service=cron,
        restrict_to_workspace=config.tools.restrict_to_workspace,
        mcp_servers=config.tools.mcp_servers,
        email_config=_email_cfg,
        gcal_config=config.tools.google_calendar.model_dump(),
        fallback_models=config.agents.defaults.fallback_models,
    )
    
    # Show spinner when logs are off (no output to miss); skip when logs are on
    def _thinking_ctx():
        if logs:
            from contextlib import nullcontext
            return nullcontext()
        # Animated spinner is safe to use with prompt_toolkit input handling
        return console.status("[dim]Caio is thinking...[/dim]", spinner="dots")

    async def _cli_progress(content: str) -> None:
        console.print(f"  [dim]↳ {content}[/dim]")

    if message:
        # Single message mode — direct call, no bus needed
        async def run_once():
            with _thinking_ctx():
                response = await agent_loop.process_direct(message, session_id, on_progress=_cli_progress)
            _print_agent_response(response, render_markdown=markdown)
            await agent_loop.close_mcp()

        asyncio.run(run_once())
    else:
        # Interactive mode — route through bus like other channels
        from caiocore.bus.events import InboundMessage
        _init_prompt_session()
        console.print(f"{__logo__} Interactive mode (type [bold]exit[/bold] or [bold]Ctrl+C[/bold] to quit)\n")

        if ":" in session_id:
            cli_channel, cli_chat_id = session_id.split(":", 1)
        else:
            cli_channel, cli_chat_id = "cli", session_id

        def _exit_on_sigint(signum, frame):
            _restore_terminal()
            console.print("\nGoodbye!")
            os._exit(0)

        signal.signal(signal.SIGINT, _exit_on_sigint)

        async def run_interactive():
            bus_task = asyncio.create_task(agent_loop.run())
            turn_done = asyncio.Event()
            turn_done.set()
            turn_response: list[str] = []

            async def _consume_outbound():
                while True:
                    try:
                        msg = await asyncio.wait_for(bus.consume_outbound(), timeout=1.0)
                        if msg.metadata.get("_progress"):
                            console.print(f"  [dim]↳ {msg.content}[/dim]")
                        elif not turn_done.is_set():
                            if msg.content:
                                turn_response.append(msg.content)
                            turn_done.set()
                        elif msg.content:
                            console.print()
                            _print_agent_response(msg.content, render_markdown=markdown)
                    except asyncio.TimeoutError:
                        continue
                    except asyncio.CancelledError:
                        break

            outbound_task = asyncio.create_task(_consume_outbound())

            try:
                while True:
                    try:
                        _flush_pending_tty_input()
                        user_input = await _read_interactive_input_async()
                        command = user_input.strip()
                        if not command:
                            continue

                        if _is_exit_command(command):
                            _restore_terminal()
                            console.print("\nGoodbye!")
                            break

                        turn_done.clear()
                        turn_response.clear()

                        await bus.publish_inbound(InboundMessage(
                            channel=cli_channel,
                            sender_id="user",
                            chat_id=cli_chat_id,
                            content=user_input,
                        ))

                        with _thinking_ctx():
                            await turn_done.wait()

                        if turn_response:
                            _print_agent_response(turn_response[0], render_markdown=markdown)
                    except KeyboardInterrupt:
                        _restore_terminal()
                        console.print("\nGoodbye!")
                        break
                    except EOFError:
                        _restore_terminal()
                        console.print("\nGoodbye!")
                        break
            finally:
                agent_loop.stop()
                outbound_task.cancel()
                await asyncio.gather(bus_task, outbound_task, return_exceptions=True)
                await agent_loop.close_mcp()

        asyncio.run(run_interactive())


# ============================================================================
# Channel Commands
# ============================================================================


channels_app = typer.Typer(help="Manage channels")
app.add_typer(channels_app, name="channels")


@channels_app.command("status")
def channels_status():
    """Show channel status."""
    from caiocore.config.loader import load_config

    config = load_config()

    table = Table(title="Channel Status")
    table.add_column("Channel", style="cyan")
    table.add_column("Enabled", style="green")
    table.add_column("Configuration", style="yellow")

    # WhatsApp
    wa = config.channels.whatsapp
    table.add_row(
        "WhatsApp",
        "✓" if wa.enabled else "✗",
        wa.bridge_url
    )

    dc = config.channels.discord
    table.add_row(
        "Discord",
        "✓" if dc.enabled else "✗",
        dc.gateway_url
    )

    # Feishu
    fs = config.channels.feishu
    fs_config = f"app_id: {fs.app_id[:10]}..." if fs.app_id else "[dim]not configured[/dim]"
    table.add_row(
        "Feishu",
        "✓" if fs.enabled else "✗",
        fs_config
    )

    # Mochat
    mc = config.channels.mochat
    mc_base = mc.base_url or "[dim]not configured[/dim]"
    table.add_row(
        "Mochat",
        "✓" if mc.enabled else "✗",
        mc_base
    )
    
    # Telegram
    tg = config.channels.telegram
    tg_config = f"token: {tg.token[:10]}..." if tg.token else "[dim]not configured[/dim]"
    table.add_row(
        "Telegram",
        "✓" if tg.enabled else "✗",
        tg_config
    )

    # Slack
    slack = config.channels.slack
    slack_config = "socket" if slack.app_token and slack.bot_token else "[dim]not configured[/dim]"
    table.add_row(
        "Slack",
        "✓" if slack.enabled else "✗",
        slack_config
    )

    # DingTalk
    dt = config.channels.dingtalk
    dt_config = f"client_id: {dt.client_id[:10]}..." if dt.client_id else "[dim]not configured[/dim]"
    table.add_row(
        "DingTalk",
        "✓" if dt.enabled else "✗",
        dt_config
    )

    # QQ
    qq = config.channels.qq
    qq_config = f"app_id: {qq.app_id[:10]}..." if qq.app_id else "[dim]not configured[/dim]"
    table.add_row(
        "QQ",
        "✓" if qq.enabled else "✗",
        qq_config
    )

    # Email
    em = config.channels.email
    em_config = em.imap_host if em.imap_host else "[dim]not configured[/dim]"
    table.add_row(
        "Email",
        "✓" if em.enabled else "✗",
        em_config
    )

    console.print(table)


def _get_bridge_dir() -> Path:
    """Get the bridge directory, setting it up if needed."""
    import shutil
    import subprocess
    
    # User's bridge location
    user_bridge = Path.home() / ".caiocore" / "bridge"
    
    # Check if already built
    if (user_bridge / "dist" / "index.js").exists():
        return user_bridge
    
    # Check for npm
    if not shutil.which("npm"):
        console.print("[red]npm not found. Please install Node.js >= 18.[/red]")
        raise typer.Exit(1)
    
    # Find source bridge: first check package data, then source dir
    pkg_bridge = Path(__file__).parent.parent / "bridge"  # caiocore/bridge (installed)
    src_bridge = Path(__file__).parent.parent.parent / "bridge"  # repo root/bridge (dev)
    
    source = None
    if (pkg_bridge / "package.json").exists():
        source = pkg_bridge
    elif (src_bridge / "package.json").exists():
        source = src_bridge
    
    if not source:
        console.print("[red]Bridge source not found.[/red]")
        console.print("Try reinstalling: pip install --force-reinstall caiocore")
        raise typer.Exit(1)
    
    console.print(f"{__logo__} Setting up bridge...")
    
    # Copy to user directory
    user_bridge.parent.mkdir(parents=True, exist_ok=True)
    if user_bridge.exists():
        shutil.rmtree(user_bridge)
    shutil.copytree(source, user_bridge, ignore=shutil.ignore_patterns("node_modules", "dist"))
    
    # Install and build
    try:
        console.print("  Installing dependencies...")
        subprocess.run(["npm", "install"], cwd=user_bridge, check=True, capture_output=True)
        
        console.print("  Building...")
        subprocess.run(["npm", "run", "build"], cwd=user_bridge, check=True, capture_output=True)
        
        console.print("[green]✓[/green] Bridge ready\n")
    except subprocess.CalledProcessError as e:
        console.print(f"[red]Build failed: {e}[/red]")
        if e.stderr:
            console.print(f"[dim]{e.stderr.decode()[:500]}[/dim]")
        raise typer.Exit(1)
    
    return user_bridge


@channels_app.command("login")
def channels_login():
    """Link device via QR code."""
    import subprocess
    from caiocore.config.loader import load_config
    
    config = load_config()
    bridge_dir = _get_bridge_dir()
    
    console.print(f"{__logo__} Starting bridge...")
    console.print("Scan the QR code to connect.\n")
    
    env = {**os.environ}
    if config.channels.whatsapp.bridge_token:
        env["BRIDGE_TOKEN"] = config.channels.whatsapp.bridge_token
    
    try:
        subprocess.run(["npm", "start"], cwd=bridge_dir, check=True, env=env)
    except subprocess.CalledProcessError as e:
        console.print(f"[red]Bridge failed: {e}[/red]")
    except FileNotFoundError:
        console.print("[red]npm not found. Please install Node.js.[/red]")


# ============================================================================
# Cron Commands
# ============================================================================

cron_app = typer.Typer(help="Manage scheduled tasks")
app.add_typer(cron_app, name="cron")


@cron_app.command("list")
def cron_list(
    all: bool = typer.Option(False, "--all", "-a", help="Include disabled jobs"),
):
    """List scheduled jobs."""
    from caiocore.config.loader import get_data_dir
    from caiocore.cron.service import CronService
    
    store_path = get_data_dir() / "cron" / "jobs.json"
    service = CronService(store_path)
    
    jobs = service.list_jobs(include_disabled=all)
    
    if not jobs:
        console.print("No scheduled jobs.")
        return
    
    table = Table(title="Scheduled Jobs")
    table.add_column("ID", style="cyan")
    table.add_column("Name")
    table.add_column("Schedule")
    table.add_column("Status")
    table.add_column("Next Run")
    
    import time
    from datetime import datetime as _dt
    from zoneinfo import ZoneInfo
    for job in jobs:
        # Format schedule
        if job.schedule.kind == "every":
            sched = f"every {(job.schedule.every_ms or 0) // 1000}s"
        elif job.schedule.kind == "cron":
            sched = f"{job.schedule.expr or ''} ({job.schedule.tz})" if job.schedule.tz else (job.schedule.expr or "")
        else:
            sched = "one-time"
        
        # Format next run
        next_run = ""
        if job.state.next_run_at_ms:
            ts = job.state.next_run_at_ms / 1000
            try:
                tz = ZoneInfo(job.schedule.tz) if job.schedule.tz else None
                next_run = _dt.fromtimestamp(ts, tz).strftime("%Y-%m-%d %H:%M")
            except Exception:
                next_run = time.strftime("%Y-%m-%d %H:%M", time.localtime(ts))
        
        status = "[green]enabled[/green]" if job.enabled else "[dim]disabled[/dim]"
        
        table.add_row(job.id, job.name, sched, status, next_run)
    
    console.print(table)


@cron_app.command("add")
def cron_add(
    name: str = typer.Option(..., "--name", "-n", help="Job name"),
    message: str = typer.Option(..., "--message", "-m", help="Message for agent"),
    every: int = typer.Option(None, "--every", "-e", help="Run every N seconds"),
    cron_expr: str = typer.Option(None, "--cron", "-c", help="Cron expression (e.g. '0 9 * * *')"),
    tz: str | None = typer.Option(None, "--tz", help="IANA timezone for cron (e.g. 'America/Vancouver')"),
    at: str = typer.Option(None, "--at", help="Run once at time (ISO format)"),
    deliver: bool = typer.Option(False, "--deliver", "-d", help="Deliver response to channel"),
    to: str = typer.Option(None, "--to", help="Recipient for delivery"),
    channel: str = typer.Option(None, "--channel", help="Channel for delivery (e.g. 'telegram', 'whatsapp')"),
):
    """Add a scheduled job."""
    from caiocore.config.loader import get_data_dir
    from caiocore.cron.service import CronService
    from caiocore.cron.types import CronSchedule
    
    if tz and not cron_expr:
        console.print("[red]Error: --tz can only be used with --cron[/red]")
        raise typer.Exit(1)

    # Determine schedule type
    if every:
        schedule = CronSchedule(kind="every", every_ms=every * 1000)
    elif cron_expr:
        schedule = CronSchedule(kind="cron", expr=cron_expr, tz=tz)
    elif at:
        import datetime
        dt = datetime.datetime.fromisoformat(at)
        schedule = CronSchedule(kind="at", at_ms=int(dt.timestamp() * 1000))
    else:
        console.print("[red]Error: Must specify --every, --cron, or --at[/red]")
        raise typer.Exit(1)
    
    store_path = get_data_dir() / "cron" / "jobs.json"
    service = CronService(store_path)
    
    try:
        job = service.add_job(
            name=name,
            schedule=schedule,
            message=message,
            deliver=deliver,
            to=to,
            channel=channel,
        )
    except ValueError as e:
        console.print(f"[red]Error: {e}[/red]")
        raise typer.Exit(1) from e

    console.print(f"[green]✓[/green] Added job '{job.name}' ({job.id})")


@cron_app.command("remove")
def cron_remove(
    job_id: str = typer.Argument(..., help="Job ID to remove"),
):
    """Remove a scheduled job."""
    from caiocore.config.loader import get_data_dir
    from caiocore.cron.service import CronService
    
    store_path = get_data_dir() / "cron" / "jobs.json"
    service = CronService(store_path)
    
    if service.remove_job(job_id):
        console.print(f"[green]✓[/green] Removed job {job_id}")
    else:
        console.print(f"[red]Job {job_id} not found[/red]")


@cron_app.command("enable")
def cron_enable(
    job_id: str = typer.Argument(..., help="Job ID"),
    disable: bool = typer.Option(False, "--disable", help="Disable instead of enable"),
):
    """Enable or disable a job."""
    from caiocore.config.loader import get_data_dir
    from caiocore.cron.service import CronService
    
    store_path = get_data_dir() / "cron" / "jobs.json"
    service = CronService(store_path)
    
    job = service.enable_job(job_id, enabled=not disable)
    if job:
        status = "disabled" if disable else "enabled"
        console.print(f"[green]✓[/green] Job '{job.name}' {status}")
    else:
        console.print(f"[red]Job {job_id} not found[/red]")


@cron_app.command("run")
def cron_run(
    job_id: str = typer.Argument(..., help="Job ID to run"),
    force: bool = typer.Option(False, "--force", "-f", help="Run even if disabled"),
):
    """Manually run a job."""
    from loguru import logger
    from caiocore.config.loader import load_config, get_data_dir
    from caiocore.cron.service import CronService
    from caiocore.cron.types import CronJob
    from caiocore.bus.queue import MessageBus
    from caiocore.agent.loop import AgentLoop
    logger.disable("caiocore")

    config = load_config()
    provider = _make_provider(config)
    bus = MessageBus()
    agent_loop = AgentLoop(
        bus=bus,
        provider=provider,
        workspace=config.workspace_path,
        model=config.agents.defaults.model,
        temperature=config.agents.defaults.temperature,
        max_tokens=config.agents.defaults.max_tokens,
        max_iterations=config.agents.defaults.max_tool_iterations,
        memory_window=config.agents.defaults.memory_window,
        brave_api_key=config.tools.web.search.api_key or None,
        exec_config=config.tools.exec,
        restrict_to_workspace=config.tools.restrict_to_workspace,
        mcp_servers=config.tools.mcp_servers,
    )

    store_path = get_data_dir() / "cron" / "jobs.json"
    service = CronService(store_path)

    result_holder = []

    async def on_job(job: CronJob) -> str | None:
        response = await agent_loop.process_direct(
            job.payload.message,
            session_key=f"cron:{job.id}",
            channel=job.payload.channel or "cli",
            chat_id=job.payload.to or "direct",
        )
        result_holder.append(response)
        return response

    service.on_job = on_job

    async def run():
        return await service.run_job(job_id, force=force)

    if asyncio.run(run()):
        console.print("[green]✓[/green] Job executed")
        if result_holder:
            _print_agent_response(result_holder[0], render_markdown=True)
    else:
        console.print(f"[red]Failed to run job {job_id}[/red]")


# ============================================================================
# Status Commands
# ============================================================================


@app.command()
def status():
    """Show caio status."""
    from caiocore.config.loader import load_config, get_config_path

    config_path = get_config_path()
    config = load_config()
    workspace = config.workspace_path

    console.print(f"{__logo__} Caio Status\n")

    console.print(f"Config: {config_path} {'[green]✓[/green]' if config_path.exists() else '[red]✗[/red]'}")
    console.print(f"Workspace: {workspace} {'[green]✓[/green]' if workspace.exists() else '[red]✗[/red]'}")

    if config_path.exists():
        from caiocore.providers.registry import PROVIDERS

        console.print(f"Model: {config.agents.defaults.model}")
        
        # Check API keys from registry
        for spec in PROVIDERS:
            p = getattr(config.providers, spec.name, None)
            if p is None:
                continue
            if spec.is_oauth:
                console.print(f"{spec.label}: [green]✓ (OAuth)[/green]")
            elif spec.is_local:
                # Local deployments show api_base instead of api_key
                if p.api_base:
                    console.print(f"{spec.label}: [green]✓ {p.api_base}[/green]")
                else:
                    console.print(f"{spec.label}: [dim]not set[/dim]")
            else:
                has_key = bool(p.api_key)
                console.print(f"{spec.label}: {'[green]✓[/green]' if has_key else '[dim]not set[/dim]'}")


# ============================================================================
# OAuth Login
# ============================================================================

provider_app = typer.Typer(help="Manage providers")
app.add_typer(provider_app, name="provider")


_LOGIN_HANDLERS: dict[str, callable] = {}


def _register_login(name: str):
    def decorator(fn):
        _LOGIN_HANDLERS[name] = fn
        return fn
    return decorator


@provider_app.command("login")
def provider_login(
    provider: str = typer.Argument(..., help="OAuth provider (e.g. 'openai-codex', 'github-copilot')"),
):
    """Authenticate with an OAuth provider."""
    from caiocore.providers.registry import PROVIDERS

    key = provider.replace("-", "_")
    spec = next((s for s in PROVIDERS if s.name == key and s.is_oauth), None)
    if not spec:
        names = ", ".join(s.name.replace("_", "-") for s in PROVIDERS if s.is_oauth)
        console.print(f"[red]Unknown OAuth provider: {provider}[/red]  Supported: {names}")
        raise typer.Exit(1)

    handler = _LOGIN_HANDLERS.get(spec.name)
    if not handler:
        console.print(f"[red]Login not implemented for {spec.label}[/red]")
        raise typer.Exit(1)

    console.print(f"{__logo__} OAuth Login - {spec.label}\n")
    handler()


@_register_login("openai_codex")
def _login_openai_codex() -> None:
    try:
        from oauth_cli_kit import get_token, login_oauth_interactive
        token = None
        try:
            token = get_token()
        except Exception:
            pass
        if not (token and token.access):
            console.print("[cyan]Starting interactive OAuth login...[/cyan]\n")
            token = login_oauth_interactive(
                print_fn=lambda s: console.print(s),
                prompt_fn=lambda s: typer.prompt(s),
            )
        if not (token and token.access):
            console.print("[red]✗ Authentication failed[/red]")
            raise typer.Exit(1)
        console.print(f"[green]✓ Authenticated with OpenAI Codex[/green]  [dim]{token.account_id}[/dim]")
    except ImportError:
        console.print("[red]oauth_cli_kit not installed. Run: pip install oauth-cli-kit[/red]")
        raise typer.Exit(1)


@_register_login("github_copilot")
def _login_github_copilot() -> None:
    import asyncio

    console.print("[cyan]Starting GitHub Copilot device flow...[/cyan]\n")

    async def _trigger():
        from litellm import acompletion
        await acompletion(model="github_copilot/gpt-4o", messages=[{"role": "user", "content": "hi"}], max_tokens=1)

    try:
        asyncio.run(_trigger())
        console.print("[green]✓ Authenticated with GitHub Copilot[/green]")
    except Exception as e:
        console.print(f"[red]Authentication error: {e}[/red]")
        raise typer.Exit(1)


if __name__ == "__main__":
    app()
