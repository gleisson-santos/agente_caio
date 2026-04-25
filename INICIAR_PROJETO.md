# Como Iniciar o Agente Caio (Passo a Passo)

Este guia prático mostra como ligar todos os serviços do **Agente Caio** na sua máquina local utilizando o Windows (PowerShell).

---

## 🖥️ 1. Terminal do Backend (Gateway e Agentes)

Abra o PowerShell, navegue até a pasta raiz do projeto e inicie o backend:

```powershell
# 1. Navegue até a pasta do projeto (caso não esteja lá)
cd C:\Users\gdesi\Desktop\Agente_caio

# 2. Ative o ambiente virtual isolado (.venv)
.\.venv\Scripts\activate

# Se ocorrer um erro de permissão, libere a execução de scripts no PowerShell usando:
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
# e depois tente ativar novamente (\.venv\Scripts\activate)

# 3. Inicie o Gateway (o servidor principal dos agentes)
python -m caiocore gateway
```

*(Mantenha esta janela do terminal aberta. O Gateway do backend agora está online e escutando por requisições)*

---

## 🌐 2. Terminal do Frontend (Dashboard UI)

Com o terminal anterior rodando o backend, **abra uma nova janela ou aba do PowerShell**, e inicie a interface visual:

```powershell
# 1. Navegue até a pasta do projeto (caso não esteja lá)
cd C:\Users\gdesi\Desktop\Agente_caio

# 2. Entre na pasta dedicada do frontend
cd dashboard

# 3. Inicie o servidor de desenvolvimento web
npm run dev
```

*(O terminal vai mostrar uma URL gerada, normalmente `http://localhost:5173` ou `http://localhost:3000`. Segure a tecla `Ctrl` e clique no link para abrir o dashboard no seu navegador).*

---

### Dicas Úteis
- **Encerrar os serviços:** Para parar os servidores, basta ir no terminal correspondente e pressionar `Ctrl + C`.  
- **Sair do ambiente virtual (.venv):** No terminal do backend, digite `deactivate` a qualquer momento para sair do modo `.venv`.
