import os

def replace_in_file(filepath, search_text, replace_text):
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            content = file.read()
        
        if search_text in content:
            new_content = content.replace(search_text, replace_text)
            with open(filepath, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"Updated: {filepath}")
    except Exception as e:
        print(f"Error in {filepath}: {e}")

def migrate(root_dir):
    extensions = ('.py', '.md', '.yml', '.yaml', '.json', '.sh', '.toml', 'Dockerfile', 'docker-compose.yml')
    for root, dirs, files in os.walk(root_dir):
        # Skip some dirs
        if any(skip in root for skip in ('.git', '__pycache__', 'venv', 'node_modules', '.gemini')):
            continue
        
        for file in files:
            if file.endswith(extensions) or file in ('Dockerfile', 'docker-compose.yml'):
                filepath = os.path.join(root, file)
                # Specific replacements
                replace_in_file(filepath, 'from caiocore', 'from caiocore')
                replace_in_file(filepath, 'import caiocore', 'import caiocore')
                replace_in_file(filepath, 'caiocore.', 'caiocore.')
                replace_in_file(filepath, '/caiocore', '/caiocore')
                replace_in_file(filepath, 'caiocore/', 'caiocore/')
                replace_in_file(filepath, '"caiocore"', '"caiocore"')
                replace_in_file(filepath, "'caiocore'", "'caiocore'")
                # Special case for the logo/branding
                replace_in_file(filepath, 'CaioCore - Operações Inteligentes', 'CaioCore - Operações Inteligentes')

if __name__ == "__main__":
    migrate('.')
