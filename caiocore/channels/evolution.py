"""WhatsApp integration via Evolution API."""

import asyncio
import httpx
from typing import Any
from loguru import logger

from caiocore.bus.events import OutboundMessage
from caiocore.bus.queue import MessageBus
from caiocore.channels.base import BaseChannel
from caiocore.config.schema import EvolutionConfig


class EvolutionChannel(BaseChannel):
    """
    WhatsApp channel using the Evolution API.
    
    Outbound: via Evolution REST API.
    Inbound: via Webhooks received by the Gateway.
    """
    
    name = "evolution"
    
    def __init__(self, config: EvolutionConfig, bus: MessageBus):
        super().__init__(config, bus)
        self.config = config
        self.client = httpx.AsyncClient(
            base_url=config.base_url.rstrip("/"),
            headers={
                "apikey": config.api_key,
                "Content-Type": "application/json"
            },
            timeout=30.0
        )

    async def start(self) -> None:
        """Start the Evolution channel."""
        self._running = True
        logger.info("Evolution channel initiated. Monitoring instance: {}", self.config.instance_name)

    async def stop(self) -> None:
        """Stop the Evolution channel."""
        self._running = False
        await self.client.aclose()

    async def send(self, msg: OutboundMessage) -> None:
        """Send a message through Evolution API."""
        if not self.config.base_url:
            logger.warning("Evolution base_url not configured")
            return
            
        try:
            # Evolution API text send endpoint
            url = f"/message/sendText/{self.config.instance_name}"
            
            # Format chat_id correctly (Evolution expects number or number@s.whatsapp.net)
            target = msg.chat_id
            if "@" not in target and not target.isdigit():
                 # Handle cases like group or status if needed, but usually it's just number
                 pass
            
            payload = {
                "number": target,
                "options": {
                    "delay": 1200,
                    "presence": "composing",
                    "linkPreview": True
                },
                "text": msg.content
            }
            
            response = await self.client.post(url, json=payload)
            response.raise_for_status()
            logger.debug("Evolution: Message sent to {}", target)
            
        except Exception as e:
            logger.error("Evolution: Error sending message to {}: {}", msg.chat_id, e)

    async def handle_webhook(self, data: dict[str, Any]) -> None:
        """
        Process incoming webhook from Evolution API.
        Called by the FastAPI router.
        """
        event = data.get("event")
        # Handle message upsert (new incoming message)
        if event != "messages.upsert":
            return
            
        msg_payload = data.get("data", {})
        message_obj = msg_payload.get("message", {})
        key = msg_payload.get("key", {})
        
        if key.get("fromMe"):
            return
            
        remote_jid = key.get("remoteJid")
        if not remote_jid:
            return
            
        # Allowed filter
        sender_id = remote_jid.split("@")[0]
        if self.config.allow_from and sender_id not in self.config.allow_from and remote_jid not in self.config.allow_from:
            logger.warning("Evolution: Message from unauthorized sender: {}", remote_jid)
            return

        content = ""
        # Support various message types
        if "conversation" in message_obj:
            content = message_obj["conversation"]
        elif "extendedTextMessage" in message_obj:
            content = message_obj["extendedTextMessage"].get("text", "")
        elif "imageMessage" in message_obj:
            content = message_obj["imageMessage"].get("caption", "[Image]")
        elif "videoMessage" in message_obj:
            content = message_obj["videoMessage"].get("caption", "[Video]")
        elif "documentMessage" in message_obj:
            content = message_obj["documentMessage"].get("caption", "[Document]")
        elif "audioMessage" in message_obj:
            content = "[Voice Message]"
            
        if not content:
            return
            
        logger.info("Evolution: Received message from {}: {}", sender_id, content[:50])

        await self._handle_message(
            sender_id=sender_id,
            chat_id=remote_jid,
            content=content,
            metadata={
                "instance": data.get("instance"),
                "message_id": key.get("id"),
                "is_group": remote_jid.endswith("@g.us")
            }
        )
