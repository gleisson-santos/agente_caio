# 🚀 Deploy Agente Caio na VPS — Guia Completo

Guia passo-a-passo para subir o **Agente Caio** (API + Dashboard) na VPS com **Portainer + Traefik**.

---

## 📋 Pré-requisitos

Antes de começar, sua VPS precisa ter:

| Componente | Requisito |
|---|---|
| **OS** | Ubuntu 22.04+ (limpa, sem CyberPanel/Hestia) |
| **Docker** | Docker Engine 24+ com **Swarm** ativado |
| **Traefik** | Rodando como proxy reverso com certresolver `letsencryptresolver` |
| **Portainer** | Acessível para gerenciar stacks |
| **Rede** | Rede overlay `ControllNet` criada no Swarm |
| **DNS** | Registro A apontando `seu-dominio.com.br` → IP da VPS |

---

## 🛠️ Passo 1: Preparar a VPS

Se o Docker Swarm e a rede ainda não existem:

```bash
# Ativar modo Swarm (só na primeira vez)
docker swarm init

# Criar a rede overlay compartilhada (Traefik + Apps)
docker network create --driver=overlay --attachable ControllNet
```

> [!IMPORTANT]
> **Já possui Traefik e Portainer rodando?**
> Se você já tem uma infraestrutura própria e o seu Traefik usa um nome de rede diferente (ex: `traefik-public` ou `web`), você **não** precisa criar a rede `ControllNet` ou instalar o Traefik de novo. Basta pular esse passo e, na hora de fazer o Deploy (Passo 5), substituir todas as menções à rede `ControllNet` para o **nome exato da rede do seu Traefik** no `docker-compose.yml`. Se você não fizer isso, o Traefik não achará os containers e você receberá o erro `504 Gateway Timeout`!

---

## 📦 Passo 2: Clonar o Repositório

```bash
cd /root
git clone https://github.com/gleisson-santos/agente_caio.git
cd agente_caio
```

---

## ⚙️ Passo 3: Configurar o `config.json`

```bash
cp config.example.json config.json
nano config.json
```

### Campos obrigatórios para preencher:

| Campo | Onde encontrar |
|---|---|
| `channels.telegram.token` | [@BotFather](https://t.me/BotFather) no Telegram |
| `channels.telegram.allowFrom` | Seu Chat ID numérico |
| `channels.telegram.notifyChatId` | Mesmo Chat ID |
| `providers.openrouter.apiKey` | [openrouter.ai](https://openrouter.ai/) |
| `channels.email.*` | Dados IMAP/SMTP do seu email |
| `supabase_connections[0].*` | URL e Key do seu Supabase (se usar) |

> **IMPORTANTE:** O `config.json` é montado dentro do container via bind mount em `/root/.caiocore/config.json`. O Dashboard lê e salva essas configurações via endpoint `/api/settings`.

---

## 📂 Passo 4: Criar o Volume do Workspace

```bash
docker volume create caio_workspace
```

Este volume persiste a memória, histórico e habilidades do agente entre restarts.

---

## 🏗️ Passo 4.5: Build da Imagem Local (Importante)

Como você clonou o código e pode ter alterações (além da instalação de pacotes como Graphify), é necessário construir a imagem do **caio-agent** na sua VPS antes do Deploy:

```bash
cd /root/agente_caio
docker build -t caiocorp/caio-agent:latest .
```
> **Nota:** A imagem do *Dashboard* (`caiocorp/caio-dashboard:latest`) será puxada do Docker Hub automaticamente.

---

## 🐳 Passo 5: Criar a Stack no Portainer

1. Acesse o **Portainer** da sua VPS
2. Vá em **Stacks** → **Add Stack**
3. Nome da Stack: `caio`
4. Cole o YAML abaixo (Docker Compose para produção):

```yaml
services:

  ## --------------------------- CAIO CORP --------------------------- ##

  caio-dashboard:
    image: caiocorp/caio-dashboard:latest
    networks:
      - ControllNet
    ports:
      - "8080:80"
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]
      labels:
        - traefik.enable=true
        - traefik.docker.network=ControllNet
        - traefik.http.routers.caio-dashboard.rule=Host(`${DOMAIN:-localhost}`)
        - traefik.http.routers.caio-dashboard.entrypoints=websecure
        - traefik.http.routers.caio-dashboard.tls.certresolver=letsencryptresolver
        - traefik.http.services.caio-dashboard.loadbalancer.server.port=80

  ## --------------------------- CAIO CORP --------------------------- ##

  caio-agent:
    image: caiocorp/caio-agent:latest
    command: [ "gateway" ]
    volumes:
      - caio_workspace:/root/.caiocore/workspace
      - /root/agente_caio/config.json:/root/.caiocore/config.json
    networks:
      - ControllNet
    ports:
      - "18795:18795"
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]
      labels:
        - traefik.enable=true
        - traefik.docker.network=ControllNet
        - traefik.http.routers.caio-agent.rule=Host(`${DOMAIN:-localhost}`) && (PathPrefix(`/api`) || PathPrefix(`/events`))
        - traefik.http.routers.caio-agent.entrypoints=websecure
        - traefik.http.routers.caio-agent.tls.certresolver=letsencryptresolver
        - traefik.http.services.caio-agent.loadbalancer.server.port=18795

## --------------------------- CAIO CORP --------------------------- ##

volumes:
  caio_workspace:
    external: true
    name: caio_workspace

networks:
  ControllNet:
    external: true
    name: ControllNet
```

5. Clique em **Deploy the stack**

---

## ✅ Passo 6: Verificações Pós-Deploy

### 6.1 — Verificar se os containers estão rodando

```bash
docker service ls | grep caio
```

Deve mostrar `1/1` para ambos os serviços.

### 6.2 — Testar o Dashboard

Acesse: **https://seu-dominio.com.br/**

O Dashboard deve carregar com a interface do Caio.

### 6.3 — Testar a API

```bash
curl https://seu-dominio.com.br/api/status
```

Deve retornar JSON com `"status": "online"`.

### 6.4 — Testar as Configurações (Settings)

No Dashboard, acesse o menu **Configurações**. Os campos devem ser preenchidos com os dados do seu `config.json`:
- Modelo de IA (ex: `x-ai/grok-4.1-fast`)
- Token do Telegram
- API Keys dos provedores

Ao clicar **Salvar Alterações**, o `config.json` na VPS é atualizado automaticamente.

### 6.5 — Testar o Telegram

Envie uma mensagem para o bot. O Caio deve responder.

---

## 🔄 Atualizações Futuras

Para atualizar o Agente Caio:

```bash
cd /root/agente_caio
git pull

# No Portainer: vá na Stack "caio" e clique em "Update the stack"
# Ou via CLI:
docker service update --force caio_caio-agent
docker service update --force caio_caio-dashboard
```

> **⚠️ IMPORTANTE:** Nunca confie na tag `latest` em produção sem supervisão. Considere fixar versões ao lançar releases estáveis.

---

## 🧹 Limpeza (Remoção Completa)

Se precisar remover tudo:

```bash
# 1. Remover a Stack
docker stack rm caio

# 2. Aguardar containers pararem
sleep 10

# 3. Remover volume (ATENÇÃO: apaga workspace/memórias)
docker volume rm caio_workspace

# 4. Remover imagens
docker rmi caiocorp/caio-agent:latest caiocorp/caio-dashboard:latest
```

---

## 🏗️ Arquitetura de Roteamento

```
Internet
  │
  ▼
Traefik (ControllNet)
  │
  ├── Host: ${DOMAIN:-localhost}
  │     ├── / → caio-dashboard (Nginx :80)
  │     ├── /api/* → caio-agent (FastAPI :18795)
  │     └── /events → caio-agent (FastAPI :18795)
  │
  └── TLS via Let's Encrypt
```

O Dashboard e a API compartilham o **mesmo domínio**. O Traefik roteia por path:
- **Raiz (`/`)** → Dashboard (React SPA via Nginx)
- **`/api/*` e `/events`** → Backend Python (FastAPI)

O Dashboard em produção faz chamadas para `/api/settings`, `/api/agents`, etc. sem prefixo de host (same-origin), o que é resolvido naturalmente pelo Traefik.
