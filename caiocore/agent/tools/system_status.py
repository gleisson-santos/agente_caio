from typing import Any
from caiocore.agent.tools.base import Tool
from caiocore.agents.registry import agent_registry

class SystemStatusTool(Tool):
    """Tool to check the real-time health and metrics of CaioCore infrastructure agents."""
    
    name = "get_system_status"
    description = (
        "Retorna o status de saúde e métricas de todos os agentes de infraestrutura (Tier 1). "
        "Use esta ferramenta para diagnosticar erros no Agente BD, Agente Token, Agente Life ou Agente SSO."
    )
    parameters = {
        "type": "object",
        "properties": {
            "agent_id": {
                "type": "string",
                "description": "Opcional: ID específico do agente (agent-bd, agent-token, agent-life, agent-sso). Se omitido, retorna resumo de todos.",
                "enum": ["agent-bd", "agent-token", "agent-life", "agent-sso"]
            }
        }
    }

    async def execute(self, agent_id: str | None = None) -> str:
        if agent_id:
            agent = agent_registry.get(agent_id)
            if not agent:
                return f"Agente '{agent_id}' não está carregado ou registrado no momento."
            
            status_data = {}
            if hasattr(agent, "get_metrics"):
                status_data["metrics"] = agent.get_metrics()
            if hasattr(agent, "get_status"):
                status_data["status"] = agent.get_status()
            if agent_id == "agent-bd" and hasattr(agent, "get_connection_status"):
                status_data["connections"] = agent.get_connection_status()
            if agent_id == "agent-life":
                if hasattr(agent, "get_health_matrix"):
                    status_data["health_matrix"] = agent.get_health_matrix()
                if hasattr(agent, "get_alerts"):
                    status_data["alerts"] = agent.get_alerts()
            if agent_id == "agent-sso" and hasattr(agent, "get_detailed_metrics"):
                status_data["vps_metrics"] = agent.get_detailed_metrics()

            return f"Status Detalhado de {agent_id}:\n{status_data}"

        # Resumo Geral
        summary = []
        for aid in ["agent-token", "agent-bd", "agent-life", "agent-sso"]:
            agent = agent_registry.get(aid)
            if agent:
                health = getattr(agent, "status", "unknown")
                summary.append(f"- {agent.name} ({aid}): {health}")
                if hasattr(agent, "get_metrics"):
                    summary.append(f"  Métricas: {agent.get_metrics()}")
            else:
                summary.append(f"- {aid}: NÃO CARREGADO")
        
        return "Resumo de Saúde do Sistema:\n" + "\n".join(summary)
