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
**2026-04-24 22:29:45 -0300** - `da7d6ea` por gleisson-santos
> **Mensagem:** chore: remove legacy nanobot vestiges and fix graph export
> *Arquivos tocados:* .dockerignore, README.md, bridge/package.json, graphify-out/GRAPH_REPORT.md, graphify-out/cache/0c4c208ce96f537436aa8c276c17d78a3a5bf56dd28d444876f1ef9ed1991afd.json, etc...

***

**2026-04-24 21:43:49 -0300** - `9cdaf67` por gleisson-santos
> **Mensagem:** chore: sync state and update ast graphify memory
> *Arquivos tocados:* .gitignore, INICIAR_PROJETO.md, caiocore/cli/commands.py, caiocore/config/schema.py, caiocore/server/api.py, etc...

***

**2026-04-16 23:23:46 -0300** - `cb0edde` por gleisson-santos
> **Mensagem:** docs: add mascote, dashboard screenshot and README updates
> *Arquivos tocados:* README.md, docs/dashboard.png, docs/mascote.png

***

**2026-04-16 23:20:59 -0300** - `4851598` por gleisson-santos
> **Mensagem:** docs: overhaul README with architecture, setup details and features
> *Arquivos tocados:* README.md, dashboard/SKILL22.md

***

**2026-04-16 23:14:50 -0300** - `d8ae7d2` por gleisson-santos
> **Mensagem:** feat: unify agent model and overhaul dashboard with tailwind, shadcn and tsx
> *Arquivos tocados:* caiocore/agents/premium/assistente_geral.md, caiocore/agents/premium/assuntos_email.md, caiocore/agents/premium/carrossel.md, caiocore/agents/premium/concorrentes.md, caiocore/agents/premium/copywriter.md, etc...
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
