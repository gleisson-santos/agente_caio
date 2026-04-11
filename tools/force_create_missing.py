import os
import re

def create_md(agent_id, content):
    path = f"c:\\Users\\gdesi\\Desktop\\Agente_caio\\caiocore\\agents\\premium\\{agent_id}.md"
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Force Created: {agent_id}.md")

with open(r"c:\Users\gdesi\Desktop\Agente_caio\dashboard\novos_agentes\docx_content.txt", "r", encoding="utf-8") as f:
    content = f.read()

# Manual extraction for the stubborn ones
missing = {
    "copywriter": (r"Copywriter\s+S.nior", r"<objetivo>.*?</instrucoes>"),
    "onboarding_cs": (r"Onboarding\s+e\s+CS", r"<objetivo>.*?</instrucoes>"),
    "pesquisa_satisfacao": (r"Pesquisa\s+de\s+Satisfa..o", r"<objetivo>.*?</instrucoes>")
}

for agent_id, (name_pat, prompt_pat) in missing.items():
    # Find the block first
    # Search for the name, then find the next <objetivo> block
    start_match = re.search(name_pat, content, re.IGNORECASE)
    if start_match:
        # Search for prompt starting FROM the name match
        prompt_match = re.search(prompt_pat, content[start_match.start():], re.DOTALL)
        if prompt_match:
            create_md(agent_id, prompt_match.group(0))
        else:
            print(f"Prompt not found for {agent_id}")
    else:
        print(f"Name match not found for {agent_id}")
