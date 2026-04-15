"""CLI Onboarding — guided interactive setup wizard.

Inspired by OpenClaw's `openclaw onboard` command.
Guides the user through configuring the Agente Caio stack.
"""

import json
import os
import subprocess
from pathlib import Path
from typing import Any

from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich.table import Table


console = Console()


def run_onboard():
    """Interactive onboarding wizard for Agente Caio."""
    console.clear()
    console.print(Panel.fit(
        "[bold cyan]🐈 Agente Caio — Setup Wizard[/bold cyan]\n\n"
        "Este assistente vai configurar sua instância do Caio.\n"
        "Responda as perguntas abaixo para gerar sua config.",
        border_style="cyan",
    ))
    console.print()

    # Step 1: Check prerequisites
    console.print("[bold]📋 Passo 1/5 — Verificando pré-requisitos...[/bold]")
    _check_prerequisites()
    console.print()

    # Step 2: API provider
    console.print("[bold]🔑 Passo 2/5 — Configuração da API de IA[/bold]")
    provider_config = _configure_provider()
    console.print()

    # Step 3: Channels
    console.print("[bold]📡 Passo 3/5 — Canais de Comunicação[/bold]")
    channel_config = _configure_channels()
    console.print()

    # Step 4: Domain and deploy
    console.print("[bold]🌐 Passo 4/5 — Domínio e Deploy[/bold]")
    deploy_config = _configure_deploy()
    console.print()

    # Step 5: Generate config
    console.print("[bold]📄 Passo 5/5 — Gerando configuração...[/bold]")
    config = _build_config(provider_config, channel_config, deploy_config)
    _write_config(config)

    console.print()
    console.print(Panel.fit(
        "[bold green]✅ Configuração concluída![/bold green]\n\n"
        "Próximos passos:\n"
        "  1. Revise o arquivo [cyan]config.json[/cyan]\n"
        "  2. Execute [cyan]caio gateway[/cyan] para iniciar o agente\n"
        "  3. Ou execute [cyan]caio chat[/cyan] para conversar no terminal",
        border_style="green",
    ))


def _check_prerequisites():
    """Check for Docker, Python, etc."""
    checks = {
        "Python": "python --version",
        "Docker": "docker --version",
        "Git": "git --version",
    }

    table = Table(show_header=False, box=None, padding=(0, 1))
    table.add_column("Status", width=3)
    table.add_column("Item")
    table.add_column("Version")

    for name, cmd in checks.items():
        try:
            result = subprocess.run(
                cmd.split(), capture_output=True, text=True, timeout=5
            )
            if result.returncode == 0:
                version = result.stdout.strip().split("\n")[0]
                table.add_row("✅", name, f"[dim]{version}[/dim]")
            else:
                table.add_row("⚠️", name, "[yellow]não encontrado[/yellow]")
        except Exception:
            table.add_row("❌", name, "[red]não disponível[/red]")

    console.print(table)


def _configure_provider() -> dict[str, Any]:
    """Configure the LLM provider."""
    provider = Prompt.ask(
        "Qual provedor de IA usar?",
        choices=["openrouter", "openai", "anthropic", "google"],
        default="openrouter",
    )

    api_key = Prompt.ask(f"API Key do {provider}", password=True)

    model_defaults = {
        "openrouter": "x-ai/grok-4-0414",
        "openai": "gpt-4o",
        "anthropic": "claude-sonnet-4-20250514",
        "google": "gemini-2.0-flash",
    }

    model = Prompt.ask(
        "Modelo padrão",
        default=model_defaults.get(provider, "gpt-4o"),
    )

    console.print(f"  ✅ Provedor: [cyan]{provider}[/cyan], Modelo: [cyan]{model}[/cyan]")

    return {
        "provider": provider,
        "api_key": api_key,
        "model": model,
    }


def _configure_channels() -> dict[str, Any]:
    """Configure communication channels."""
    channels = {}

    if Confirm.ask("Configurar Telegram?", default=True):
        token = Prompt.ask("Token do Bot Telegram", password=True)
        chat_id = Prompt.ask("Chat ID (seu user ID)")
        channels["telegram"] = {
            "enabled": True,
            "token": token,
            "allowed_ids": [chat_id],
        }
        console.print("  ✅ Telegram configurado")

    if Confirm.ask("Configurar WhatsApp (Evolution API)?", default=False):
        evo_url = Prompt.ask("URL da Evolution API", default="http://localhost:8080")
        evo_key = Prompt.ask("API Key da Evolution", password=True)
        instance = Prompt.ask("Nome da instância", default="caio")
        channels["whatsapp"] = {
            "enabled": True,
            "evolution_url": evo_url,
            "api_key": evo_key,
            "instance": instance,
        }
        console.print("  ✅ WhatsApp configurado")

    if Confirm.ask("Configurar Discord?", default=False):
        token = Prompt.ask("Token do Bot Discord", password=True)
        channels["discord"] = {
            "enabled": True,
            "token": token,
        }
        console.print("  ✅ Discord configurado")

    return channels


def _configure_deploy() -> dict[str, Any]:
    """Configure deployment settings."""
    deploy = {}

    use_docker = Confirm.ask("Deploy com Docker Swarm?", default=True)
    deploy["docker"] = use_docker

    if use_docker:
        domain = Prompt.ask("Domínio principal (ex: caio.meudominio.com)")
        deploy["domain"] = domain

        use_traefik = Confirm.ask("Usar Traefik como reverse proxy?", default=True)
        deploy["traefik"] = use_traefik

        if use_traefik:
            email = Prompt.ask("Email para certificado SSL (Let's Encrypt)")
            deploy["ssl_email"] = email
    else:
        deploy["port"] = int(Prompt.ask("Porta do gateway", default="18795"))

    return deploy


def _build_config(
    provider: dict, channels: dict, deploy: dict
) -> dict[str, Any]:
    """Build the final config.json."""
    config: dict[str, Any] = {
        "providers": {
            provider["provider"]: {
                "api_key": provider["api_key"],
            }
        },
        "model": provider["model"],
        "smart_routing": {
            "enabled": True,
            "light_model": "google/gemini-2.0-flash-lite",
        },
        "channels": channels,
        "gateway": {
            "host": "0.0.0.0",
            "port": deploy.get("port", 18795),
        },
    }

    if deploy.get("domain"):
        config["gateway"]["domain"] = deploy["domain"]

    return config


def _write_config(config: dict):
    """Write config.json to the workspace."""
    config_path = Path("config.json")

    if config_path.exists():
        if not Confirm.ask(
            f"[yellow]config.json já existe. Sobrescrever?[/yellow]",
            default=False,
        ):
            alt_path = Path("config.new.json")
            alt_path.write_text(json.dumps(config, indent=2, ensure_ascii=False))
            console.print(f"  📄 Config salvo como [cyan]{alt_path}[/cyan]")
            return

    config_path.write_text(json.dumps(config, indent=2, ensure_ascii=False))
    console.print(f"  📄 [green]config.json[/green] criado com sucesso!")
