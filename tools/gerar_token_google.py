import os
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow

# Escopos que o Caio usa para gerenciar o Google Calendar
SCOPES = ["https://www.googleapis.com/auth/calendar"]

def gerar_token():
    print("=" * 60)
    print("GERADOR DE TOKEN DO GOOGLE CALENDAR PARA O AGENTE CAIO")
    print("=" * 60)
    
    # Verifica onde estão as credenciais
    caminho_credenciais = "caio-stack/core/credentials.json"
    caminho_token = "caio-stack/core/token.json"
    
    if not os.path.exists(caminho_credenciais):
        print(f"ERRO: Não encontrei o arquivo {caminho_credenciais}.")
        print("Mova as suas credentials.json do Google para dentro da pasta caio-stack/core/")
        input("Aperte ENTER para fechar...")
        return
        
    print(f"Credenciais encontradas em {caminho_credenciais}.")
    print("Abrindo o navegador para você fazer login no Google...")
    
    try:
        # Abre o navegador e pede autorização
        flow = InstalledAppFlow.from_client_secrets_file(caminho_credenciais, SCOPES)
        creds = flow.run_local_server(port=0)
        
        # Salva o token.json para ser levado pra VPS
        with open(caminho_token, "w") as token_file:
            token_file.write(creds.to_json())
            
        print("\n" + "=" * 60)
        print("SUCESSO ABSOLUTO!")
        print(f"Seu arquivo de token foi criado com sucesso em: {caminho_token}")
        print("Agora você só precisa:")
        print("1. Abrir esse arquivo token.json com o bloco de notas e COPIAR tudo")
        print("2. Ir na sua VPS no Portainer/SSH")
        print("3. Criar o arquivo lá dentro em /root/agente_caio/caio-stack/core/token.json")
        print("4. Colar o conteúdo e salvar!")
        print("=" * 60 + "\n")
        
    except Exception as e:
        print(f"\nOcorreu um erro ao gerar o token: {e}")
        
    input("Aperte ENTER para fechar essa janela...")

if __name__ == "__main__":
    gerar_token()
