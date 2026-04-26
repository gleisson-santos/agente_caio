import os
import json
from google_auth_oauthlib.flow import InstalledAppFlow

# Escopo necessário para o Calendar API
SCOPES = ['https://www.googleapis.com/auth/calendar']

def main():
    print("="*60)
    print("GERADOR DE TOKEN DO GOOGLE CALENDAR PARA O AGENTE CAIO")
    print("="*60)
    
    cred_file = "credentials.json"
    
    # 1. Verifica se credentials.json existe no diretório atual
    if not os.path.exists(cred_file):
        print(f"\n[ERRO] O arquivo '{cred_file}' não foi encontrado no diretório atual!")
        print("Siga os passos:")
        print(" 1. Vá em https://console.cloud.google.com/")
        print(" 2. Crie ou Selecione um projeto")
        print(" 3. Ative a 'Google Calendar API'")
        print(" 4. Vá em Credenciais -> Criar Credenciais -> ID do Cliente OAuth")
        print(" 5. Escolha tipo 'Aplicativo para Computador' (Desktop)")
        print(" 6. Baixe o JSON e renomeie para 'credentials.json'")
        print(" 7. Coloque o 'credentials.json' na mesma pasta deste script.")
        return

    print("\n[+] Arquivo credentials.json encontrado. Iniciando servidor local...")
    
    try:
        # Inicia o fluxo OAuth. Vai abrir uma janela no navegador.
        flow = InstalledAppFlow.from_client_secrets_file(cred_file, SCOPES)
        creds = flow.run_local_server(port=0)

        # Salva o token gerado em um arquivo json chamado token.json
        token_data = json.loads(creds.to_json())
        
        with open("token.json", "w", encoding="utf-8") as f:
            json.dump(token_data, f, indent=4)
            
        print("\n[SUCESSO] Autenticação concluída!")
        print("-" * 60)
        print("O arquivo 'token.json' foi gerado no seu diretório com sucesso!")
        print("Agora basta ABRI-LO, copiar todo o seu conteúdo e colar lá no painel (aba 'Colar Token.json').")
        print("="*60)
        
    except Exception as e:
        print(f"\n[FALHA] Ocorreu um erro durante a autenticação:")
        print(e)

if __name__ == "__main__":
    main()
