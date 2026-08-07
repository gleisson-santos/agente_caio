"""Expert/ Specialist API routes."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from loguru import logger

from caiocore.agents.registry import AgentRegistry

router = APIRouter(prefix="/api/experts", tags=["experts"])

# In-memory store for chat sessions (could be replaced with Redis)
_chat_sessions: Dict[str, List[Dict[str, Any]]] = {}


class ChatRequest(BaseModel):
    expertId: str
    message: str


class ChatResponse(BaseModel):
    response: str


def _get_registry() -> AgentRegistry:
    """Get the global agent registry."""
    from caiocore.agents.registry import _registry
    return _registry


@router.get("/list")
async def list_experts():
    """List all registered specialist agents."""
    registry = _get_registry()
    experts = []
    
    # Get all agents from registry that are specialists
    for agent_id, agent in registry._agents.items():
        # Check if it's a specialist (has role attribute or is instance of SpecialistAgent)
        if hasattr(agent, 'role') or agent.__class__.__name__ == 'SpecialistAgent':
            # Build expert data
            expert = {
                "id": agent_id,
                "name": getattr(agent, 'name', agent_id),
                "role": getattr(agent, 'role', 'general'),
                "description": getattr(agent, 'description', ''),
                "status": getattr(agent, 'status', 'online'),  # Could be 'online', 'idle', 'offline'
                "tier": getattr(agent, 'tier', 2),
                "capabilities": getattr(agent, 'capabilities', []),
            }
            experts.append(expert)
    
    # If no specialists found, return some mock data for demo
    if not experts:
        logger.warning("No specialists registered, returning mock data")
        experts = [
            {
                "id": "voice-assistant",
                "name": "Assistente de Voz",
                "role": "voice",
                "description": "Processa e responde comandos por voz",
                "status": "online",
                "tier": 3,
                "capabilities": ["reconhecimento de voz", "síntese de fala", "comandos naturais"]
            },
            {
                "id": "calendar-agent",
                "name": "Agendador de Calendário",
                "role": "calendar",
                "description": "Gerencia compromissos e eventos no Google Calendar",
                "status": "online",
                "tier": 3,
                "capabilities": ["criar eventos", "listar compromissos", "buscar disponibilidade"]
            },
            {
                "id": "email-reader",
                "name": "Leitor de E-mails",
                "role": "email",
                "description": "Lê e responde e-mails da caixa de entrada",
                "status": "idle",
                "tier": 2,
                "capabilities": ["ler e-mails", "buscar por termo", "responder automaticamente"]
            },
            {
                "id": "web-navigator",
                "name": "Navegador Web",
                "role": "web",
                "description": "Realiza pesquisas e navega na internet",
                "status": "online",
                "tier": 3,
                "capabilities": ["pesquisa web", "extrair conteúdo", "analisar páginas"]
            },
            {
                "id": "data-analyst",
                "name": "Analista de Dados",
                "role": "database",
                "description": "Consulta e analisa dados de bancos de dados",
                "status": "offline",
                "tier": 2,
                "capabilities": ["consultas SQL", "análise de dados", "relatórios"]
            },
            {
                "id": "document-generator",
                "name": "Gerador de Documentos",
                "role": "document",
                "description": "Cria e formata documentos automaticamente",
                "status": "online",
                "tier": 2,
                "capabilities": ["criar documentos", "formatar texto", "exportar PDF"]
            },
        ]
    
    return {"experts": experts}


@router.post("/chat")
async def chat_with_expert(request: ChatRequest):
    """Send a message to a specialist and get a response."""
    registry = _get_registry()
    expert_id = request.expertId
    message = request.message
    
    # Initialize session if needed
    if expert_id not in _chat_sessions:
        _chat_sessions[expert_id] = []
    
    # Store user message
    _chat_sessions[expert_id].append({"role": "user", "content": message})
    
    # Try to get the agent
    agent = registry._agents.get(expert_id)
    
    if agent is None:
        # Fallback: if agent not found, return a mock response
        logger.warning(f"Expert {expert_id} not found in registry, using mock")
        mock_response = f"Olá! Este é o especialista {expert_id}. Sua mensagem foi recebida: '{message}'.\n\nEstou em modo de demonstração. Conecte o agente real para respostas autênticas."
        _chat_sessions[expert_id].append({"role": "assistant", "content": mock_response})
        return ChatResponse(response=mock_response)
    
    # If agent has a method to process messages, use it
    try:
        if hasattr(agent, 'process_message'):
            response = await agent.process_message(message, _chat_sessions[expert_id])
        elif hasattr(agent, 'chat'):
            response = await agent.chat(message)
        else:
            # Generic fallback: try to use the agent's run method or similar
            response = f"[Especialista {agent_id}]: Recebi sua mensagem: '{message}'. Processamento em desenvolvimento."
        
        _chat_sessions[expert_id].append({"role": "assistant", "content": response})
        return ChatResponse(response=response)
    except Exception as e:
        logger.error(f"Error processing message for expert {expert_id}: {e}")
        error_response = f"Desculpe, ocorreu um erro ao processar sua mensagem: {str(e)}"
        _chat_sessions[expert_id].append({"role": "assistant", "content": error_response})
        return ChatResponse(response=error_response)


@router.get("/sessions/{expert_id}")
async def get_session(expert_id: str):
    """Get chat history for a specific expert."""
    if expert_id not in _chat_sessions:
        return {"messages": []}
    return {"messages": _chat_sessions[expert_id]}


@router.delete("/sessions/{expert_id}")
async def clear_session(expert_id: str):
    """Clear chat history for a specific expert."""
    if expert_id in _chat_sessions:
        _chat_sessions[expert_id] = []
    return {"status": "cleared"}
