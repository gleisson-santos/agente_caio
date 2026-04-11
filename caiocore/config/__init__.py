"""Configuration module for caiocore."""

from caiocore.config.loader import load_config, get_config_path
from caiocore.config.schema import Config

__all__ = ["Config", "load_config", "get_config_path"]
