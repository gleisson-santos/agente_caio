"""Tests for shell execution tool."""

import asyncio
import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from caiocore.agent.tools.shell import ExecTool


@pytest.mark.asyncio
async def test_exec_tool_success():
    """Test successful command execution."""
    tool = ExecTool(timeout=5)

    if sys.platform == "win32":
        cmd = "echo Hello"
        expected_output = "Hello"
    else:
        cmd = "echo Hello"
        expected_output = "Hello"

    result = await tool.execute(command=cmd)
    assert expected_output in result


@pytest.mark.asyncio
async def test_exec_tool_timeout():
    """Test command timeout."""
    tool = ExecTool(timeout=1)
    # Command that sleeps longer than timeout
    if sys.platform == "win32":
        cmd = "ping -n 3 127.0.0.1"
    else:
        cmd = "sleep 2"

    result = await tool.execute(command=cmd)
    assert "timed out" in result


@pytest.mark.asyncio
async def test_exec_tool_denied_patterns():
    """Test blocked dangerous commands."""
    tool = ExecTool(deny_patterns=[r"\brm\s+-rf\b"])

    result = await tool.execute(command="rm -rf /tmp/test")
    assert "denied" in result or "blocked" in result


@pytest.mark.asyncio
async def test_exec_tool_allow_patterns():
    """Test allowed patterns override deny."""
    # Allow pattern for ls, deny for rm
    tool = ExecTool(
        deny_patterns=[r"\brm\s+-rf\b"],
        allow_patterns=[r"\brm\s+-rf\s+/tmp/safe\b"]
    )

    if sys.platform != "win32":
        # Should not block because it matches allow_pattern
        result = await tool.execute(command="rm -rf /tmp/safe")
        # It will actually try to run but likely fail due to permissions
        # We just check that it didn't get blocked before execution
        assert "denied" not in result
    else:
        # Skip on Windows
        pass
