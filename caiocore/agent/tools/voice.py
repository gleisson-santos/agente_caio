"""Voice/TTS Tool — text-to-speech using OpenAI TTS API."""

from pathlib import Path
from typing import Any

from caiocore.agent.tools.base import Tool


class VoiceTTSTool(Tool):
    """Convert text to speech using OpenAI's TTS API."""

    VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]

    def __init__(self, workspace: Path | None = None):
        self._workspace = workspace

    @property
    def name(self) -> str:
        return "text_to_speech"

    @property
    def description(self) -> str:
        return (
            "Converte texto em áudio (voz). Gera um arquivo MP3 que pode ser enviado como mensagem de voz. "
            "Vozes disponíveis: alloy, echo, fable, onyx, nova, shimmer. "
            "Use para ler textos em voz alta, gerar podcasts ou resumos em áudio."
        )

    @property
    def parameters(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "text": {
                    "type": "string",
                    "description": "Texto para converter em fala",
                },
                "voice": {
                    "type": "string",
                    "description": "Voz a usar: alloy, echo, fable, onyx, nova, shimmer (padrão: nova)",
                    "enum": self.VOICES,
                },
                "filename": {
                    "type": "string",
                    "description": "Nome do arquivo de saída (sem extensão). Padrão: 'voice_output'",
                },
            },
            "required": ["text"],
        }

    async def execute(
        self,
        text: str,
        voice: str = "nova",
        filename: str = "voice_output",
        **kwargs: Any,
    ) -> str:
        try:
            import httpx
            import json
            import os

            # Get API key from environment or config
            api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("OPENROUTER_API_KEY", "")
            if not api_key:
                # Try loading from config.json
                config_path = self._workspace / "config.json" if self._workspace else Path("config.json")
                if config_path.exists():
                    cfg = json.loads(config_path.read_text())
                    providers = cfg.get("providers", {})
                    # Look for OpenAI key first, then OpenRouter
                    openai_cfg = providers.get("openai", {})
                    api_key = openai_cfg.get("api_key", "")
                    if not api_key:
                        openrouter_cfg = providers.get("openrouter", {})
                        api_key = openrouter_cfg.get("api_key", "")

            if not api_key:
                return "Erro: Nenhuma API key encontrada para TTS. Configure OPENAI_API_KEY ou adicione em config.json."

            # Determine API endpoint
            base_url = "https://api.openai.com/v1"
            if "sk-or-" in api_key:
                base_url = "https://openrouter.ai/api/v1"

            # Validate voice
            if voice not in self.VOICES:
                voice = "nova"

            # Truncate text if too long (TTS has limits)
            if len(text) > 4096:
                text = text[:4096]

            # Make request
            async with httpx.AsyncClient(timeout=60) as client:
                response = await client.post(
                    f"{base_url}/audio/speech",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "tts-1",
                        "input": text,
                        "voice": voice,
                        "response_format": "mp3",
                    },
                )

                if response.status_code != 200:
                    return f"Erro TTS ({response.status_code}): {response.text[:200]}"

                # Save the audio file
                out_dir = self._workspace / "out" if self._workspace else Path(".")
                out_dir.mkdir(parents=True, exist_ok=True)

                filepath = out_dir / f"{filename}.mp3"
                filepath.write_bytes(response.content)

                size_kb = len(response.content) / 1024
                return (
                    f"🔊 Áudio gerado com sucesso!\n"
                    f"• **Arquivo:** {filepath}\n"
                    f"• **Voz:** {voice}\n"
                    f"• **Tamanho:** {size_kb:.1f} KB\n"
                    f"• **Texto:** {len(text)} caracteres"
                )

        except ImportError:
            return "Erro: httpx não está instalado."
        except Exception as e:
            return f"Erro ao gerar áudio: {str(e)}"
