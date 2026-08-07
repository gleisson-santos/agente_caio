"""Tests for email read tool."""

import asyncio
import email
import email.message
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from caiocore.agent.tools.email_read import EmailReadTool, _decode_header, _extract_body


def test_decode_header_plain():
    assert _decode_header("Hello") == "Hello"
    assert _decode_header(None) == ""
    # Encoded header: =?UTF-8?B?SGVsbG8=?=
    encoded = "=?UTF-8?B?SGVsbG8=?="
    assert _decode_header(encoded) == "Hello"


def test_decode_header_multipart():
    # Multiple encoded parts
    encoded = "=?UTF-8?Q?R=C3=A9sum=C3=A9?= =?UTF-8?Q?=20file?="
    assert _decode_header(encoded) == "Résumé file"


def test_extract_body_plain():
    msg = email.message.EmailMessage()
    msg.set_content("Hello world")
    body = _extract_body(msg)
    assert "Hello world" in body


def test_extract_body_multipart():
    msg = email.message.EmailMessage()
    msg["Content-Type"] = "multipart/mixed"
    part = email.message.EmailMessage()
    part.set_content("Hello from plain text")
    msg.attach(part)
    body = _extract_body(msg)
    assert "Hello from plain text" in body


def test_extract_body_truncates_long():
    msg = email.message.EmailMessage()
    long_text = "a" * 5000
    msg.set_content(long_text)
    body = _extract_body(msg, max_chars=100)
    assert len(body) <= 100 + 50  # includes truncation message


@pytest.mark.asyncio
async def test_email_read_tool_search():
    """Test EmailReadTool.search with mocked IMAP."""
    tool = EmailReadTool(
        imap_host="imap.gmail.com",
        imap_user="test@example.com",
        imap_pass="pass",
    )

    with patch("imaplib.IMAP4_SSL") as mock_imap:
        # Mock connection
        mock_instance = MagicMock()
        mock_imap.return_value.__enter__.return_value = mock_instance

        # Mock login
        mock_instance.login.return_value = ("OK", [])
        mock_instance.select.return_value = ("OK", [])

        # Mock search
        mock_instance.search.return_value = ("OK", [b"1 2 3"])

        # Mock fetch
        def fetch_side_effect(num, part):
            msg = email.message.EmailMessage()
            msg.set_content("Test email body")
            msg["Subject"] = "Test Subject"
            msg["From"] = "sender@example.com"
            msg["Date"] = "Fri, 1 Jan 2026 12:00:00 +0000"
            return ("OK", [(b"1", msg.as_bytes())])

        mock_instance.fetch.side_effect = fetch_side_effect

        result = await tool.search(query="test", max_results=2)

        assert "emails" in result
        assert len(result["emails"]) > 0
        assert result["emails"][0]["subject"] == "Test Subject"
        assert "body" in result["emails"][0]


@pytest.mark.asyncio
async def test_email_read_tool_list():
    """Test EmailReadTool.list_unread with mocked IMAP."""
    tool = EmailReadTool(
        imap_host="imap.gmail.com",
        imap_user="test@example.com",
        imap_pass="pass",
    )

    with patch("imaplib.IMAP4_SSL") as mock_imap:
        mock_instance = MagicMock()
        mock_imap.return_value.__enter__.return_value = mock_instance
        mock_instance.login.return_value = ("OK", [])
        mock_instance.select.return_value = ("OK", [])
        mock_instance.search.return_value = ("OK", [b"1 2 3"])

        def fetch_side_effect(num, part):
            msg = email.message.EmailMessage()
            msg.set_content("Unread email")
            msg["Subject"] = "Important"
            msg["From"] = "boss@example.com"
            msg["Date"] = "Fri, 1 Jan 2026 12:00:00 +0000"
            return ("OK", [(b"1", msg.as_bytes())])

        mock_instance.fetch.side_effect = fetch_side_effect

        result = await tool.list_unread(limit=2)
        assert "emails" in result
        assert len(result["emails"]) > 0
