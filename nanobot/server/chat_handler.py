"""
Chat handler for the Dashboard — bridges FastAPI to the AgentLoop.
"""
from typing import Optional, List, Any
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Depends
from loguru import logger

router = APIRouter(prefix="/api/chat", tags=["chat"])

# Model for incoming chat messages
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "dashboard-default"

class ChatResponse(BaseModel):
    id: str
    content: str
    role: str = "assistant"
    status: str = "completed"

# We'll use a hack to get the agent from api.py global
# In a cleaner world, we'd use dependency injection
def get_agent():
    from nanobot.server.api import _agent
    if _agent is None:
        raise HTTPException(status_code=503, detail="Agent core not initialized")
    return _agent

@router.post("", response_model=ChatResponse)
async def chat_message(req: ChatRequest, agent = Depends(get_agent)):
    """Process a chat message using the real Caio AgentLoop."""
    logger.info("Chat: '{}' | session: {}", req.message[:60], req.session_id)
    
    import uuid
    import asyncio
    
    try:
        # Inject context hint if from Documents menu
        msg_to_process = req.message
        if req.session_id and "dashboard-docs" in req.session_id:
            msg_to_process += (
                "\n\n[INSTRUÇÃO DO SISTEMA OBRIGATÓRIA: Você está atuando como 'Especialista em Documentos' no Dashboard. "
                "Para criar relatórios, PDFs, PPTX, DOCX ou XLSX oficiais, USE OBRIGATORIAMENTE a ferramenta 'gerar_documento'. "
                "Para criar scripts (Python, BAT), sites (HTML/CSS), planilhas CSV, textos (TXT) ou qualquer outro arquivo livre, "
                "USE as ferramentas padronizadas como 'write_file' ou 'exec'. "
                "NUNCA responda simulando a criação de arquivos no chat; você deve usar as ferramentas fornecidas para gerar resultados REAIS.]"
            )

        # Usar o novo método handle_message para consistência neural com timeout
        final_response = await asyncio.wait_for(
            agent.handle_message(
                message=msg_to_process,
                session_id=req.session_id,
                channel="dashboard",
            ),
            timeout=90.0  # 90s timeout — alinhado com o frontend AbortSignal
        )
        
        if not final_response or not final_response.strip():
            final_response = "Processando... Pode repetir a pergunta?"
            
        logger.info("Chat OK: '{}'", final_response[:80])
        return ChatResponse(
            id=uuid.uuid4().hex[:8],
            content=final_response,
        )
        
    except asyncio.TimeoutError:
        logger.warning("Chat: timeout após 60s para mensagem: {}", req.message[:50])
        return ChatResponse(
            id=uuid.uuid4().hex[:8],
            content="⏱️ A resposta demorou demais. O modelo de IA pode estar sobrecarregado. Tente novamente em instantes!",
            status="timeout"
        )
    except Exception as e:
        logger.exception("Chat: erro ao processar mensagem")
        error_msg = str(e)
        
        # Mensagem amigável baseada no tipo de erro
        if "rate limit" in error_msg.lower() or "429" in error_msg:
            friendly = "🔄 Limite de requisições atingido. Aguarde 30 segundos e tente novamente."
        elif "model" in error_msg.lower() or "provider" in error_msg.lower():
            friendly = "🤖 Modelo de IA temporariamente indisponível. Vou tentar outro modelo na próxima mensagem."
        elif "timeout" in error_msg.lower():
            friendly = "⏱️ Tempo de resposta esgotado. Tente uma pergunta mais curta."
        else:
            friendly = f"⚠️ Tive um problema técnico. Erro: {error_msg[:120]}"
            
        return ChatResponse(
            id=uuid.uuid4().hex[:8],
            content=friendly,
            status="error"
        )

@router.get("/history/{session_id}")
async def get_chat_history(session_id: str, agent = Depends(get_agent)):
    """Retrieve chat history for a dashboard session."""
    session_key = f"dashboard:{session_id}"
    session = agent.sessions.get_or_create(session_key)
    if not session:
        return {"messages": []}
    
    # Filter for frontend-friendly format
    history = []
    for m in session.messages:
        if m.get("role") in ("user", "assistant") and m.get("content"):
            content = m["content"]
            if m["role"] == "user" and "[INSTRUÇÃO DO SISTEMA OBRIGATÓRIA" in content:
                content = content.split("\n\n[INSTRUÇÃO DO SISTEMA OBRIGATÓRIA")[0]
                
            history.append({
                "role": m["role"],
                "content": content
            })
    return {"messages": history}
