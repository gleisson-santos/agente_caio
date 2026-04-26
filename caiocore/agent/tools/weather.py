import aiohttp
from typing import Any
from caiocore.agent.tools.base import Tool

class WeatherTool(Tool):
    """Tool to get real-time weather information using wttr.in."""
    
    name = "get_weather"
    description = (
        "Obtém a temperatura e condições climáticas atuais para uma localização específica (cidade, estado). "
        "Não requer chave de API. Útil para responder perguntas sobre o clima e temperatura."
    )
    parameters = {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "Cidade e/ou estado para consulta (ex: 'Salvador, BA', 'São Paulo', 'London')."
            },
            "format": {
                "type": "string",
                "description": "Formato do retorno. 'compact' (uma linha) ou 'detailed' (com previsão).",
                "enum": ["compact", "detailed"],
                "default": "compact"
            }
        },
        "required": ["location"]
    }

    async def execute(self, location: str, format: str = "compact") -> str:
        # URL encode location spaces
        query_loc = location.replace(" ", "+")
        # format=3 is compact one-liner (City: Condition Temp)
        # format=4 is very compact (Condition Temp)
        fmt_code = "3" if format == "compact" else ""
        
        url = f"https://wttr.in/{query_loc}?format={fmt_code}"
        if format == "detailed":
            url = f"https://wttr.in/{query_loc}?T0" # Current only but detailed

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=10) as response:
                    if response.status == 200:
                        text = await response.text()
                        if "Unknown location" in text or "NOT FOUND" in text:
                            return f"Erro: Localização '{location}' não encontrada em wttr.in."
                        return f"Condições climáticas para {location}:\n{text.strip()}"
                    else:
                        return f"Erro ao consultar clima: O serviço wttr.in retornou status {response.status}."
        except Exception as e:
            return f"Erro de conexão ao consultar clima: {str(e)}"
