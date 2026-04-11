import os
import json
import urllib.request

URL = "https://SUA_URL.supabase.co"
KEY = "SUA_ANON_KEY_AQUI"


OUT_DIR = r"C:\Users\gdesi\Desktop\Agente_caio\Export_TI"
os.makedirs(OUT_DIR, exist_ok=True)

def fetch_openapi():
    req = urllib.request.Request(f"{URL}/rest/v1/?apikey={KEY}")
    try:
        with urllib.request.urlopen(req) as res:
            return json.loads(res.read().decode('utf-8'))
    except Exception as e:
        print(f"Error fetching OpenAPI: {e}")
        return None

# Busca as tabelas
spec = fetch_openapi()
tables = set()

if spec and 'definitions' in spec:
    for key in spec['definitions']:
        # Verifica se não é "PostgREST" e assemelhados (às vezes tem views ou system tables, mas definitions normalmente tem as tabelas expostas)
        tables.add(key)
        
if spec and 'paths' in spec:
    for path in spec['paths']:
        if path.startswith('/'):
            tables.add(path[1:])

if not tables:
    tables = {"carropipa", "faltadagua", "pavimentos", "vazamentos"}
else:
    # Garante que as pedidas estão no conjunto caso não apareçam por algum motivo
    tables.update(["carropipa", "faltadagua", "pavimentos", "vazamentos"])

print("Tabelas encontradas para exportar:", tables)

for table in tables:
    req = urllib.request.Request(f"{URL}/rest/v1/{table}?select=*")
    req.add_header("apikey", KEY)
    req.add_header("Authorization", f"Bearer {KEY}")
    req.add_header("Accept", "text/csv")
    try:
        with urllib.request.urlopen(req) as res:
            csv_data = res.read().decode('utf-8')
            # Verifica se retornou vazio para não gerar muito lixo
            if csv_data.strip():
                with open(os.path.join(OUT_DIR, f"{table}.csv"), "w", encoding="utf-8") as f:
                    f.write(csv_data)
                print(f"Exportado com sucesso: {table}")
            else:
                print(f"A tabela {table} está vazia ou não acessível com a chave atual.")
    except Exception as e:
        print(f"Falha ao exportar tabela '{table}': {e}")
