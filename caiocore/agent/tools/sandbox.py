"""Docker Sandbox tool for secure code execution."""

import asyncio
import os
import uuid
from pathlib import Path
from typing import Any

from caiocore.agent.tools.base import Tool


class SandboxExecTool(Tool):
    """Executes shell commands inside a secure, ephemeral Docker container."""

    def __init__(self, workspace: Path, image: str = "python:3.11-slim"):
        self.workspace = workspace
        self.image = image

    @property
    def name(self) -> str:
        return "sandbox_exec"

    @property
    def description(self) -> str:
        return "Execute a shell command inside an isolated Docker container for safety."

    @property
    def parameters(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "command": { "type": "string" },
                "timeout": { "type": "integer", "default": 60 }
            },
            "required": ["command"]
        }

    async def execute(self, command: str, timeout: int = 60, **kwargs: Any) -> str:
        container_name = f"caio-sandbox-{uuid.uuid4().hex[:8]}"
        
        # Build Docker command
        # Mapping host workspace to /workspace in container
        docker_cmd = [
            "docker", "run", "--rm",
            "--name", container_name,
            "-v", f"{self.workspace.absolute()}:/workspace",
            "-w", "/workspace",
            self.image,
            "sh", "-c", command
        ]

        try:
            process = await asyncio.create_subprocess_exec(
                *docker_cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            try:
                stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=timeout)
                output = stdout.decode("utf-8", errors="replace")
                err_out = stderr.decode("utf-8", errors="replace")
                
                result = []
                if output: result.append(output)
                if err_out: result.append(f"STDERR:\n{err_out}")
                
                return "\n".join(result) if result else "(no output)"
                
            except asyncio.TimeoutError:
                # Force kill container on timeout
                os.system(f"docker kill {container_name}")
                return f"Error: Sandbox execution timed out after {timeout}s"
                
        except Exception as e:
            return f"Error initializing Sandbox: {str(e)}"
