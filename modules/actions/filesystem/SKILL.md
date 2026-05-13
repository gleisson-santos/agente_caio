---
name: filesystem
description: Comprehensive file manipulation including read, write, and surgical edits. Use when the agent needs to manage code, configurations, or logs within the workspace.
---

# 📁 FileSystem Action Module

Este módulo provê habilidades fundamentais de gestão de arquivos para o Caio v5.0.

## 🚀 Como Usar

### 1. Leitura de Arquivos
Sempre verifique a existência do arquivo antes de tentar processá-lo.
*Action:* `read_file(path="caminho/do/arquivo.md")`

### 2. Edição Cirúrgica
Ao editar arquivos, forneça contexto suficiente no `old_text` para garantir que a substituição ocorra no local correto. O sistema evita múltiplas ocorrências por segurança.
*Action:* `edit_file(path="...", old_text="contexto original", new_text="novo código")`

### 3. Escrita Segura
Arquivos novos são criados automaticamente, incluindo diretórios pais se necessário.

---
*Assinado: Caio Engine v5.0 — Action System*
