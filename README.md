<div align="center">
  <img src="docs/mascote.png" alt="Mascote Agente Caio" width="250"/>
  <h1>🐱 Agente Caio Core (CaioCore)</h1>
  <p><strong>A Solução Suprema para Operações Inteligentes e Monetização de Agentes IA</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Versão-Premium_v4.0-gold?style=for-the-badge" alt="Versão Premium">
    <img src="https://img.shields.io/badge/Status-Neural_Sovereign-red?style=for-the-badge" alt="Status">
    <img src="https://img.shields.io/badge/Criado_por-Gleisson_Santos-blue?style=for-the-badge" alt="Autor">
  </p>
</div>

---

## ⚡ Novidade: Agente Caio v4.0 (Neural Sovereign)

O CaioCore foi elevado para a arquitetura **Neural Sovereign**. Esta atualização redefine a interação entre humano e IA, focando em soberania absoluta e execução técnica de elite. 

Diferente de frameworks tradicionais (como Nanobot, OpenClaw e afins), o Caio foi recriado para orquestração proficiente, economia de API e contexto persistente.

### 🔥 O que diferencia o Agente Caio?
*   **🧠 Graphify Indexing + Obsidian 3D:** Chega de "começar do zero" a cada sessão. Todo o seu ambiente é mapeado em um Grafo de Conhecimento AST (Abstract Syntax Tree). O Caio lê a *enciclopédia da estrutura* em vez de abrir mil arquivos, economizando mais de 70% em tokens e abrindo seu projeto em 3D nativamente no Obsidian.
*   **🔀 Smart Router (Troca Automática de Modelos):** Tarefas simples são designadas para modelos rápidos e baratos (ex: Flash Lite). Se o algoritmo detecta que você pediu uma análise complexa ou código novo, ele faz rotas transparentes para LLMs de alta carga (Claude 3.7 Sonnet / Grok Pro), cobrindo falhas (Fallbacks) automaticamente.
*   **🧬 Arquitetura de Córtex:** Uma identidade de Orquestrador Central (CEO Caio) liderando em tempo real múltiplos Especialistas de Nível 2 (Especialista em Banco de Dados, Auditor de Infra, Extratores de UI, etc).
*   **💾 Memória Evolutiva:** O `MEMORY.md` serve como Lobo Frontal, onde todas as decisões que os agentes tomam em código local ou no servidor caem silenciosamente em um cache inter-sessões.

---

<div align="center">
  <img src="docs/dashboard_online.png" alt="Agente Caio - Dashboard Oficial" width="800"/>
  <p><i>Painel de Controle Central com Monitoramento Real-time do Sistema (SSE)</i></p>
</div>

---

## 💎 Loja de Agentes (App Store e Monetização)

O diferencial de mercado do CaioCore é a **Loja de Agentes** embutida dentro do ecossistema. Embora você possua a estrutura núcleo (Open-Source baseada em roteamento Python/FastAPI), os Perfis de Execução podem ser comercializados:

- **📊 Especialista em UI / UX:** Cria front-ends completos e estilizados automaticamente baseados em wireframes.
- **🏠 Prospecção e Leads:** Pipeline focado em qualificação B2B ou imobiliárias, injetando no Supabase.
- **☁️ Engenheiro DevOps:** Verifica instâncias Portainer/Docker e aciona webhooks de segurança.
*...e mais 15 frameworks plug-and-play integrados!*

---

## 🛠️ Guia Completo de Instalação

### 1. Padrão de Execução Local (Testes e Código)

Para desenvolvedores querendo rodar o Agente via terminal local (sem criar toda a nuvem Docker).

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/gleisson-santos/agente_caio.git
   cd agente_caio
   ```
2. **Sistema Virtual (VENV):** Recomendamos utilizar Python 3.11+.
    ```bash
    python -m venv .venv
    # Ative o ambiente local
    source .venv/bin/activate  # Linux/Mac
    .venv\Scripts\activate   # Windows
    ```
3. **Instale as dependências modulares:**
   O CaioCore é leve. Escolha o tamanho do seu motor:
   - *Padrão (Core):* `pip install -e .`
   - *Browser/Visão (Selenium):* `pip install -e ".[browser]"`
   - *Full Stack Total:* `pip install -e ".[all]"`
4. **Crie a configuração do Agente:**
    ```bash
    cp config.example.json config.json
    ```
    *Preencha no arquivo suas chaves da LiteLLM, OpenRouter, e principalmente o Token do Telegram (`@BotFather`).*
5. **Dê Partida:**
   ```bash
   caio gateway
   ```

---

### 2. Padrão Produção na VPS (Docker Swarm / Portainer)

Se você já quer plugar sua ferramenta no universo (via Nuvem), a versão de Servidor utiliza o ecossistema Portainer com roteamentos dinâmicos via Traefik Proxy.

Documentamos o passo a passo exato e vitalício, abordando como ligar os volumes, fazer a rede e usar a Stack isolada do Swarm. 

📋 **LEIA O GUIA AQUI:** ➡️ [**DEPLOY_VPS.md**](DEPLOY_VPS.md) ⬅️

> **Importante:** Sempre faça o build local da imagem usando o `Dockerfile` antes de subir a stack para refletir customizações! `docker build -t caiocorp/caio-agent:latest .`

---

## 🧰 Comandos do Terminal 

Quando rodado localmente, a CLI `caio` fornece as engrenagens principais do software:

```bash
caio gateway           # Sobe o servidor web FastAPI e o Listening do Telegram
caio status            # Traz Logs de Saúde e métricas de RAM/DB
caio cron list         # Visualiza os agendamentos inteligentes atuais
caio --help            # Menu de orquestração detalhado
```

---

## 🤝 Créditos e Contato

**Arquiteto/Desenvolvedor Chefe:** Gleisson Santos  
**Ecossistema Principal/Deploy:** Plataforma UomniMind  
**Motor Open-Source Base:** Nanobot AI Framework 

---
<p align="center">
  <strong>Agente Caio — Potencializando Humanos com Inteligência Artificial Executável.</strong>
</p>
