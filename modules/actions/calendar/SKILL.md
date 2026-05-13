---
name: calendar
description: Strategic calendar management via Google API. Use when scheduling meetings, checking availability, or managing the user's executive agenda.
---

# 📅 Calendar Action Module

Este módulo provê a onipresença temporal do Caio v5.0 sobre os compromissos do usuário.

## 🚀 Como Usar

### 1. Consulta de Agenda
Recupere os eventos do dia para consolidar o briefing matinal.
*Action:* `list_events(max_results=5)`

### 2. Agendamento Inteligente
Ao criar eventos, garanta que os horários START e END estejam em formato ISO (ex: 2026-05-12T10:00:00Z).
*Action:* `create_event(summary="...", start_time="...", end_time="...")`

### 3. Gestão de IDs
Para deletar ou editar, o ID do evento retornado pela listagem é obrigatório.

---
*Assinado: Caio Engine v5.0 — Action System*
