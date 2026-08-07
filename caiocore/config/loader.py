"""Configuration loading utilities."""

import json
from pathlib import Path

from caiocore.config.schema import Config


def get_config_path() -> Path:
    """Get the default configuration file path. Favor local config.json if present."""
    local = Path("config.json")
    if local.exists():
        return local
    return get_data_dir() / "config.json"


def get_data_dir() -> Path:
    """Get the caio data directory."""
    from caiocore.utils.helpers import get_data_path
    return get_data_path()


def load_config(config_path: Path | None = None) -> Config:
    """
    Load configuration from file or create default.

    Args:
        config_path: Optional path to config file. Uses default if not provided.

    Returns:
        Loaded configuration object.
    """
    import os
    path = config_path or get_config_path()

    if not path.exists():
        # Auto-creation logic for better distribution experience
        example = Path("config.example.json")
        if example.exists():
            try:
                import shutil
                shutil.copy(example, path)
                print(f"Project Setup: Created {path} from config.example.json")
            except Exception as e:
                print(f"Setup Error: Failed to copy config.example.json: {e}")
        else:
            # Create a completely fresh default if no example exists
            cfg = Config()
            save_config(cfg, path)
            print(f"Project Setup: Initialized fresh config at {path}")

    if path.exists():
        try:
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
            data = _migrate_config(data)
            # Override sensitive fields from environment variables
            data = _apply_env_overrides(data)
            return Config.model_validate(data)
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Warning: Failed to load config from {path}: {e}")
            print("Using default configuration.")

    return Config()


def _apply_env_overrides(data: dict) -> dict:
    """Override configuration values from environment variables."""
    import os

    # Provider keys
    key_map = {
        "openrouter": "OPENROUTER_API_KEY",
        "gemini": "GEMINI_API_KEY",
        "deepseek": "DEEPSEEK_API_KEY",
        "openai": "OPENAI_API_KEY",
        "groq": "GROQ_API_KEY",
        "anthropic": "ANTHROPIC_API_KEY",
        "omniroute": "OMNIROUTE_API_KEY",
    }

    providers = data.get("providers", {})
    for prov, env_var in key_map.items():
        val = os.getenv(env_var)
        if val:
            if "providerKeys" not in providers:
                providers["providerKeys"] = {}
            providers["providerKeys"][prov] = val

    # OmniRoute base URL
    base_url = os.getenv("OMNIROUTE_BASE_URL")
    if base_url:
        if "providerBases" not in providers:
            providers["providerBases"] = {}
        providers["providerBases"]["omniroute"] = base_url

    # OmniRoute combo ID
    combo_id = os.getenv("OMNIROUTE_COMBO_ID")
    if combo_id:
        if "extra_headers" not in providers:
            providers["extra_headers"] = {}
        if "omniroute" not in providers["extra_headers"]:
            providers["extra_headers"]["omniroute"] = {}
        providers["extra_headers"]["omniroute"]["X-Combo-Id"] = combo_id

    # Telegram
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if token:
        data["telegramToken"] = token
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    if chat_id:
        data["telegramChatId"] = chat_id

    # Email
    email_user = os.getenv("EMAIL_USER")
    if email_user:
        data["emailUser"] = email_user
    email_pass = os.getenv("EMAIL_PASS")
    if email_pass:
        data["emailPass"] = email_pass
    smtp_host = os.getenv("SMTP_HOST")
    if smtp_host:
        data["smtpHost"] = smtp_host
    smtp_port = os.getenv("SMTP_PORT")
    if smtp_port:
        data["smtpPort"] = int(smtp_port)

    # Search
    brave_key = os.getenv("BRAVE_API_KEY")
    if brave_key:
        data.setdefault("tools", {}).setdefault("web", {}).setdefault("", {})["api_key"] = brave_key
    tavily_key = os.getenv("TAVILY_API_KEY")
    if tavily_key:
        data.setdefault("tools", {}).setdefault("web", {}).setdefault("", {})["tavily_key"] = tavily_key

    data["providers"] = providers
    return data


def save_config(config: Config, config_path: Path | None = None) -> None:
    """
    Save configuration to file.

    Args:
        config: Configuration to save.
        config_path: Optional path to save to. Uses default if not provided.
    """
    path = config_path or get_config_path()
    path.parent.mkdir(parents=True, exist_ok=True)

    data = config.model_dump(by_alias=True)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def _migrate_config(data: dict) -> dict:
    """Migrate old config formats to current."""
    # Move tools.exec.restrictToWorkspace → tools.restrictToWorkspace
    tools = data.get("tools", {})
    exec_cfg = tools.get("exec", {})
    if "restrictToWorkspace" in exec_cfg and "restrictToWorkspace" not in tools:
        tools["restrictToWorkspace"] = exec_cfg.pop("restrictToWorkspace")
    return data
