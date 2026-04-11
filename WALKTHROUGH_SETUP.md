# Manual de Instalação e Operação: CaioCore

Este guia detalha como configurar sua própria instância do Agente Caio Core do zero.

## 📋 Pré-requisitos
- Python 3.11 ou superior
- Git
- Uma conta no [OpenRouter](https://openrouter.ai/) (Recomendado) ou OpenAI.
- Um Bot no Telegram (Crie um no [@BotFather](https://t.me/BotFather)).

---

## 🛠️ Passo 1: Instalação Automática (Recomendado)

O CaioCore agora possui instaladores de "um clique" que cuidam de tudo (criação de ambiente virtual, instalação de dependências e configuração inicial).

### No Windows:
Basta dar um duplo clique no arquivo `install.bat` na raiz do projeto.

### No Linux/VPS:
```bash
chmod +x install.sh
./install.sh
```

---

## 🏗️ Passo 2: Instalação Manual (Alternativa)

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/gleisson-santos/agente_caio.git
   cd agente_caio
   ```

2. **Crie e ative um ambiente virtual:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Linux
   .venv\Scripts\activate     # Windows
   ```

3. **Instale as dependências:**
   ```bash
   pip install -e .
   ```

---

## 🪄 Passo 3: O Assistente `caio setup`

Execute o comando abaixo para iniciar o wizard (se não usou a instalação automática):
```bash
caio setup
```

**O que ele faz?**
- **Telegram:** Pede o Token e seu Chat ID.
- **IA Provider:** Configura sua API Key. O Caio já vem pré-configurado para usar o modelo `x-ai/grok-4.1-fast` via OpenRouter.
- **Workspace:** Cria as pastas de memórias, histórico e habilidades.


---

## 📡 Passo 3: Iniciando o Gateway

Para que o Dashboard e o Telegram funcionem, você deve iniciar o gateway:
```bash
caio gateway
```
Ao iniciar, o Caio registrará os **Especialistas Premium** automaticamente:
- Criador de Carrosséis (@carrossel)
- Lovable Prompt Artist (@lovable)
- Prospecção Imobiliária (@imobiliaria)
- Especialista E-commerce (@ecommerce)

---

## 📱 Como usar os Especialistas Premium

Dentro do chat (Telegram ou Dashboard), você pode invocar o poder de um especialista usando a arroba:

**Exemplo:**
> "User: @carrossel crie um post sobre os benefícios de dormir 8 horas"

O CaioCore detectará a menção, carregará as instruções de marketing e entregará o conteúdo formatado conforme o script de elite.

---

## 🐳 Deploy com Docker Swarm (Produção)

Se você estiver usando **Portainer**:
1. Crie uma Stack.
2. Copie o conteúdo do `docker-compose.yml`.
3. Certifique-se de que a rede `ControllNet` existe no seu Swarm.
4. Altere o `Host` para o seu domínio e pronto!

---

## 🆘 Suporte e Customização

O CaioCore é altamente extensível. Você pode adicionar novos agentes em `caiocore/agents/premium/` e registrá-los no arquivo `commands.py`.

