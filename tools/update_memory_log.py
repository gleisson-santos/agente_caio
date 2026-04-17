import os
import subprocess
import re
from datetime import datetime

# Caminho para o MEMORY.md na raiz
MEMORY_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "MEMORY.md")
MAX_LOG_ENTRIES = 5

def get_latest_commit():
    try:
        # Puxa informações: Hash|Mensagem|Data|Autor
        result = subprocess.run(
            ["git", "log", "-1", "--pretty=format:%h|%s|%ci|%an"],
            capture_output=True, text=True, check=True
        )
        parts = result.stdout.strip().split('|', 3)
        if len(parts) < 4:
            return None
        
        # Puxa os arquivos modificados ignorando a si mesmo
        files_result = subprocess.run(
            ["git", "show", "--name-only", "--pretty=format:", "HEAD"],
            capture_output=True, text=True, check=True
        )
        files = [f.strip() for f in files_result.stdout.strip().split('\n') if f.strip() and "MEMORY.md" not in f.strip()]
        
        return {
            "hash": parts[0],
            "msg": parts[1],
            "date": parts[2], # data completa
            "author": parts[3],
            "files": files[:5] # Máximo de 5 arquivos listados para não poluir
        }
    except Exception as e:
        print(f"[!] Erro ao obter dados do git: {e}")
        return None

def update_memory_file(commit_info):
    if not os.path.exists(MEMORY_FILE):
        print("[!] MEMORY.md não encontrado.")
        return

    with open(MEMORY_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    start_marker = "<!-- DYNAMIC_LOG_START -->"
    end_marker = "<!-- DYNAMIC_LOG_END -->"

    if start_marker not in content or end_marker not in content:
        print("[!] Marcadores do DYNAMIC_LOG não encontrados no MEMORY.md.")
        return

    # Extrai o bloco de logs atual
    pattern = re.compile(rf"{start_marker}(.*?){end_marker}", re.DOTALL)
    match = pattern.search(content)
    if not match:
        return
        
    current_logs = match.group(1).strip()
    
    # Vamos usar *** como separador visual de registros
    entries = current_logs.split('***') if current_logs else []
    entries = [e.strip() for e in entries if e.strip()]

    # Monta a formatação da nova alteração
    files_str = ", ".join(commit_info['files']) if commit_info['files'] else "Nenhum além detalhado"
    if len(commit_info['files']) == 5:
        files_str += ", etc..."
        
    new_entry = f"**{commit_info['date']}** - `{commit_info['hash']}` por {commit_info['author']}\n> **Mensagem:** {commit_info['msg']}\n> *Arquivos tocados:* {files_str}"

    # Insere no topo e apaga os que passarem do limite
    entries.insert(0, new_entry)
    entries = entries[:MAX_LOG_ENTRIES]

    # Junta as strings usando o separador Markdown
    new_logs = "\n\n***\n\n".join(entries)
    
    # Reconstrói arquivo
    new_content = content[:match.start()] + start_marker + "\n" + new_logs + "\n" + end_marker + content[match.end():]

    with open(MEMORY_FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print(f"[+] MEMORY.md auto-atualizado com o commit {commit_info['hash']}.")

if __name__ == "__main__":
    commit = get_latest_commit()
    if commit:
        update_memory_file(commit)
