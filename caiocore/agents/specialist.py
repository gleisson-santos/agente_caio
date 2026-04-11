import asyncio
import os
from pathlib import Path
from typing import Any
from caiocore.agents.sdk import BaseAgent
from loguru import logger

class SpecialistAgent(BaseAgent):
    """
    A passive specialist agent that holds specific instructions (prompts) 
    intended to be used by the main orchestrator or as a standalone persona.
    
    Each specialist has a restricted set of tools (allowed_tools) that 
    defines what it can do. The main Caio agent keeps full tool access.
    """

    def __init__(self, agent_id: str, name: str, role: str, 
                 instruction_file: str | None = None, tier: int = 2,
                 allowed_tools: list[str] | None = None):
        super().__init__(agent_id, name, role, tier=tier)
        self.instruction_path = None
        if instruction_file:
            self.instruction_path = Path(os.path.dirname(__file__)) / "premium" / instruction_file
        self._instructions = ""
        self._allowed_tools = allowed_tools  # None = no restriction (backwards compat)
        if self.instruction_path:
            self._load_instructions()

    def _load_instructions(self):
        try:
            if self.instruction_path.exists():
                self._instructions = self.instruction_path.read_text(encoding="utf-8")
                logger.info("SpecialistAgent {}: instructions loaded from {}", self.agent_id, self.instruction_path)
                self.status = "online"
            else:
                logger.warning("SpecialistAgent {}: instruction file not found at {}", self.agent_id, self.instruction_path)
        except Exception as e:
            logger.error("SpecialistAgent {}: error loading instructions: {}", self.agent_id, e)

    def get_instructions(self) -> str:
        return self._instructions

    def get_allowed_tools(self) -> list[str] | None:
        """Return the list of tools this specialist is allowed to use.
        None means no restriction (use all tools)."""
        return self._allowed_tools

    async def _run_loop(self) -> None:
        """Specialists are usually passive, but we can implement a periodic health check."""
        while self._running:
            self.status = "online"
            await asyncio.sleep(60)

    def get_status(self) -> dict[str, Any]:
        status = super().get_status()
        status["is_passive"] = True
        status["has_instructions"] = bool(self._instructions)
        status["allowed_tools"] = self._allowed_tools
        return status
