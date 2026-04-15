"""Browser Control Tool — web automation using Selenium."""

from pathlib import Path
from typing import Any

from caiocore.agent.tools.base import Tool


class BrowserTool(Tool):
    """Browse URLs, take screenshots, extract text, and interact with web pages."""

    def __init__(self, workspace: Path | None = None):
        self._workspace = workspace
        self._driver = None

    @property
    def name(self) -> str:
        return "browse_url"

    @property
    def description(self) -> str:
        return (
            "Navega para uma URL e retorna o conteúdo da página. "
            "Pode extrair texto visível, tirar screenshots ou executar JavaScript. "
            "Ações: 'text' (extrair texto), 'screenshot' (captura de tela), 'js' (executar JS)."
        )

    @property
    def parameters(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "URL para navegar (ex: https://example.com)",
                },
                "action": {
                    "type": "string",
                    "description": "Ação: 'text' (extrair texto), 'screenshot' (captura), 'js' (executar JavaScript)",
                    "enum": ["text", "screenshot", "js"],
                },
                "js_code": {
                    "type": "string",
                    "description": "Código JavaScript a executar (apenas quando action='js')",
                },
                "wait_seconds": {
                    "type": "number",
                    "description": "Segundos para aguardar carregamento (padrão: 3)",
                },
            },
            "required": ["url"],
        }

    def _get_driver(self):
        """Lazy-initialize the Selenium WebDriver."""
        if self._driver is None:
            try:
                import os
                from selenium import webdriver
                from selenium.webdriver.chrome.options import Options
                from selenium.webdriver.chrome.service import Service

                options = Options()
                options.add_argument("--headless=new")
                options.add_argument("--no-sandbox")
                options.add_argument("--disable-dev-shm-usage")
                options.add_argument("--disable-gpu")
                options.add_argument("--window-size=1920,1080")
                options.add_argument("--disable-extensions")
                options.add_argument("--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36")

                # Check for system chromium (Docker)
                chrome_bin = os.environ.get("CHROME_BIN")
                if chrome_bin:
                    options.binary_location = chrome_bin

                chromedriver_path = os.environ.get("CHROMEDRIVER_PATH")
                if chromedriver_path:
                    service = Service(executable_path=chromedriver_path)
                    self._driver = webdriver.Chrome(service=service, options=options)
                else:
                    try:
                        from webdriver_manager.chrome import ChromeDriverManager
                        service = Service(ChromeDriverManager().install())
                        self._driver = webdriver.Chrome(service=service, options=options)
                    except Exception:
                        self._driver = webdriver.Chrome(options=options)

                self._driver.set_page_load_timeout(30)
            except ImportError:
                raise RuntimeError(
                    "Selenium não está instalado. Execute: pip install selenium webdriver-manager"
                )
        return self._driver

    async def execute(
        self,
        url: str,
        action: str = "text",
        js_code: str | None = None,
        wait_seconds: float = 3,
        **kwargs: Any,
    ) -> str:
        import asyncio

        try:
            driver = self._get_driver()

            # Navigate
            await asyncio.to_thread(driver.get, url)
            await asyncio.sleep(wait_seconds)

            if action == "screenshot":
                out_dir = self._workspace / "out" if self._workspace else Path(".")
                out_dir.mkdir(parents=True, exist_ok=True)

                from datetime import datetime
                ts = datetime.now().strftime("%Y%m%d_%H%M%S")
                filepath = out_dir / f"screenshot_{ts}.png"
                await asyncio.to_thread(driver.save_screenshot, str(filepath))
                return f"📸 Screenshot salvo em: {filepath}\nTítulo: {driver.title}\nURL: {driver.current_url}"

            elif action == "js":
                if not js_code:
                    return "Erro: 'js_code' é obrigatório quando action='js'"
                result = await asyncio.to_thread(driver.execute_script, js_code)
                return f"JS Result: {result}"

            else:  # action == "text"
                title = driver.title
                body_text = await asyncio.to_thread(
                    driver.execute_script,
                    "return document.body.innerText;"
                )
                # Truncate very long pages
                if len(body_text) > 10000:
                    body_text = body_text[:10000] + "\n\n⚠️ (Texto truncado — página muito longa)"
                return f"🌐 **{title}**\nURL: {driver.current_url}\n\n{body_text}"

        except RuntimeError as e:
            return f"Erro: {e}"
        except Exception as e:
            return f"Erro ao navegar: {str(e)}"

    def __del__(self):
        """Clean up the driver on garbage collection."""
        if self._driver:
            try:
                self._driver.quit()
            except Exception:
                pass
