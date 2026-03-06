# Prompt de Auditoria de Inteligência e Memória do Agente

## Contexto
Este projeto contém um Agente de IA em funcionamento. É crucial documentar suas funcionalidades, otimizar sua inteligência e garantir uma organização clara do projeto. O objetivo é que você atue como um especialista em arquitetura de IA e engenharia de prompts.

## Objetivos
Seu objetivo é analisar o projeto do Agente, documentar sua memória e estrutura, e propor melhorias para sua inteligência e organização, sem alterar suas funcionalidades existentes.

## Instruções de Análise

### 1. Análise de Funcionalidades do Agente
- **Mapeamento de Funcionalidades:** Detalhe todas as funcionalidades que o Agente é capaz de executar. Para cada funcionalidade, descreva seu propósito, como é acionada e quais são suas saídas esperadas.
- **Fluxos de Trabalho:** Descreva os principais fluxos de trabalho (workflows) que o Agente executa, identificando os componentes envolvidos.

### 2. Criação/Atualização de `MEMORY.md`
- **Documentação da Memória:** Crie ou atualize o arquivo `MEMORY.md` na raiz do projeto. Este arquivo deve detalhar:
    - **Estrutura de Dados:** Como o Agente armazena e acessa informações (ex: banco de dados, arquivos, cache).
    - **Tipos de Memória:** Se há memória de curto prazo (contexto da conversa) e de longo prazo (conhecimento persistente).
    - **Processos de Aprendizagem:** Como o Agente aprende ou adapta seu comportamento (se aplicável).
- **Organização do Projeto:** Descreva a organização de pastas e arquivos do projeto, explicando a finalidade de cada diretório principal, garantindo que a estrutura seja clara e intuitiva, sem propor alterações que afetem a funcionalidade.

### 3. Otimização de Prompts e Inteligência
- **Análise de Prompts:** Examine todos os prompts que compõem a inteligência do Agente (prompts de sistema, prompts de ferramentas, prompts de usuário padrão, etc.).
- **Sugestões de Otimização:** Proponha melhorias para tornar os prompts mais:
    - **Claros e Concisos:** Reduzir ambiguidades e redundâncias.
    - **Eficazes:** Aumentar a precisão e relevância das respostas/ações do Agente.
    - **Avançados:** Incorporar técnicas de engenharia de prompt para maior produtividade e capacidade (ex: few-shot learning, chain-of-thought, persona definition).
- **Identificação de Gaps:** Aponte áreas onde a inteligência do Agente pode ser expandida ou aprimorada através de novos prompts ou ajustes nos existentes.

## Formato de Saída

### 1. `MEMORY.md` (Conteúdo Completo)
```markdown
# MEMORY.md

## Visão Geral da Memória
[Descrição geral de como o Agente gerencia e utiliza a memória]

## Estrutura de Dados e Armazenamento
- [Detalhes sobre bancos de dados, arquivos, etc.]

## Tipos de Memória
- **Curto Prazo:** [Como o contexto é mantido]
- **Longo Prazo:** [Como o conhecimento persistente é armazenado]

## Processos de Aprendizagem/Adaptação
[Se aplicável, como o Agente aprende]

## Organização do Projeto
- `/src`: [Descrição]
- `/config`: [Descrição]
- `/prompts`: [Descrição]
- [Outras pastas relevantes]
```

### 2. Relatório de Otimização de Prompts

#### Prompts Atuais e Análise
- **Prompt 1:** `[Conteúdo do Prompt]`
    - **Análise:** [Pontos fortes, fracos, oportunidades de melhoria]
- **Prompt 2:** `[Conteúdo do Prompt]`
    - **Análise:** [Pontos fortes, fracos, oportunidades de melhoria]

#### Sugestões de Melhoria
- **Geral:** [Recomendações abrangentes]
- **Específicas:** [Sugestões para prompts individuais]

### 3. Mapeamento de Funcionalidades e Workflows

#### Funcionalidades do Agente
- **Funcionalidade A:** [Descrição, Acionamento, Saídas]
- **Funcionalidade B:** [Descrição, Acionamento, Saídas]

#### Principais Workflows
- **Workflow 1:** [Passos, Componentes Envolvidos]
- **Workflow 2:** [Passos, Componentes Envolvidos]

---
**Aguarde minha aprovação antes de aplicar quaisquer alterações no projeto ou nos prompts.**
