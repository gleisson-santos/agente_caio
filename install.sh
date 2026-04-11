#!/bin/bash
echo "🐱 CaioCore - Iniciando Instalação Automática (Linux/VPS) ..."

# Verifica se o Python está instalado
if ! command -v python3 &> /dev/null
then
    echo "[ERRO] Python3 não encontrado. Por favor, instale com: sudo apt install python3 python3-venv"
    exit 1
fi

# Cria ambiente virtual se não existir
if [ ! -d ".venv" ]; then
    echo "[1/3] Criando ambiente virtual .venv ..."
    python3 -m venv .venv
fi

# Instala dependências
echo "[2/3] Instalando dependências (Core Slim) ..."
source .venv/bin/activate
pip install --upgrade pip
pip install -e .

# Prepara arquivo de configuração
if [ ! -f "config.json" ]; then
    echo "[3/3] Criando arquivo de configuração inicial ..."
    cp config.example.json config.json
    caio setup
else
    echo "[3/3] Configuração já existente encontrada."
fi


echo ""
echo "✅ Instalação Concluída!"
echo "Para iniciar o agente, use: source .venv/bin/activate && caio gateway"
