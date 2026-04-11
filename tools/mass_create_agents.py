import os
import re

def create_md(name, content, agent_id):
    path = f"c:\\Users\\gdesi\\Desktop\\Agente_caio\\caiocore\\agents\\premium\\{agent_id}.md"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Created: {agent_id}.md")

# 1. Lovable
with open(r"c:\Users\gdesi\Desktop\Agente_caio\dashboard\novos_agentes\agente_criado_lovable.txt", "r", encoding="utf-8") as f:
    create_md("Lovable Prompt Artist", f.read(), "lovable")

# 2. Carrossel
with open(r"c:\Users\gdesi\Desktop\Agente_caio\dashboard\novos_agentes\agente_criador_carrosseis.txt", "r", encoding="utf-8") as f:
    create_md("Criador de Carrosséis", f.read(), "carrossel")

# 3. Docx Content
with open(r"c:\Users\gdesi\Desktop\Agente_caio\dashboard\novos_agentes\docx_content.txt", "r", encoding="utf-8") as f:
    content = f.read()

# Pattern to find Agent blocks in the docx text
# Matches "Agente XXX" followed by content until next agent or end
# We'll look for <objetivo> tags as anchors
agent_blocks = re.split(r'Agente\s+', content)
agent_map = {
    "Assistente Geral": "assistente_geral",
    "Copywriter Sênior": "copywriter",
    "Planejador de Ementas de Cursos": "ementas",
    "Analista de Dados NPS": "nps",
    "Criador de Páginas de Vendas": "paginas_vendas",
    "Analista de Concorrentes": "concorrentes",
    "Assessor de Imprensa": "imprensa",
    "Otimizador de SEO": "seo",
    "Gerador de Assuntos para Emails": "assuntos_email",
    "Gerador de Posts para Instagram": "posts_instagram",
    "Criador de Iscas Digitais": "iscas_digitais",
    "Suporte ao aluno": "suporte_aluno",
    "Onboarding e CS": "onboarding_cs",
    "Suporte Técnico": "suporte_tecnico",
    "Vendas": "vendas",
    "Pesquisa de Satisfação": "pesquisa_satisfacao",
    "Perfil DISC": "perfil_disc",
    "SDR": "sdr",
    "Agendamento": "agendamento",
    "Entrega de Isca Digital": "entrega_isca",
    "Reservas em Restaurante": "reservas",
    "Acompanhamento de Entrega": "rastreio",
    "Simulação de Financiamento": "financiamento",
    "Renovação de Assinatura": "renovacao"
}

for block in agent_blocks:
    if not block.strip(): continue
    for name, agent_id in agent_map.items():
        # Match name regardless of "Agente" prefix or subtle differences
        name_clean = name.replace(" ", r"\s+").replace("ê", ".") # Relaxed ê match
        if re.search(name_clean, block[:200], re.IGNORECASE):
            match = re.search(r'(<objetivo>.*</instrucoes>)', block, re.DOTALL)
            if match:
                create_md(name, match.group(1), agent_id)
            break
