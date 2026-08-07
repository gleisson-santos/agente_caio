"""Configuration validation and health checks."""

import os
import sys
from pathlib import Path
from typing import Optional

from loguru import logger

from caiocore.config.schema import Config


def validate_config(cfg: Config) -> bool:
    """
    Validate configuration and warn about missing critical settings.
    Returns True if valid, False if critical issues found.
    """
    valid = True

    # Check for empty API keys
    providers = cfg.providers
    if hasattr(providers, 'omniroute'):
        if not providers.omniroute.api_key:
            logger.warning("OMNIROUTE_API_KEY is not set. Some features may fail.")
        if not providers.omniroute.api_base:
            logger.warning("OMNIROUTE_BASE_URL is not set. Using default.")

    # Check Telegram
    if cfg.telegram_enabled:
        if not cfg.telegram_token:
            logger.error("Telegram is enabled but TELEGRAM_BOT_TOKEN is missing.")
            valid = False

    # Check email
    if cfg.email_enabled:
        if not cfg.email_user or not cfg.email_pass:
            logger.error("Email is enabled but EMAIL_USER or EMAIL_PASS is missing.")
            valid = False

    # Check search
    if cfg.tools.web.search.provider == "brave" and not cfg.tools.web.search.api_key:
        logger.warning("Brave search enabled but BRAVE_API_KEY is missing.")

    # Check workspace directory
    ws = Path(cfg.workspace).expanduser()
    if not ws.exists():
        try:
            ws.mkdir(parents=True, exist_ok=True)
            logger.info(f"Created workspace directory: {ws}")
        except Exception as e:
            logger.error(f"Cannot create workspace directory {ws}: {e}")
            valid = False

    # Check data directory
    from caiocore.utils.helpers import get_data_path
    data_dir = get_data_path()
    if not data_dir.exists():
        try:
            data_dir.mkdir(parents=True, exist_ok=True)
            logger.info(f"Created data directory: {data_dir}")
        except Exception as e:
            logger.error(f"Cannot create data directory {data_dir}: {e}")
            valid = False

    return valid


def ensure_env_loaded() -> None:
    """Load .env file if present."""
    from dotenv import load_dotenv
    env_path = Path(".env")
    if env_path.exists():
        load_dotenv(env_path)
        logger.info(f"Loaded environment from {env_path}")
    else:
        example = Path(".env.example")
        if example.exists():
            logger.warning(".env file not found. Copy .env.example to .env and fill in your credentials.")
        else:
            logger.warning("No .env file found. Using system environment variables.")
