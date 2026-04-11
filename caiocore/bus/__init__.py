"""Message bus module for decoupled channel-agent communication."""

from caiocore.bus.events import InboundMessage, OutboundMessage
from caiocore.bus.queue import MessageBus

__all__ = ["MessageBus", "InboundMessage", "OutboundMessage"]
