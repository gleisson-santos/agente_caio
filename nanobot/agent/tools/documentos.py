import re
from typing import Any, Dict

from nanobot.agent.tools.base import Tool
from nanobot.documentos.engine import generate_from_ai_content

class GeradorDocumentosTool(Tool):
    """
    Ferramenta para criação de documentos profissionais formatados.
    Permite que o Caio gere arquivos reais (PDF, PPTX, DOCX, XLSX).
    """

    name = "gerar_documento"
    description = (
        "Cria e salva um documento estruturado real. "
        "CRÍTICO/OBRIGATÓRIO: Sempre que o usuário solicitar um PDF, DOCX, PPTX ou XLSX, "
        "você DEVE chamar esta ferramenta. NUNCA simule ou minta no chat dizendo que "
        "salvou o arquivo sem ter chamado a ferramenta. Apenas chame a ferramenta "
        "e avise o usuário que está gerando. "
        "Retorna o nome real do arquivo gerado no sistema."
    )
    parameters = {
        "type": "object",
        "properties": {
            "doc_type": {
                "type": "string",
                "enum": ["pdf", "pptx", "docx", "xlsx"],
                "description": "O formato do arquivo a ser gerado."
            },
            "title": {
                "type": "string",
                "description": "O título principal do documento. Mantenha curto (ex: 'Relatório Q1')."
            },
            "content": {
                "type": "string",
                "description": (
                    "Conteúdo completo e estruturado em Markdown. "
                    "Use '# NOME DA SEÇÃO' para dividir capítulos ou slides. "
                    "Não economize detalhes, seja profissional."
                )
            }
        },
        "required": ["doc_type", "title", "content"]
    }

    async def execute(self, doc_type: str, title: str, content: str, **kwargs: Any) -> str:
        try:
            filename = generate_from_ai_content(content=content, doc_format=doc_type, title=title)
            return f"Sucesso! Documento {doc_type.upper()} '{title}' gerado como '{filename}'. Avise o usuário que o arquivo já está disponível para visualização e download."
        except Exception as e:
            return f"Falha ao gerar o documento {doc_type.upper()}: {str(e)}"
