"""A2A Protocol — Agent-to-Agent communication tool.

Enables Caio to send messages to and receive messages from
other AI agents running remotely. Compatible with the emerging
Agent-to-Agent (A2A) protocol standard.
"""

import json
from typing import Any

from caiocore.agent.tools.base import Tool


class A2ASendTool(Tool):
    """Send a message to a remote agent via HTTP."""

    def __init__(self):
        self._sent_count = 0

    @property
    def name(self) -> str:
        return "a2a_send"

    @property
    def description(self) -> str:
        return (
            "Envia uma mensagem para outro agente de IA remoto via protocolo A2A. "
            "Use para delegar tarefas a agentes externos, pedir informações de "
            "outros sistemas ou orquestrar workflows distribuídos."
        )

    @property
    def parameters(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "agent_url": {
                    "type": "string",
                    "description": "URL do agente remoto (ex: https://agent.example.com/api/a2a/receive)",
                },
                "message": {
                    "type": "string",
                    "description": "Mensagem a enviar para o agente remoto",
                },
                "sender_id": {
                    "type": "string",
                    "description": "Identificador do remetente (padrão: 'caio-core')",
                },
                "metadata": {
                    "type": "object",
                    "description": "Metadados adicionais (ex: prioridade, contexto)",
                },
            },
            "required": ["agent_url", "message"],
        }

    async def execute(
        self,
        agent_url: str,
        message: str,
        sender_id: str = "caio-core",
        metadata: dict | None = None,
        **kwargs: Any,
    ) -> str:
        try:
            import httpx
            import uuid

            payload = {
                "protocol": "a2a/v1",
                "message_id": uuid.uuid4().hex,
                "sender": sender_id,
                "content": message,
                "metadata": metadata or {},
            }

            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    agent_url,
                    json=payload,
                    headers={
                        "Content-Type": "application/json",
                        "X-A2A-Protocol": "v1",
                        "X-A2A-Sender": sender_id,
                    },
                )

                self._sent_count += 1

                if response.status_code == 200:
                    try:
                        data = response.json()
                        reply = data.get("content", data.get("response", str(data)))
                        return f"📡 Resposta do agente remoto:\n\n{reply}"
                    except Exception:
                        return f"📡 Resposta recebida (HTTP 200):\n{response.text[:2000]}"
                else:
                    return f"⚠️ Agente remoto respondeu com HTTP {response.status_code}: {response.text[:500]}"

        except ImportError:
            return "Erro: httpx não está instalado."
        except Exception as e:
            return f"Erro na comunicação A2A: {str(e)}"

    def get_stats(self) -> dict:
        return {"messages_sent": self._sent_count}
