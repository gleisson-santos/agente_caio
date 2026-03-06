# Prompt de Auditoria e Limpeza de Projeto

## Contexto
Este projeto possui dezenas de pastas, logs e arquivos de teste (como `teste.py`) que foram gerados durante o desenvolvimento. O objetivo é realizar uma varredura completa para identificar o que é essencial e o que deve ser descartado para reduzir o peso do projeto e prepará-lo para um repositório Git seguro.

## Objetivos
Atue como um Engenheiro de DevOps e Segurança Sênior para analisar a estrutura do projeto e propor um **Plano de Ação de Limpeza e Segurança**.

## Instruções de Análise

### 1. Identificação de Arquivos Desnecessários
Analise toda a estrutura de pastas e identifique:
- **Logs e Temporários:** Arquivos `.log`, pastas de cache, e arquivos temporários gerados durante a execução.
- **Scripts de Teste Obsoletos:** Arquivos como `teste.py`, `test_old.py` ou qualquer script usado apenas para validações rápidas que não fazem parte do core do sistema.
- **Dados de Análise:** Arquivos de dados ou saídas que foram usados apenas para analisar logs e testes.

### 2. Auditoria de Segurança e Git
- **Análise do `.gitignore`:** Verifique se o arquivo está configurado corretamente para o padrão do projeto.
- **Vazamento de Credenciais:** Procure por chaves de API, senhas, tokens ou segredos hardcoded em arquivos de configuração ou scripts. Garanta que nada disso suba para o Git.
- **Configurações Locais:** Identifique arquivos de ambiente (como `.env`) que devem ser ignorados.

### 3. Arquivos Duplicados e Redundantes
- Localize arquivos duplicados (mesmo conteúdo ou nomes muito similares em pastas diferentes).
- Verifique se há redundância de bibliotecas ou assets.

### 4. Análise de Skills e Agentes
- Verifique as **Skills** e **Agentes** presentes no projeto.
- Analise se cada skill/agente está sendo realmente importado e utilizado no fluxo principal do código.
- Identifique o que está apenas "pesando" no tamanho do projeto sem utilidade prática.

## Formato de Saída (Plano de Ação)
**IMPORTANTE:** Não delete nada ainda. Apresente primeiro uma lista detalhada do que você acha que não é necessário no seguinte formato:

### 1. Lista de Exclusão Proposta
| Caminho do Arquivo/Pasta | Motivo da Remoção | Impacto/Risco |
| :--- | :--- | :--- |
| `exemplo/caminho/teste.py` | Arquivo de teste temporário | Baixo |
| `logs/debug.log` | Log de execução antigo | Nenhum |

### 2. Recomendações de Segurança (.gitignore)
- Liste o que precisa ser adicionado ou corrigido no `.gitignore`.
- Aponte arquivos que contêm dados sensíveis.

### 3. Relatório de Skills/Agentes Não Utilizados
- Liste as skills ou agentes que podem ser removidos por falta de uso.

---
**Aguarde minha aprovação explícita antes de realizar qualquer alteração destrutiva ou deleção.**
