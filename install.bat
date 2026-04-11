@echo off
echo 🐱 CaioCore - Inicianado Instalação Automática (Windows) ...

:: Verifica se o Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Python não encontrado. Por favor, instale o Python 3.11+.
    pause
    exit /b 1
)

:: Cria ambiente virtual se não existir
if not exist ".venv" (
    echo [1/3] Criando ambiente virtual .venv ...
    python -m venv .venv
)

:: Instala dependências
echo [2/3] Instalando dependências (Core Slim) ...
.venv\Scripts\python -m pip install --upgrade pip
.venv\Scripts\python -m pip install -e .

:: Prepara arquivo de configuração
if not exist "config.json" (
    echo [3/3] Criando arquivo de configuração inicial ...
    copy config.example.json config.json
    .venv\Scripts\caio setup
) else (
    echo [3/3] Configuração já existente encontrada.
)


echo.
echo ✅ Instalação Concluída! 
echo Para iniciar o agente, use: .venv\Scripts\caio gateway
pause
