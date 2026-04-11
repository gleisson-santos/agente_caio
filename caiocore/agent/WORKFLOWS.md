# Guia de Workflows estruturados - Agente Caio

Os Workflows permitem que o Caio execute sequências lógicas de tarefas sem se perder no chat.

### Exemplo de Definição (JSON)

```json
{
  "name": "Analisador de Documentos",
  "steps": [
    {
      "name": "lista_arquivos",
      "action": "tool",
      "tool": "ls",
      "args": { "path": "downloads/" }
    },
    {
      "name": "leitura",
      "action": "tool",
      "tool": "read_file",
      "args": { "path": "downloads/dados.txt" }
    },
    {
      "name": "analise",
      "action": "llm",
      "prompt": "Resuma os dados lidos: {{leitura.output}}"
    },
    {
      "name": "notificar",
      "action": "notify",
      "channel": "telegram",
      "message": "Relatório pronto: {{analise.output}}"
    }
  ]
}
```

### Ações Disponíveis
*   `tool`: Chama qualquer ferramenta do sistema.
*   `llm`: Processa um prompt usando a inteligência do Caio (com memória isolada).
*   `notify`: Envia uma mensagem para um canal (whatsapp, telegram, etc).
*   `wait`: Pausa a execução por N segundos.

### Como usar?
Basta pedir ao Caio: *"Caio, execute um workflow chamado 'Limpeza' que primeiro liste os arquivos temporários e depois apague os que terminam em .tmp"*
Ele usará a ferramenta `workflow` para montar e rodar a sequência.
