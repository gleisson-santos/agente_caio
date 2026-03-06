---
name: extraction
description: Core skill for extracting data from SCI Web system (Embasa). Handles both MS and Pendencias projects.
---

# Extraction Skill

This skill allows agents to execute python-based automation for the SCI Web system.

## Available Projects

### 1. MS Extraction (`extracao_ms`)
Used for weekly reports from Sunday to Saturday.

**Commands:**
```bash
# Full execution
python main.py

# Custom dates
python main.py --inicio DD/MM/YYYY --fim DD/MM/YYYY
```

### 2. Pendencias Extraction (`extracao_pendencias`)
Used for real-time monitoring.

**Commands:**
```bash
# Automated scheduler (recommended)
python agendador.py --headless --intervalo 5

# Single execution
python agendador.py --headless --uma-vez
```

## Guidelines for Execution

1.  **Environment**: Ensure the virtual environment is active or dependencies are installed.
2.  **Display**: Always use `--headless` when running on a server/VPS to avoid display errors.
3.  **Working Directory**: Always `cd` into the project directory before running commands.
4.  **Logging**: Monitor stdout for progress steps like `[ETAPA]`.
5.  **Reporting**: Notify the user or the CEO (Caio) about the completion and the number of files extracted for immediate Telegram notification.
6.  **Telegram Alert**: Ensure Caio formats a summary of the extracted data for the user. When running `agendador.py` or `main.py`, synthesis a brief report (e.g., "Extração Concluída: 12 arquivos") and notify the Orchestrator for Telegram alerting.
