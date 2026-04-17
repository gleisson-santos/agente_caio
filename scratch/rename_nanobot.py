import os
import re

directories_to_scan = ['caiocore', 'dashboard', 'tools']
files_changed = 0

def process_file(filepath):
    global files_changed
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        
        # Ignorar o readme do dashboard ou arquivos the base
        if "Nanobot AI Framework" in content:
            # Protege a string base
            pass

        # Substituições seguras
        replacements = [
            (r'\.nanobot', '.caiocore'),
            (r'nanobot commands:', 'caio commands:'),
            (r'_parse_nanobot_metadata', '_parse_caio_metadata'),
            (r'Get nanobot metadata', 'Get caio metadata'),
            (r'I am nanobot', 'I am Caio'),
            (r'nanobot is thinking\.\.\.', 'Caio is thinking...'),
            (r'--force-reinstall nanobot', '--force-reinstall caiocore'),
            (r'nanobot Status', 'Caio Status'),
            (r'nanobot data directory', 'caio data directory'),
            (r'# nanobot Skills', '# Caio Skills'),
            (r'nanobot \((python)\)', 'caiocore (python)'),
            (r'NanobotDingTalkHandler', 'CaioDingTalkHandler'),
            (r'nanobot directory', 'caiocore directory'),
            (r'nanobot-python', 'caio-python'),
            (r'nanobot tools', 'caio tools'),
            (r'nanobot reply', 'caio reply'),
            (r'extends nanobot\'s', "extends Caio's"),
        ]
        
        for old, new in replacements:
            content = re.sub(old, new, content)
            
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {filepath}")
            files_changed += 1
            
    except Exception as e:
        print(f"Error on {filepath}: {e}")

for d in directories_to_scan:
    for root, dirs, files in os.walk(d):
        for file in files:
            if file.endswith('.py') or file.endswith('.md') or file.endswith('.ts') or file.endswith('.json') or file.endswith('.jsx') or file.endswith('.sh'):
                if file != "bg_remove.py" and file != "export.py":
                    process_file(os.path.join(root, file))

print(f"Total files updated: {files_changed}")
