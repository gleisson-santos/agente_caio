"""
Entry point for running caio as a module: python -m caio
"""

import sys
from loguru import logger

from caiocore.cli.commands import app
from caiocore.config.loader import load_config
from caiocore.config.validator import ensure_env_loaded, validate_config

if __name__ == "__main__":
    # Load .env before anything else
    ensure_env_loaded()
    # Load and validate config
    try:
        cfg = load_config()
        if not validate_config(cfg):
            logger.warning("Configuration validation failed. Some features may not work.")
    except Exception as e:
        logger.error(f"Failed to load configuration: {e}")
        sys.exit(1)

    app()
