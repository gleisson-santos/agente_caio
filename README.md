<div align="center">
  <img src="docs/dashboard_online.png" alt="Caio Corp Dashboard" width="800"/>
  <h1>🐱 Agente Caio Corp v3.0</h1>
  <p><strong>Centro de Inteligência Operacional & Plataforma de Agentes Autônomos</strong></p>
  <p>
    <a href="https://github.com/gleisson-santos/agente_caio/actions"><img src="https://github.com/gleisson-santos/agente_caio/actions/workflows/docker-publish.yml/badge.svg" alt="Build"></a>
    <a href="https://hub.docker.com/r/caiocorp/caio-dashboard"><img src="https://img.shields.io/docker/pulls/caiocorp/caio-dashboard?label=Dashboard%20Pulls&logo=docker" alt="Dashboard Pulls"></a>
    <a href="https://hub.docker.com/r/caiocorp/caio-agent"><img src="https://img.shields.io/docker/pulls/caiocorp/caio-agent?label=Agent%20Pulls&logo=docker" alt="Agent Pulls"></a>
    <img src="https://img.shields.io/badge/python-≥3.11-blue" alt="Python">
    <img src="https://img.shields.io/badge/react-18-61DAFB?logo=react&logoColor=black" alt="React">
  </p>
</div>

---

**Caio Corp** é uma plataforma hierárquica e auto-gerenciada de agentes de IA. Liderada pelo **Caio (CEO)**, a plataforma engloba desde a orquestração e monitoramento em tempo real (painel Web) até a execução de fluxos de dados, extração de pendências, monitoramento de e-mails, gestão de agendas e geração de documentos processuais. Tudo integrado via Telegram, Banco de Dados (Supabase) e Dashboard próprio.

## 🧬 Hierarquia de Agentes

Nosso sistema opera em Tiers (Níveis de Acesso e Responsabilidade), garantindo que os fluxos sejam delegados de forma inteligente com "observabilidade" total no Dashboard em Tempo Real.

```mermaid
graph TD
    %% Estilos
    classDef ceo fill:#8B5CF6,stroke:#6D28D9,stroke-width:2px,color:#fff,rx:10px,ry:10px;
    classDef infra fill:#1F2937,stroke:#374151,stroke-width:2px,color:#fff,rx:8px,ry:8px;
    classDef spec fill:#064E3B,stroke:#047857,stroke-width:2px,color:#fff,rx:8px,ry:8px;

    %% Nós
    CEO["🧠 Caio (CEO)<br>Orquestrador Principal"]:::ceo

    subgraph Camada de Infraestrutura e Monitoramento (Tier 1)
        A_TOKEN["💎 Agente Token<br>Auditor de Consumo"]:::infra
        A_BD["🗄️ Agente BD<br>Monitor de Dados"]:::infra
        A_LIFE["❤️ Agente Life<br>Supervisor do Sistema"]:::infra
        A_SSO["🖥️ Agente SSO<br>Infra & Saúde VPS"]:::infra
    end

    subgraph Camada de Execução Especializada (Tier 2)
        S_PEND["⚡ Especialista em Pendências<br>Extrai SCI/Upload Supabase"]:::spec
        S_EMAIL["📧 Especialista em Email<br>Leitura IMAP/Resumos"]:::spec
        S_SCHED["📆 Especialista dos Schedule<br>Google Calendar & Crons"]:::spec
        S_DOCS["📄 Especialista em Documentos<br>Geração PDF/PPTX/DOCX"]:::spec
    end

    %% Conexões
    CEO --> A_TOKEN
    CEO --> A_BD
    CEO --> A_LIFE
    CEO --> A_SSO

    A_BD -.-> S_PEND
    A_LIFE -.-> S_EMAIL
    CEO --> S_SCHED
    CEO --> S_DOCS
```

## ✨ O que o Caio pode fazer por você:

1. **Gestão via Telegram 24/7:** O bot do Caio fica ouvindo no seu Telegram. Você pede para ele extrair pendências, e ele acorda o Especialista de Pendências, roda a automação de Selenium (Brave), e devolve o resumo.
2. **Dashboard Web "Live":** Tudo o que os agentes fazem reflete imediatamente no Dashboard `agentecaio.controllserv.com.br`, indicando o Status de cada serviço (Online, Error, Executando) e suas métricas.
3. **Seninela de E-mails:** O Especialista de E-mail fica de olho na sua caixa de entrada, filtra SPAM via IA, resume o que é mais importante e avisa você das urgências.
4. **Gerenciador de Tempo:** Com a nova integração do **Google Calendar**, você pede no Telegram: "Caio, marca uma reunião amanhã às 14h com o Thiago", e o evento é agendado magicamente no seu calendário.
5. **Criador de Documentos Profissionais:** Peça "Mano, cria uma proposta comercial de prestação de serviço de TI para o Cliente XPTO", e o sistema devolve o `.docx` pronto e perfeitamente formatado.

---

## 🏗️ Arquitetura e Deploy (100% Docker Swarm)

A arquitetura moderna do Caio Corp é desenhada para rodar em Clusters Swarm (VPS) usando **Portainer** e **Traefik** como Reverse Proxy. Esqueça rodar scripts e NPM na mão no servidor; nós apenas subimos os blocos.

```text
    [Internet] 
        │ (HTTPS)
   ┌────▼────┐
   │ Traefik │ (Load Balancer & SSL via LetsEncrypt)
   └────┬────┘
        │
        ├─▶ [ /api , /events ] ──▶  [ caio-agent ] (Backend Python Gateway API)
        │
        └─▶ [  /* (Front)    ] ──▶  [ caio-dashboard ] (Vite + Nginx)
```

## 🚀 Como fazer o Deploy na VPS (Portainer)

As imagens são criadas *automaticamente* no GitHub Actions e enviadas para sua conta `caiocorp` no Docker Hub a cada PUSH.

1. **Gere suas Chaves (Tokens e APIs):** Você vai precisar do Token do BotFather (Telegram), da OpenAI e (opcional) o do Brave.
2. **Vá ao Portainer da sua VPS** -> Clique em **Stacks** -> Add Stack
3. Dê o nome de `caio-corp` e cole a nossa Stack Oficial de Produção:

```yaml
version: "3.7"
services:
  ## DASHBOARD (Frontend)
  caio-dashboard:
    image: caiocorp/caio-dashboard:latest
    networks:
      - ControllNet
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.caio-dashboard.rule=Host(`agentecaio.controllserv.com.br`)
        - traefik.http.routers.caio-dashboard.entrypoints=websecure
        - traefik.http.routers.caio-dashboard.priority=1
        - traefik.http.routers.caio-dashboard.tls.certresolver=letsencryptresolver
        - traefik.http.routers.caio-dashboard.service=caio-dashboard
        - traefik.http.services.caio-dashboard.loadbalancer.server.port=80

  ## AGENT (Backend & IA)
  caio-agent:
    image: caiocorp/caio-agent:latest
    command: [ "gateway" ]
    volumes:
      - caio_workspace:/app/workspace
      - /root/agente_caio/config.json:/root/.nanobot/config.json
      - /root/agente_caio/caio-stack:/app/caio-stack
    networks:
      - ControllNet
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - BRAVE_API_KEY=${BRAVE_API_KEY}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.caio-agent.rule=Host(`agentecaio.controllserv.com.br`) && (PathPrefix(`/api`) || PathPrefix(`/events`))
        - traefik.http.routers.caio-agent.entrypoints=websecure
        - traefik.http.routers.caio-agent.priority=2
        - traefik.http.routers.caio-agent.tls.certresolver=letsencryptresolver
        - traefik.http.services.caio-agent.loadbalancer.server.port=18795

volumes:
  caio_workspace:
    external: true
    name: caio_workspace

networks:
  ControllNet:
    external: true
    name: ControllNet
```
4. Configure as "Environment Variables" no Portainer com seus tokens reais.
5. Pressione **Deploy the stack**.

---

## 📅 Ativando a Automação do Google Calendar

Para o agente Caio (Especialista Schedule) conseguir olhar seu calendário, avisar você de reuniões e marcar novos compromissos, precisamos emparelhar a aplicação.

O Google confia em 2 arquivos mágicos:
1. `credentials.json` (Diz qual é o seu sistema).
2. `token.json` (Diz que "Você Autorizou" seu email a usar o aplicativo).

**Passo a passo Fácil (1 Minuto):**

1. Salve o seu arquivo `credentials.json` do Google Cloud na pasta `caio-stack/core/credentials.json` aí no seu computador (Windows). *(Ele não sobe para o Github)*.
2. Abra o terminal na pasta raiz do projeto e puxe as atualizações: `git pull origin main`
3. Rode o gerador inteligente:
   ```bash
   python gerar_token_google.py
   ```
4. O navegador do seu PC vai abrir. Basta logar na sua conta Google e clicar em "**Permitir / Avançar**".
5. Uma mensagem de SUCESSO vai surgir na tela e o arquivo `token.json` será criado ao lado do credentials.

**Enviando para o Servidor:**
6. Vá na sua VPS, e garanta que esses **DOIS arquivos** estejam salvos no caminho exato:
   - `/root/agente_caio/caio-stack/core/credentials.json`
   - `/root/agente_caio/caio-stack/core/token.json`
7. Como a nossa *Stack* Oficial já conta com o volume de injeção (`- /root/agente_caio/caio-stack:/app/caio-stack`), agora o Caio lá na nuvem vai enxergar o seu calendário e você verá a luz dele acender no Dashboard!

---

## 🛠️ Modo Desenvolvedor Local (React)

Quer testar uma alteração no visual do Dashboard antes de enviar o `git push`? Fácil:

```bash
cd dashboard
npm run dev
```
Com o Front rodando local (Vite), ele vai espertamente procurar a API do Backend rodando no `localhost:18795` (caso você inicie a API do Caio no seu PC com `nanobot gateway`), mas manterá as configurações de Traefik ilesas para a produção!

> O Arquivo Oficial que dita quem são os agentes exibidos hoje no painel é o `agents_list.json`.

---

<p align="center">
  <strong>🐱 Caio Corp — O futuro das operações escaláveis. Totalmente IA. Totalmente sob comando.</strong>
</p>
