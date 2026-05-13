# 🧠 MEMORY — Agente Caio v4.0 (Neural Sovereign)

## 🔴 ESTADO ATUAL DO SISTEMA
- **Versão**: 4.0 (Neural Sovereign Upgrade)
- **Status**: Operacional & Soberano
- **Foco**: Orquestração de Elite e Automação de Infraestrutura
> Este arquivo serve como a memória central do projeto, documentando evolução, arquitetura, melhorias e decisões técnicas críticas.
> **[DIRETRIZ PARA IA]**: SEMPRE leia o bloco "Histórico Recente de Alterações" abaixo ao iniciar uma nova sessão ou tarefa, para se contextualizar da fase atual.

---

## ⏳ Histórico Recente de Alterações (Auto-Feed)
*(Este bloco é atualizado automaticamente a cada commit)*
<!-- DYNAMIC_LOG_START -->
**2026-05-12 23:41:15 -0300** - `15b25a6` por gleisson-santos
> **Mensagem:** fix(dashboard): import missing 'cn' utility in App.tsx to resolve crash
> *Arquivos tocados:* dashboard/src/App.tsx

***

**2026-05-12 23:38:51 -0300** - `d7a2b90` por gleisson-santos
> **Mensagem:** feat(dashboard): full UI/UX v5.0 upgrade - chat management, skill selector, and reasoning integration (secrets removed)
> *Arquivos tocados:* caiocore/agent/loop.py, caiocore/agent/tools/mcp.py, caiocore/agent/tools/sandbox.py, dashboard/src/App.tsx, dashboard/src/components/ui/agent-plan.tsx, etc...

***

**2026-05-12 23:38:27 -0300** - `967d647` por gleisson-santos
> **Mensagem:** feat(dashboard): full UI/UX v5.0 upgrade - chat management, skill selector, and reasoning integration
> *Arquivos tocados:* caiocore/agent/loop.py, caiocore/agent/tools/mcp.py, caiocore/agent/tools/sandbox.py, dashboard/src/App.tsx, dashboard/src/components/ui/agent-plan.tsx, etc...

***

**2026-05-12 23:30:00 -0300** - `internal` por CAIO Engine v5.0
> **Mensagem:** feat: Finalized Phase 3 evolution. UI/UX Redesign complete. Implemented Real-time Reasoning Panel (CoT) and Artifact Canvas for code/doc visualization. Dashboard v5.0 is now a "War Room" operations center.
> *Arquivos tocados:* dashboard/src/App.tsx, dashboard/src/components/ui/agent-plan.tsx, dashboard/src/components/ui/artifact-canvas.tsx, MEMORY.md

***

**2026-05-12 23:20:00 -0300** - `internal` por CAIO Engine v5.0
> **Mensagem:** feat: Finalized Phase 2 evolution. Implemented Docker Sandbox (sandbox_exec) for secure code execution and Dynamic MCP Host discovery. Caio v5.0 is now securely extensible.
> *Arquivos tocados:* caiocore/agent/loop.py, caiocore/agent/tools/sandbox.py, caiocore/agent/tools/mcp.py, MEMORY.md
<!-- DYNAMIC_LOG_END -->

---

## 🚀 Visão Geral
O **Agente Caio** é um ecossistema de inteligência artificial multifuncional projetado para orquestração de tarefas, monitoramento de infraestrutura e automação de processos via Dashboard Web e Telegram. Ele utiliza o conceito de "Especialistas" para delegar funções específicas enquanto mantém um núcleo orquestrador centralizado.

---

## 🛠️ Arquitetura e Componentes

### 1. Gateway API (Backend - Port: 18795)
- **Tecnologia:** FastAPI / Python.
- **Função:** Núcleo central de processamento. Gerencia a comunicação entre os agentes, o banco de dados Supabase e as interfaces externas.
- **Destaque:** Implementa o `AgentLoop` e o `Orchestrator` que gerenciam ferramentas (tools) e sub-agentes.

### 2. Dashboard (Frontend - Port: 5173)
- **Tecnologia:** React / Vite / CSS Moderno.
- **Estilo:** Dark Premium / Futurista (v4.0).
- **Funcionalidades:** Monitoramento de métricas, log de eventos em tempo real, controle de especialistas e chat neural interativo.

### 3. Camada de Especialistas
- **Especialista em Email (Sentinel):** Análise e gestão de emails via IA. Modelos nativos para Telegram (multi/single) aprovados e ativos.
- **Agente SSO/Life/Token:** Micro-agentes de observabilidade. O monitor de tokens agora gera resumos semanais dinâmicos em HTML responsivo.
- **Especialista Podologia 🦶:** Agente integrado ao dashboard, responsável por acompanhamento de clientes e agendamentos.
- **Especialista em Pesquisa (v4.0):** Inteligência de busca profunda, extração de dados e agendamento de pesquisas recorrentes com o "Protocolo de Escolha".
- **Especialista Financeiro (FIIs/Ações):** Gera relatórios analíticos de carteiras de investimentos (ex: Carteira R$3k) exportando PDFs e dashboards móveis.

---

## 📈 Melhorias Recentes (Março 2026)

### 🌌 Refatoração UI/UX Premium (v4.0)
- **Neural Sphere:** Implementação de animação Canvas 60fps no cabeçalho do chat, simulando uma rede neural ativa.
- **Layout Modular:** O chat agora renderiza respostas em cards e blocos estruturados, evitando parágrafos longos e melhorando o scan visual.
- **Glassmorphism:** Visual moderno com desfoque de fundo, transparências neon e bordas arredondadas.
- **Ergonomia Mobile:** Input de chat fixo na base com auto-resize, garantindo usabilidade em qualquer dispositivo.

### ⚙️ Evolução dos Especialistas e VPS
- **Dashboard Modular:** Agentes "plug-and-play" (Ex: Podologia subiu automaticamente para a Camada Agentes no painel).
- **Entrega Multicanal:** Outputs centralizados no diretório `/out/` com disparo direto para o Telegram via ZIP para driblar restrições de SSH do usuário.
- **Consolidação de Ambiente:** Sincronização de dependências através de um único `.venv` e `requirements.txt` global para evitar redundâncias.

---

## 🧭 Diretrizes de Personalidade (Orchestrator)
O Agente Caio deve responder sempre de forma:
1. **Estruturada:** Uso obrigatório de títulos, listas e cards.
2. **Eficiente:** Linguagem clara, sem "conversas fiadas" desnecessárias.
3. **Proativa:** Sempre sugere o próximo passo ou ferramenta necessária.

---

## 📂 Pontos Importantes de Manutenção
- **Comandos Críticos:** 
  - `python start_api.py` -> Inicia o Gateway.
  - `npm run dev` (em /dashboard) -> Inicia o Frontend.
- **Segurança:** Todas as chaves e credenciais são gerenciadas em `config.json` (apenas exemplo em `config.example.json`).

---

## 📅 Roadmap Futuro
- [ ] Integração total com RustDesk para suporte remoto via Caio.
- [ ] Expansão do Agente Almoxarifado.
- [ ] Implementação de notificações push via Telegram para falhas críticas de infraestrutura em < 1s.

---
*Assinado: Agente Caio - Inteligência de Operações*
