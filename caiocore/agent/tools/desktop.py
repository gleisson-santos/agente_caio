"""Desktop control tool for screenshots, mouse, and keyboard automation."""

import os
from datetime import datetime
from pathlib import Path
from typing import Any

from caiocore.agent.tools.base import Tool

try:
    import pyautogui
except ImportError:
    pyautogui = None


class DesktopControlTool(Tool):
    """Tool for capturing screenshots and controlling the OS Desktop (mouse and keyboard)."""

    def __init__(self, workspace: Path | str | None = None):
        if workspace:
            self.workspace = Path(workspace)
        else:
            self.workspace = Path.home() / ".caiocore" / "media"
        self.workspace.mkdir(parents=True, exist_ok=True)
        # Disable pyautogui failsafe so the mouse can reach the edges without aborting.
        if pyautogui is not None:
            pyautogui.FAILSAFE = False

    @property
    def name(self) -> str:
        return "desktop_control"

    @property
    def requires_approval(self) -> bool:
        return False  # To allow the agent to actually navigate efficiently, let's keep approval False or rely on user's Telegram implicit authorization.

    @property
    def description(self) -> str:
        return "Controla a área de trabalho do computador. Tira screenshots, move e clica com o mouse, e digita atalhos de teclado. Útil para verificar status visual ou controlar a interface do Windows/Mac."

    @property
    def parameters(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "enum": ["screenshot", "mouse_move", "mouse_click", "keyboard_type", "keyboard_press"],
                    "description": "A ação a ser executada na área de trabalho.",
                },
                "x": {
                    "type": "integer",
                    "description": "Coordenada X para mover o mouse (opcional, apenas para mouse_move e mouse_click)."
                },
                "y": {
                    "type": "integer",
                    "description": "Coordenada Y para mover o mouse (opcional, apenas para mouse_move e mouse_click)."
                },
                "button": {
                    "type": "string",
                    "enum": ["left", "right", "middle"],
                    "description": "Botão do mouse a ser clicado (opcional, padrão 'left')."
                },
                "text": {
                    "type": "string",
                    "description": "Texto para digitar (apenas para keyboard_type)."
                },
                "keys": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Lista de teclas para pressionar simultaneamente, ex: ['win', 'r'] ou ['enter'] (apenas para keyboard_press)."
                }
            },
            "required": ["action"]
        }

    async def execute(self, action: str, **kwargs: Any) -> str:
        if pyautogui is None:
            return "Erro: A biblioteca 'pyautogui' não está instalada no sistema anfitrião."

        try:
            if action == "screenshot":
                from PIL import ImageGrab
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"screenshot_{timestamp}.png"
                filepath = self.workspace / filename
                
                # Take screenshot using Pillow
                screenshot = ImageGrab.grab()
                screenshot.save(filepath)
                
                return f"Sucesso: Captura de tela salva em {filepath.absolute()}"

            elif action == "mouse_move":
                x = kwargs.get("x")
                y = kwargs.get("y")
                if x is None or y is None:
                    return "Erro: Coordenadas 'x' e 'y' são obrigatórias para 'mouse_move'."
                pyautogui.moveTo(x, y, duration=0.5)
                return f"Sucesso: Mouse movido para ({x}, {y})."

            elif action == "mouse_click":
                x = kwargs.get("x")
                y = kwargs.get("y")
                button = kwargs.get("button", "left")
                if x is not None and y is not None:
                    pyautogui.click(x=x, y=y, button=button)
                    return f"Sucesso: Mouse clicou ({button}) em ({x}, {y})."
                else:
                    pyautogui.click(button=button)
                    return f"Sucesso: Mouse clicou ({button}) na posição atual."

            elif action == "keyboard_type":
                text = kwargs.get("text")
                if not text:
                    return "Erro: 'text' é obrigatório para 'keyboard_type'."
                pyautogui.write(text, interval=0.01)
                return f"Sucesso: Texto digitado."

            elif action == "keyboard_press":
                keys = kwargs.get("keys")
                if not keys or not isinstance(keys, list):
                    return "Erro: 'keys' é obrigatório e deve ser uma lista de strings para 'keyboard_press'."
                pyautogui.hotkey(*keys)
                return f"Sucesso: Teclas pressionadas: {keys}."

            else:
                return f"Erro: Ação desconhecida '{action}'."
                
        except Exception as e:
            return f"Erro ao executar ação na área de trabalho: {str(e)}"
