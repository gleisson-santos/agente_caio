"""PDF Reader Tool — extracts text from PDF files using PyMuPDF."""

from pathlib import Path
from typing import Any

from caiocore.agent.tools.base import Tool


class ReadPDFTool(Tool):
    """Tool to extract text content from PDF files."""

    def __init__(self, workspace: Path | None = None, allowed_dir: Path | None = None):
        self._workspace = workspace
        self._allowed_dir = allowed_dir

    @property
    def name(self) -> str:
        return "read_pdf"

    @property
    def description(self) -> str:
        return (
            "Lê e extrai o texto de um arquivo PDF. "
            "Use para analisar currículos, contratos, relatórios ou qualquer documento PDF. "
            "Retorna o conteúdo textual de todas as páginas."
        )

    @property
    def parameters(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "Caminho do arquivo PDF a ser lido",
                },
                "pages": {
                    "type": "string",
                    "description": "Páginas específicas para ler (ex: '1-3', '1,3,5'). Se omitido, lê todas.",
                },
            },
            "required": ["path"],
        }

    async def execute(self, path: str, pages: str | None = None, **kwargs: Any) -> str:
        try:
            import pymupdf  # noqa: F811
        except ImportError:
            return (
                "Erro: A biblioteca 'pymupdf' não está instalada. "
                "Execute: pip install pymupdf"
            )

        try:
            # Resolve path
            file_path = Path(path).expanduser()
            if not file_path.is_absolute() and self._workspace:
                file_path = self._workspace / file_path
            file_path = file_path.resolve()

            # Security check
            if self._allowed_dir and not str(file_path).startswith(str(self._allowed_dir.resolve())):
                return f"Erro: O caminho {path} está fora do diretório permitido."

            if not file_path.exists():
                return f"Erro: Arquivo não encontrado: {path}"
            if not file_path.suffix.lower() == ".pdf":
                return f"Erro: O arquivo não é um PDF: {file_path.name}"

            doc = pymupdf.open(str(file_path))
            total_pages = len(doc)

            # Parse page selection
            selected_pages = self._parse_pages(pages, total_pages) if pages else range(total_pages)

            text_parts = []
            text_parts.append(f"📄 **{file_path.name}** — {total_pages} página(s)\n")

            for page_num in selected_pages:
                if 0 <= page_num < total_pages:
                    page = doc[page_num]
                    text = page.get_text("text").strip()
                    if text:
                        text_parts.append(f"--- Página {page_num + 1} ---\n{text}")
                    else:
                        text_parts.append(f"--- Página {page_num + 1} ---\n(Sem texto extraível — possível imagem/scan)")

            doc.close()

            result = "\n\n".join(text_parts)

            # Truncate if extremely long
            if len(result) > 15000:
                result = result[:15000] + "\n\n⚠️ (Texto truncado — PDF muito longo. Use o parâmetro 'pages' para ler páginas específicas.)"

            return result

        except Exception as e:
            return f"Erro ao ler PDF: {str(e)}"

    @staticmethod
    def _parse_pages(pages_str: str, total: int) -> list[int]:
        """Parse page selection like '1-3', '1,3,5', '2-5,8'."""
        result = []
        for part in pages_str.split(","):
            part = part.strip()
            if "-" in part:
                start, end = part.split("-", 1)
                start = max(1, int(start.strip()))
                end = min(total, int(end.strip()))
                result.extend(range(start - 1, end))
            else:
                page = int(part.strip())
                if 1 <= page <= total:
                    result.append(page - 1)
        return sorted(set(result))
