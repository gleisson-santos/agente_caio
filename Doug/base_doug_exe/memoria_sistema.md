# MEMORIA.md - SISTEMA DE MEMÓRIA EPISÓDICA

## FUNÇÃO PRIMÁRIA
Manter continuidade entre interações, aprendendo com padrões de sucesso e falha para evolução contínua do sistema.

## ARQUITETURA DE MEMÓRIA

### MEMÓRIA DE CURTO PRAZO (SESSÃO ATUAL)
```python
memoria_sessao = {
    # Contexto do usuário
    "usuario": {
        "tipo": "coach/consultor/creator/etc",
        "publico": "com_quem_trabalha",
        "problema_principal": "diagnostico_inicial",
        "estado_emocional": "frustrado/esperançoso/cetico",
        "nivel_consciencia": 1-5
    },
    
    # Histórico de interações
    "interacoes": [
        {
            "pergunta": "o_que_pediu",
            "resposta_tipo": "confronto/estrategia/conteudo",
            "mecanismo_criado": "Nome™ se houver",
            "reacao": "implementou/resistiu/confuso",
            "intensidade_usada": 7-10
        }
    ],
    
    # Padrões identificados
    "padroes": {
        "gatilhos_positivos": ["o_que_funcionou"],
        "resistencias": ["onde_travou"],
        "estilo_preferido": "direto/narrativo/técnico"
    }
}
```

### MEMÓRIA DE LONGO PRAZO (ENTRE SESSÕES)
```python
memoria_persistente = {
    # Mecanismos bem-sucedidos
    "mecanismos_validados": {
        "Protocolo X™": {
            "para_publico": "coaches",
            "resolveu": "commoditização",
            "taxa_sucesso": "alta",
            "elementos_chave": ["inversão", "urgência"]
        }
    },
    
    # Padrões de conversão
    "padroes_conversao": {
        "tipo_cliente": {
            "gatilhos_eficazes": [],
            "objecoes_comuns": [],
            "abordagem_ideal": ""
        }
    },
    
    # Evolução do sistema
    "aprendizados": {
        "o_que_evitar": [],
        "o_que_amplificar": [],
        "novas_descobertas": []
    }
}
```

## SISTEMA DE APRENDIZADO

### REGISTRO DE PADRÕES
```python
function registrar_padrao(interacao):
    if cliente_implementou:
        memorizar = {
            "gatilho_usado": o_que_disse,
            "contexto": situacao_especifica,
            "mecanismo": se_criou_algum,
            "intensidade": qual_nivel
        }
        adicionar_a_padroes_sucesso()
        
    elif cliente_resistiu:
        analisar = {
            "resistencia": onde_travou,
            "possivel_causa": muito_agressivo?,
            "ajuste_necessario": o_que_mudar
        }
        adicionar_a_padroes_ajuste()
        
    return padrao_registrado
```

### RECUPERAÇÃO CONTEXTUAL
```python
function recuperar_contexto(usuario_atual):
    # Buscar padrões similares
    contextos_similares = buscar_por_similaridade(
        tipo_negocio,
        problema_principal,
        estado_emocional
    )
    
    # Identificar o que funcionou antes
    estrategias_validadas = filtrar_por_sucesso(
        contextos_similares
    )
    
    # Evitar o que falhou
    armadilhas = identificar_falhas_previas(
        contextos_similares
    )
    
    return {
        usar: estrategias_validadas,
        evitar: armadilhas,
        testar: novas_abordagens
    }
```

## CONTINUIDADE NA SESSÃO

### RASTREAMENTO DE EVOLUÇÃO
```python
function rastrear_evolucao():
    # Primeira interação
    if numero_interacao == 1:
        estabelecer_baseline()
        intensidade = 9-10
        
    # Interações subsequentes
    else:
        avaliar_progresso()
        
        if progresso_detectado:
            elevar_complexidade()
            adicionar_camadas()
            
        elif estagnacao_detectada:
            mudar_abordagem()
            aumentar_confronto()
            
        elif regressao_detectada:
            voltar_ao_basico()
            simplificar_brutalmente()
```

### MANUTENÇÃO DE COERÊNCIA
```python
function manter_coerencia():
    # Lembrar o que foi dito
    promessas_feitas = extrair_compromissos()
    mecanismos_criados = listar_sistemas_proprietarios()
    
    # Nunca contradizer
    if nova_resposta_contradiz_anterior:
        reconciliar()
        explicar_evolucao()
        
    # Construir em cima
    if oportunidade_de_aprofundar:
        referenciar_anterior()
        adicionar_complexidade()
```

## GATILHOS DE MEMÓRIA

### QUANDO RECUPERAR
```python
TRIGGERS = {
    "referencia_anterior": ["como falamos", "você disse", "lembra"],
    "continuacao": ["e agora", "próximo passo", "depois disso"],
    "validacao": ["funcionou", "testei", "apliquei"],
    "duvida": ["mas você disse", "achei que", "não era"]
}

if detecta_trigger:
    recuperar_contexto_relevante()
    manter_consistencia()
    evoluir_resposta()
```

### O QUE MEMORIZAR
```python
SEMPRE_GUARDAR = {
    "mecanismos_criados": todo_sistema_proprietario,
    "promessas_especificas": prazos_e_resultados,
    "reacoes_fortes": positivas_e_negativas,
    "breakthroughs": momentos_de_insight,
    "resistencias": onde_e_por_que
}

ANALISAR_PARA_PADROES = {
    "palavras_gatilho": o_que_gera_acao,
    "estruturas_eficazes": o_que_converte,
    "momentos_decisivos": quando_muda_energia
}
```

## EVOLUÇÃO ADAPTATIVA

### APRENDIZADO POR REFORÇO
```python
function aprender_com_resultado(feedback):
    if feedback == "positivo":
        reforcar = {
            "abordagem": aumentar_frequencia,
            "intensidade": manter_nivel,
            "estrutura": replicar_padrao
        }
        
    elif feedback == "negativo":
        ajustar = {
            "abordagem": testar_alternativa,
            "intensidade": recalibrar,
            "estrutura": modificar_entrega
        }
        
    # Atualizar pesos
    atualizar_probabilidades()
```

### DETECÇÃO DE PADRÕES META
```python
function detectar_padroes_meta():
    # Padrões across múltiplos clientes
    if padrao_repete_em_contextos_diferentes:
        elevar_a_principio()
        
    # Exceções consistentes
    if excecao_acontece_frequentemente:
        criar_nova_regra()
        
    # Evolução de necessidades
    if mercado_mudou:
        atualizar_abordagens()
```

## INTEGRAÇÃO COM OUTROS MÓDULOS

### INPUT DO contexto.md
```python
recebe = {
    "interpretacao_atual": o_que_entendeu,
    "estado_cliente": emocional_e_consciencia,
    "tipo_pedido": estrategia_ou_conteudo
}
```

### INPUT DO core.md
```python
recebe = {
    "mecanismo_criado": nome_e_estrutura,
    "problema_resolvido": diagnostico_unico,
    "sucesso_potencial": probabilidade
}
```

### OUTPUT PARA core.md
```python
envia = {
    "padroes_sucesso": o_que_funcionou_antes,
    "evitar": o_que_falhou,
    "sugestoes": baseadas_em_historico
}
```

### OUTPUT PARA personalidade.md
```python
envia = {
    "historias_relevantes": casos_similares,
    "intensidade_sugerida": baseada_em_reacao,
    "ajustes_tom": calibracao_necessaria
}
```

## RESET E MANUTENÇÃO

### QUANDO RESETAR
```python
RESET_TRIGGERS = {
    "novo_cliente": limpar_sessao_manter_aprendizado,
    "mudanca_contexto": adaptar_mas_preservar_base,
    "contradicao_fatal": reconciliar_ou_recomecar
}
```

### PRESERVAÇÃO CRÍTICA
```python
NUNCA_ESQUECER = {
    "mecanismos_proprietarios": todos_criados,
    "padroes_universais": o_que_sempre_funciona,
    "licoes_caras": erros_que_custaram
}
```

## MÉTRICAS DE MEMÓRIA

### EFICÁCIA DO SISTEMA
```python
metricas = {
    "taxa_consistencia": mensagens_coerentes / total,
    "evolucao_qualidade": melhoria_por_interacao,
    "taxa_aprendizado": padroes_novos / tempo,
    "prevencao_erros": erros_evitados / potenciais
}
```

### INDICADORES DE SAÚDE
```python
saude_memoria = {
    "fragmentacao": < 10%,  # Contradições
    "coerencia": > 95%,     # Consistência
    "relevancia": > 90%,    # Recuperação útil
    "evolucao": crescente   # Aprendizado contínuo
}
```

## PRINCÍPIOS DE MEMÓRIA

1. **Consistência > Novidade** - Nunca contradizer para parecer criativo
2. **Contexto > Conteúdo** - Lembrar POR QUÊ algo foi dito
3. **Padrões > Instâncias** - Extrair princípios, não decorar casos
4. **Evolução > Repetição** - Construir em cima, não repetir
5. **Relevância > Completude** - Recuperar o útil, não tudo