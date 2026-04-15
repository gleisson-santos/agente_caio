"""A2A (Agent-to-Agent) server endpoint — receives messages from remote agents."""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Any, Optional
from loguru import logger

router = APIRouter(prefix="/api/a2a", tags=["a2a"])


class A2AInboundMessage(BaseModel):
    protocol: str = "a2a/v1"
    message_id: str
    sender: str
    content: str
    metadata: dict[str, Any] = {}


class A2AResponse(BaseModel):
    protocol: str = "a2a/v1"
    status: str = "received"
    content: str = ""
    message_id: str = ""


@router.post("/receive", response_model=A2AResponse)
async def receive_a2a_message(msg: A2AInboundMessage, request: Request):
    """Receive a message from a remote agent via A2A protocol."""
    logger.info("A2A: Received from '{}': {}", msg.sender, msg.content[:80])

    # Get the agent from the API globals
    from caiocore.server.api import _agent, _bus
    if not _agent or not _bus:
        raise HTTPException(status_code=503, detail="Agent not initialized")

    try:
        from caiocore.bus.events import InboundMessage

        # Route the A2A message through the normal agent pipeline
        inbound = InboundMessage(
            channel="a2a",
            chat_id=f"a2a:{msg.sender}",
            sender_id=msg.sender,
            content=f"[Mensagem A2A de {msg.sender}]: {msg.content}",
            metadata={"a2a_message_id": msg.message_id, **msg.metadata},
        )

        response = await _agent._process_message(inbound)
        reply_content = response.content if response else "Mensagem recebida."

        return A2AResponse(
            status="ok",
            content=reply_content,
            message_id=msg.message_id,
        )

    except Exception as e:
        logger.error("A2A processing error: {}", e)
        return A2AResponse(
            status="error",
            content=f"Erro ao processar: {str(e)}",
            message_id=msg.message_id,
        )


@router.get("/info")
async def a2a_info():
    """Return A2A endpoint metadata for agent discovery."""
    return {
        "protocol": "a2a/v1",
        "agent_id": "caio-core",
        "agent_name": "Agente Caio",
        "capabilities": ["chat", "tools", "document_generation", "pdf_analysis", "web_search"],
        "endpoints": {
            "receive": "/api/a2a/receive",
            "info": "/api/a2a/info",
        },
    }
