"""Channel manager for coordinating chat channels."""

from __future__ import annotations

import asyncio
from typing import Any

from loguru import logger

from caiocore.bus.events import OutboundMessage
from caiocore.bus.queue import MessageBus
from caiocore.channels.base import BaseChannel
from caiocore.config.schema import Config


class ChannelManager:
    """
    Manages chat channels and coordinates message routing.
    
    Responsibilities:
    - Initialize enabled channels (Telegram, WhatsApp, etc.)
    - Start/stop channels
    - Route outbound messages
    """
    
    def __init__(self, config: Config, bus: MessageBus):
        self.config = config
        self.bus = bus
        self.channels: dict[str, BaseChannel] = {}
        self._dispatch_task: asyncio.Task | None = None
        
        self._init_channels()
    
    def _init_channels(self) -> None:
        """Initialize channels based on config. Only creates if not already exists."""
        
        # Telegram channel
        if self.config.channels.telegram.enabled and "telegram" not in self.channels:
            try:
                from caiocore.channels.telegram import TelegramChannel
                self.channels["telegram"] = TelegramChannel(
                    self.config.channels.telegram,
                    self.bus,
                    groq_api_key=self.config.providers.groq.api_key,
                )
                logger.info("Telegram channel created")
            except ImportError as e:
                logger.warning("Telegram channel not available: {}", e)
        
        # WhatsApp channel
        if self.config.channels.whatsapp.enabled and "whatsapp" not in self.channels:
            try:
                from caiocore.channels.whatsapp import WhatsAppChannel
                self.channels["whatsapp"] = WhatsAppChannel(
                    self.config.channels.whatsapp, self.bus
                )
                logger.info("WhatsApp channel created")
            except ImportError as e:
                logger.warning("WhatsApp channel not available: {}", e)

        # Evolution channel
        if self.config.channels.evolution.enabled and "evolution" not in self.channels:
            try:
                from caiocore.channels.evolution import EvolutionChannel

                self.channels["evolution"] = EvolutionChannel(
                    self.config.channels.evolution, self.bus
                )
                logger.info("Evolution channel (WhatsApp) created")
            except ImportError as e:
                logger.warning("Evolution channel not available: {}", e)

        # Discord channel
        if self.config.channels.discord.enabled and "discord" not in self.channels:
            try:
                from caiocore.channels.discord import DiscordChannel
                self.channels["discord"] = DiscordChannel(
                    self.config.channels.discord, self.bus
                )
                logger.info("Discord channel created")
            except ImportError as e:
                logger.warning("Discord channel not available: {}", e)
        
        # Feishu channel
        if self.config.channels.feishu.enabled and "feishu" not in self.channels:
            try:
                from caiocore.channels.feishu import FeishuChannel
                self.channels["feishu"] = FeishuChannel(
                    self.config.channels.feishu, self.bus
                )
                logger.info("Feishu channel created")
            except ImportError as e:
                logger.warning("Feishu channel not available: {}", e)

        # Mochat channel
        if self.config.channels.mochat.enabled and "mochat" not in self.channels:
            try:
                from caiocore.channels.mochat import MochatChannel

                self.channels["mochat"] = MochatChannel(
                    self.config.channels.mochat, self.bus
                )
                logger.info("Mochat channel created")
            except ImportError as e:
                logger.warning("Mochat channel not available: {}", e)

        # DingTalk channel
        if self.config.channels.dingtalk.enabled and "dingtalk" not in self.channels:
            try:
                from caiocore.channels.dingtalk import DingTalkChannel
                self.channels["dingtalk"] = DingTalkChannel(
                    self.config.channels.dingtalk, self.bus
                )
                logger.info("DingTalk channel created")
            except ImportError as e:
                logger.warning("DingTalk channel not available: {}", e)

        # Email channel
        if self.config.channels.email.enabled and "email" not in self.channels:
            try:
                from caiocore.channels.email import EmailChannel

                # Resolve Telegram notify target for cross-channel email alerts
                tg = self.config.channels.telegram
                notify_channel = ""
                notify_chat_id = ""
                if tg.enabled:
                    notify_channel = "telegram"
                    notify_chat_id = tg.notify_chat_id or (tg.allow_from[0] if tg.allow_from else "")

                self.channels["email"] = EmailChannel(
                    self.config.channels.email, self.bus,
                    notify_channel=notify_channel,
                    notify_chat_id=notify_chat_id,
                )
                logger.info("Email channel created")
            except ImportError as e:
                logger.warning("Email channel not available: {}", e)

        # Slack channel
        if self.config.channels.slack.enabled and "slack" not in self.channels:
            try:
                from caiocore.channels.slack import SlackChannel
                self.channels["slack"] = SlackChannel(
                    self.config.channels.slack, self.bus
                )
                logger.info("Slack channel created")
            except ImportError as e:
                logger.warning("Slack channel not available: {}", e)

        # QQ channel
        if self.config.channels.qq.enabled and "qq" not in self.channels:
            try:
                from caiocore.channels.qq import QQChannel
                self.channels["qq"] = QQChannel(
                    self.config.channels.qq,
                    self.bus,
                )
                logger.info("QQ channel created")
            except ImportError as e:
                logger.warning("QQ channel not available: {}", e)

    
    async def _start_channel(self, name: str, channel: BaseChannel) -> None:
        """Start a channel and log any exceptions."""
        try:
            await channel.start()
        except Exception as e:
            logger.error("Failed to start channel {}: {}", name, e)

    async def start_all(self) -> None:
        """Start all channels and the outbound dispatcher."""
        if not self.channels:
            logger.warning("No channels enabled")
            return
        
        # Start outbound dispatcher
        self._dispatch_task = asyncio.create_task(self._dispatch_outbound())
        
        # Start channels
        tasks = []
        for name, channel in self.channels.items():
            logger.info("Starting {} channel...", name)
            tasks.append(asyncio.create_task(self._start_channel(name, channel)))
        
        # Wait for all to complete (they should run forever)
        await asyncio.gather(*tasks, return_exceptions=True)
    
    async def stop_all(self) -> None:
        """Stop all channels and the dispatcher."""
        logger.info("Stopping all channels...")
        
        # Stop dispatcher
        if self._dispatch_task:
            self._dispatch_task.cancel()
            try:
                await self._dispatch_task
            except asyncio.CancelledError:
                pass
        
        # Stop all channels
        for name, channel in self.channels.items():
            try:
                await channel.stop()
                logger.info("Stopped {} channel", name)
            except Exception as e:
                logger.error("Error stopping {}: {}", name, e)
    
    async def _dispatch_outbound(self) -> None:
        """Dispatch outbound messages to the appropriate channel."""
        logger.info("Outbound dispatcher started")
        
        while True:
            try:
                msg = await asyncio.wait_for(
                    self.bus.consume_outbound(),
                    timeout=1.0
                )
                
                channel = self.channels.get(msg.channel)
                if channel:
                    try:
                        await channel.send(msg)
                    except Exception as e:
                        logger.error("Error sending to {}: {}", msg.channel, e)
                else:
                    logger.warning("Unknown channel: {}", msg.channel)
                    
            except asyncio.TimeoutError:
                continue
            except asyncio.CancelledError:
                break
    
    def get_channel(self, name: str) -> BaseChannel | None:
        """Get a channel by name."""
        return self.channels.get(name)
    
    def get_status(self) -> dict[str, Any]:
        """Get status of all channels."""
        return {
            name: {
                "enabled": True,
                "running": channel.is_running
            }
            for name, channel in self.channels.items()
        }

    async def sync_with_config(self, config: Config) -> None:
        """Sync running channels with the provided config (Hot-reload)."""
        logger.info("Manager: Syncing channels with new config...")
        self.config = config
        
        # 1. Map expected enabled state
        enabled_maps = {
            "telegram": config.channels.telegram.enabled,
            "whatsapp": config.channels.whatsapp.enabled,
            "evolution": config.channels.evolution.enabled,
            "discord": config.channels.discord.enabled,
            "feishu": config.channels.feishu.enabled,
            "mochat": config.channels.mochat.enabled,
            "dingtalk": config.channels.dingtalk.enabled,
            "email": config.channels.email.enabled,
            "slack": config.channels.slack.enabled,
            "qq": config.channels.qq.enabled,
        }
        
        # 2. Stop channels that were disabled
        for name, channel in list(self.channels.items()):
            if not enabled_maps.get(name, False):
                logger.warning("Manager: Stopping disabled channel '{}'...", name)
                await channel.stop()
                del self.channels[name]
        
        # 3. Create newly enabled channels
        self._init_channels()
        
        # 4. Start channels that are not running
        for name, channel in self.channels.items():
            if not channel.is_running:
                logger.info("Manager: Starting new channel '{}'...", name)
                asyncio.create_task(self._start_channel(name, channel))

    
    @property
    def enabled_channels(self) -> list[str]:
        """Get list of enabled channel names."""
        return list(self.channels.keys())
