"""Workflow engine for structured agent task execution."""

import asyncio
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional
from datetime import datetime

from loguru import logger
from caiocore.bus.events import OutboundMessage, InboundMessage
from caiocore.bus.queue import MessageBus


class WorkflowEngine:
    """
    Structured Workflow Engine for AgentOS.
    
    Allows defining a sequence of steps (actions) that an agent follows.
    Inspired by Agno/PydanticAI pipelines.
    """
    
    def __init__(self, agent, bus: MessageBus):
        self.agent = agent
        self.bus = bus
        self._contexts: Dict[str, Dict[str, Any]] = {}

    async def execute(self, workflow_id: str, definition: Dict[str, Any], initial_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Execute a defined workflow.
        
        definition: {
            "name": "Sync Workflow",
            "steps": [
                { "name": "get_data", "action": "tool", "tool": "exec", "args": { "command": "ls" } },
                { "name": "analyze", "action": "llm", "prompt": "Summarize this: {{get_data.output}}" },
                { "name": "alert", "action": "notify", "channel": "telegram", "message": "Result: {{analyze.output}}" }
            ]
        }
        """
        name = definition.get("name", workflow_id)
        steps = definition.get("steps", [])
        context = initial_context or {}
        context["_workflow"] = {"id": workflow_id, "name": name, "started_at": datetime.now().isoformat()}
        
        logger.info("Workflow [{}]: Starting execution", name)
        
        for i, step in enumerate(steps):
            step_name = step.get("name", f"step_{i}")
            action = step.get("action")
            
            logger.info("Workflow [{}]: Executing step '{}' ({})", name, step_name, action)
            
            try:
                if action == "tool":
                    result = await self._handle_tool(step, context)
                    context[step_name] = {"output": result}
                
                elif action == "llm":
                    result = await self._handle_llm(step, context)
                    context[step_name] = {"output": result}
                
                elif action == "notify":
                    await self._handle_notify(step, context)
                
                elif action == "wait":
                    seconds = step.get("seconds", 1)
                    await asyncio.sleep(seconds)
                
                elif action == "condition":
                    # Simple if-then logic
                    pass # To be implemented
                    
            except Exception as e:
                logger.error("Workflow [{}]: Step '{}' failed: {}", name, step_name, e)
                context[step_name] = {"status": "error", "error": str(e)}
                if step.get("critical", True):
                    logger.error("Workflow [{}]: Aborting due to critical failure", name)
                    break
        
        context["_workflow"]["completed_at"] = datetime.now().isoformat()
        logger.info("Workflow [{}]: Execution finished", name)
        return context

    async def _handle_tool(self, step: Dict[str, Any], context: Dict[str, Any]) -> str:
        tool_name = step.get("tool")
        args = step.get("args", {})
        
        # Render template variables in args
        rendered_args = self._render_template_obj(args, context)
        
        logger.debug("Workflow: Calling tool {} with {}", tool_name, rendered_args)
        return await self.agent.tools.execute(tool_name, rendered_args)

    async def _handle_llm(self, step: Dict[str, Any], context: Dict[str, Any]) -> str:
        prompt = step.get("prompt", "")
        rendered_prompt = self._render_template_str(prompt, context)
        
        logger.debug("Workflow: Sending prompt to LLM: {}", rendered_prompt[:100])
        
        # Use a dedicated session for the workflow step to avoid polluting main history
        wf_id = context["_workflow"]["id"]
        response = await self.agent.process_direct(
            rendered_prompt, 
            session_key=f"workflow:{wf_id}",
            channel="system",
            chat_id="workflow"
        )
        return response

    async def _handle_notify(self, step: Dict[str, Any], context: Dict[Dict, Any]) -> None:
        channel = step.get("channel", "cli")
        chat_id = step.get("chat_id", "direct")
        message = step.get("message", "")
        
        rendered_message = self._render_template_str(message, context)
        
        logger.debug("Workflow: Notifying {}/{} with {}", channel, chat_id, rendered_message[:50])
        
        await self.bus.publish_outbound(OutboundMessage(
            channel=channel,
            chat_id=chat_id,
            content=rendered_message
        ))

    def _render_template_str(self, text: str, context: Dict[str, Any]) -> str:
        if not isinstance(text, str):
            return text
            
        def replacer(match):
            key_path = match.group(1).strip().split(".")
            val = context
            for key in key_path:
                if isinstance(val, dict) and key in val:
                    val = val[key]
                else:
                    return match.group(0) # Keep original if not found
            return str(val)

        return re.sub(r"\{\{(.*?)\}\}", replacer, text)

    def _render_template_obj(self, obj: Any, context: Dict[str, Any]) -> Any:
        if isinstance(obj, str):
            return self._render_template_str(obj, context)
        if isinstance(obj, dict):
            return {k: self._render_template_obj(v, context) for k, v in obj.items()}
        if isinstance(obj, list):
            return [self._render_template_obj(x, context) for x in obj]
        return obj
