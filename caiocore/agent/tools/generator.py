import os
import json
import httpx
from typing import Dict, Any, Optional
from caiocore.agent.tools.base import Tool
from loguru import logger

class GeneratorTool(Tool):
    """
    Ferramenta para geração de mídia e assets (Imagens, Prompts, etc).
    Integrada com OpenRouter para acesso a modelos de imagem (DALL-E 3, Imagen 3, etc).
    """

    @property
    def name(self) -> str:
        return "generate_media"

    @property
    def description(self) -> str:
        return (
            "Gera mídias visuais (imagens, artes, carrosséis) com base em um prompt descritivo. "
            "Exemplo: generate_media(prompt='Uma arte minimalista de um gato na lua', model='openai/dall-e-3')"
        )

    @property
    def parameters(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "prompt": {
                    "type": "string",
                    "description": "Descrição detalhada da imagem a ser gerada."
                },
                "model": {
                    "type": "string",
                    "description": "O modelo de imagem a usar (ex: openai/dall-e-3, google/imagen-3).",
                    "default": "openai/dall-e-3"
                }
            },
            "required": ["prompt"]
        }

    def _get_api_key(self) -> Optional[str]:
        # Busca a chave do OpenRouter no config.json relativo à execução
        config_path = os.path.join(os.getcwd(), "config.json")
        if os.path.exists(config_path):
            try:
                with open(config_path, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                    return config.get("providers", {}).get("openrouter", {}).get("apiKey")
            except Exception as e:
                logger.error(f"Error reading config for image generation: {e}")
        return None

    async def execute(self, prompt: str, model: str = "openai/dall-e-3", **kwargs) -> Dict[str, Any]:
        """
        Executa a geração de mídia via OpenRouter.
        """
        api_key = self._get_api_key()
        if not api_key:
            return {
                "status": "error",
                "message": "API Key do OpenRouter não encontrada no config.json. Por favor, adicione sua chave para gerar imagens."
            }

        logger.info(f"Generating media with prompt: {prompt[:50]}...")

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                        "X-Title": "Caio Core Dashboard"
                    },
                    json={
                        "model": model,
                        "messages": [
                            {"role": "user", "content": prompt}
                        ],
                        # Para modelos de imagem nativos no OpenRouter, o response_format pode variar
                        # Mas a maioria suporta o retorno via b64 ou URL no content/tool_calls
                    }
                )

                if response.status_code != 200:
                    return {
                        "status": "error",
                        "message": f"Erro na API do OpenRouter: {response.status_code} - {response.text}"
                    }

                data = response.json()
                
                # Para modelos de imagem que retornam URL ou texto descritivo
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                
                return {
                    "status": "success",
                    "prompt": prompt,
                    "model": model,
                    "result": content,
                    "message": "Mídia gerada com sucesso! O Especialista irá processar o link/descrição."
                }

        except Exception as e:
            logger.error(f"Media generation failed: {e}")
            return {
                "status": "error",
                "message": f"Erro interno na geração de mídia: {str(e)}"
            }
