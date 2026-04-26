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
**2026-04-25 16:35:47 -0300** - `d377e10` por gleisson-santos
> **Mensagem:** fix(dashboard): rewrite chat with solid scroll layout, fix agents page crash, add lazy neural graph
> *Arquivos tocados:* dashboard/src/App.tsx, dashboard/src/components/graph/NeuralGraph.tsx, dashboard/src/components/ui/animated-ai-chat.tsx, dashboard/src/pages/AgentsPage.tsx

***

**2026-04-25 16:21:48 -0300** - `504ad84` por gleisson-santos
> **Mensagem:** feat(dashboard): major UI redesign - neural graph, inline thinking, fullwidth chat, agents page
> *Arquivos tocados:* dashboard/package-lock.json, dashboard/package.json, dashboard/src/App.tsx, dashboard/src/components/ui/agent-plan.tsx, dashboard/src/components/ui/animated-ai-chat.tsx, etc...

***

**2026-04-25 15:59:30 -0300** - `cdc98b3` por gleisson-santos
> **Mensagem:** fix(auth): set OAUTHLIB_INSECURE_TRANSPORT to prevent HTTP localhost strict transport error on token fetch
> *Arquivos tocados:* caiocore/cli/commands.py, caiocore/server/api.py

***

**2026-04-25 15:48:52 -0300** - `315326e` por gleisson-santos
> **Mensagem:** fix(docker): correct caio-agent traefik loadbalancer port from 18795 to 18790
> *Arquivos tocados:* docker-compose.yml

***

**2026-04-25 00:15:47 -0300** - `0427a82` por gleisson-santos
> **Mensagem:** fix(docker): mount caio-stack volume to agent to ensure credentials reach container
> *Arquivos tocados:* docker-compose.yml
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
