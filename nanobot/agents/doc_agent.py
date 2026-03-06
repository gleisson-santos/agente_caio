"""
DocAgent — Specialist agent for professional document generation.

Handles DOCX, PDF, PPTX, and XLSX generation using the underlying engine.
Monitors the 'out/' directory for metrics and provides a status for the registry.
"""

import os
import time
import asyncio
from typing import Any, Dict, List
from pathlib import Path
from loguru import logger

from nanobot.agents.sdk import BaseAgent
from nanobot.documentos.engine import (
    quick_generate,
    generate_from_ai_content,
    get_templates,
    get_template_content,
    list_generated_documents
)

class DocAgent(BaseAgent):
    """
    Agent responsible for all document-related tasks.
    
    Can be delegated tasks to create reports, contracts, and presentations.
    """

    def __init__(self, out_dir: str = "out"):
        super().__init__(
            agent_id="spec-docs",
            name="Especialista em Documentos",
            role="Document Creator",
            tier=2,
        )
        self.out_dir = Path(out_dir)
        self.out_dir.mkdir(exist_ok=True)
        
        # Initial metrics
        self._metrics = {
            "docsGenerated": 0,
            "lastGeneration": None,
            "successRate": 100,
            "byType": {"pdf": 0, "docx": 0, "pptx": 0, "xlsx": 0}
        }
        self._update_metrics()

    def _update_metrics(self):
        """Update metrics based on files in the output directory."""
        try:
            docs = list_generated_documents(str(self.out_dir))
            self._metrics["docsGenerated"] = len(docs)
            
            # Reset types
            types = {"pdf": 0, "docx": 0, "pptx": 0, "xlsx": 0}
            last_ts = 0
            
            for doc in docs:
                t = doc.get("type")
                if t in types:
                    types[t] += 1
                
                # Track last generation
                try:
                    ts = doc.get("createdAt", 0)
                    if ts > last_ts:
                        last_ts = ts
                except (ValueError, TypeError):
                    pass
            
            self._metrics["byType"] = types
            if last_ts > 0:
                self._metrics["lastGeneration"] = last_ts
                
        except Exception as e:
            logger.error(f"DocAgent: failed to update metrics: {e}")

    def get_metrics(self) -> Dict[str, Any]:
        self._update_metrics()
        return self._metrics

    def heartbeat(self) -> Dict[str, Any]:
        """Custom heartbeat that includes fresh metrics."""
        self._update_metrics()
        res = super().heartbeat()
        res.update({
            "docs_count": self._metrics["docsGenerated"],
            "last_generation": self._metrics["lastGeneration"]
        })
        return res

    def generate_quick(self, doc_type: str) -> Dict[str, Any]:
        """Wrapper for quick generation flow."""
        try:
            self.status = "generating"
            result = quick_generate(doc_type)
            self._update_metrics()
            self.status = "online"
            return result
        except Exception as e:
            self.status = "error"
            logger.error(f"DocAgent: quick generate failed: {e}")
            raise

    def generate_ai(self, prompt: str, format: str = "docx") -> Dict[str, Any]:
        """
        AI-driven generation. 
        Note: The actual LLM call is usually handled by the Caio agent or API,
        but this agent should coordinate the engine part.
        """
        # This implementation expects the 'engine' to handle the mapping.
        # In a more advanced version, this agent would call another agent for content.
        pass

    def list_docs(self) -> List[Dict[str, Any]]:
        return list_generated_documents(str(self.out_dir))

    def get_templates(self) -> List[Dict[str, Any]]:
        return get_templates()

    def get_template_detail(self, template_id: str) -> Dict[str, Any]:
        return get_template_content(template_id)

    async def _run_loop(self) -> None:
        """Background loop — periodically refresh metrics."""
        while True:
            try:
                self._update_metrics()
                # Optional: emit a heartbeat event every 5 minutes
                # self.emit_event_upsert("metrics_updated", f"Docs total: {self._metrics['docsGenerated']}")
            except Exception as e:
                logger.error(f"DocAgent loop error: {e}")
            
            await asyncio.sleep(60) # refresh every minute
