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
            api_key = os.environ.get("OPENAI_API_KEY", "")
            if not api_key:
                api_key = os.environ.get("OPENROUTER_API_KEY", "")
            if not api_key:
                # Use the project's config loader
                try:
                    from caiocore.config.loader import load_config
                    cfg = load_config()
                    # Try OpenAI first (native TTS), then OpenRouter as gateway
                    openai_provider = cfg.providers.openai
                    if openai_provider and openai_provider.api_key:
                        api_key = openai_provider.api_key
                    else:
                        # Fall back to any available provider key
                        api_key = cfg.get_api_key() or ""
                except Exception:
                    pass

            if not api_key:
                return "Erro: Nenhuma API key encontrada para TTS. Configure OPENAI_API_KEY ou adicione provider OpenAI em config.json."

            # Determine API endpoint — TTS only works with OpenAI directly
            base_url = "https://api.openai.com/v1"
            if "sk-or-" in api_key:
                # OpenRouter doesn't support TTS natively, try via OpenAI-compatible endpoint
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
