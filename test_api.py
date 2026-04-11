import json
import urllib.request

try:
    with urllib.request.urlopen("http://localhost:8000/api/agents") as response:
        data = json.loads(response.read().decode())
        print(f"Total agentes: {len(data)}")
        for a in data:
            if a.get('tier') == 2:
                print(f"Especialista: {a.get('name')} | Status: {a.get('status')} | ID: {a.get('agent')}")
except Exception as e:
    print(f"Erro ao conectar na API: {e}")
