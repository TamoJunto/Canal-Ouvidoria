# Documentação de Funcionalidades - Sistema de Ouvidoria
## Grupo Aliança Empreendedora

---

## 📋 ÍNDICE
1. [Página Inicial (Home)](#1-página-inicial-home)
2. [Fluxo de Criação de Relato](#2-fluxo-de-criação-de-relato)
3. [Acompanhamento de Relato](#3-acompanhamento-de-relato)
4. [Área Administrativa - Admin Master](#4-área-administrativa---admin-master)
5. [Área Operacional - Operador](#5-área-operacional---operador)
6. [Navegação e Informações Gerais](#6-navegação-e-informações-gerais)

---

## 1. PÁGINA INICIAL (HOME)

**Rota:** `/`

### Funcionalidades:
- **Botão "FAÇA SEU RELATO"**: Ao clicar, o usuário é direcionado para a página de criação de relato (`/faca-seu-relato`)
- **Botão "ACOMPANHE SEU RELATO"**: Ao clicar, o usuário é direcionado para a página de acompanhamento (`/acompanhe-seu-relato`)
- **Menu de Navegação**: 
  - Link "INÍCIO" - retorna para a página inicial
  - Link "DÚVIDAS FREQUENTES" - direciona para página informativa
  - Link "CÓDIGO DE ÉTICA" - direciona para página informativa
  - Link "REGRAS" - direciona para página informativa
- **Botão "LOGIN ADMIN"**: Abre um modal de login para acesso administrativo

### Fluxo de Login:
- Ao clicar em "LOGIN ADMIN", abre um modal com campo de email
- O sistema verifica se o email contém "admin" ou termina com "@admin.com"
  - **Se SIM**: Redireciona para `/admin` (área do Admin Master)
  - **Se NÃO**: Redireciona para `/operador` (área do Operador)

---

## 2. FLUXO DE CRIAÇÃO DE RELATO

### 2.1. Página de Criação de Relato
**Rota:** `/faca-seu-relato`

#### Campos e Funcionalidades:

**1. Identificação:**
- Opção "Sim" ou "Não" para se identificar
- **Se escolher "Sim"**: Aparecem campos para:
  - Nome Completo (obrigatório)
  - E-mail (obrigatório)
  - Celular com máscara (obrigatório)
- **Se escolher "Não"**: 
  - Exibe mensagem explicativa sobre anonimato
  - Campo opcional de e-mail para receber notificações

**2. Relação com a Aliança Empreendedora:**
- Select com opções: Equipe, Empreendedor, Organização parceira, Fornecedor, Voluntário, Outros, Não quero informar
- Se escolher "Outros", aparece campo de texto para especificar

**3. Tipo de Relato:**
- Select com categorias:
  - Comportamento inadequado
  - Assédio moral e/ou abuso de poder
  - Conflito de interesses
  - Corrupção
  - Assédio sexual
  - Preconceito e discriminação
  - Outros
- Ao selecionar, aparece descrição explicativa da categoria
- Se escolher "Outros", aparece campo de texto para especificar

**4. Descrição do Relato:**
- Textarea para descrever a denúncia (obrigatório)

**5. Pessoas Envolvidas:**
- Textarea para descrever pessoas e/ou empresas envolvidas (obrigatório)

**6. Evidências:**
- Opção "Sim" ou "Não" para possuir evidências
- **Se escolher "Sim"**: Após enviar o formulário, redireciona para página de anexos
- **Se escolher "Não"**: Após enviar o formulário, redireciona direto para página de sucesso

**7. Conhecimento dos Fatos:**
- Textarea opcional para informar quem mais tem conhecimento dos fatos

**8. Termo LGPD:**
- Texto explicativo sobre proteção de dados
- Link clicável para abrir modal com política completa de proteção de dados
- Checkbox obrigatório "LGPD" para aceitar os termos

**9. Botão "Prosseguir":**
- Valida todos os campos obrigatórios
- Redireciona conforme escolha de evidências:
  - Com evidências → `/faca-seu-relato/anexos`
  - Sem evidências → `/faca-seu-relato/relatofeito`

---

### 2.2. Página de Anexos (Opcional)
**Rota:** `/faca-seu-relato/anexos`

#### Funcionalidades:
- Área de upload de arquivos (drag and drop ou clique para selecionar)
- Lista de arquivos anexados com opção de remover cada um
- Botão "Finalizar" que redireciona para página de sucesso (`/faca-seu-relato/relatofeito`)

---

### 2.3. Página de Sucesso
**Rota:** `/faca-seu-relato/relatofeito`

#### Funcionalidades:
- Exibe mensagem de sucesso: "Sua reclamação foi realizada com sucesso!"
- Mostra o **Protocolo** gerado (exemplo: "ZXA-S0R")
- Botão de copiar protocolo para área de transferência
- **Alerta Especial**: Se o usuário escolheu não se identificar, aparece um alerta amarelo dentro do quadro principal informando que:
  - Não será possível reenviar o código por e-mail ou telefone
  - É fundamental guardar o código para acompanhamento
- Botão "FINALIZAR" que retorna para a página inicial (`/`)

---

## 3. ACOMPANHAMENTO DE RELATO

**Rota:** `/acompanhe-seu-relato`

### Funcionalidades:

**1. Busca por Protocolo:**
- Campo de texto para digitar o protocolo
- Botão de busca (ícone de lupa) ou botão X para limpar
- Ao buscar, o sistema verifica se o protocolo existe

**2. Exibição de Resultados:**

**Se o protocolo for encontrado:**

- **Informações do Relato:**
  - Protocolo
  - Data de envio
  - Status (Em análise ou Respondido)
  - Descrição completa do relato

- **Status "Em Análise" (Pendente):**
  - Ícone de relógio amarelo
  - Mensagem informando que o relato está em análise
  - Informação de que o usuário será notificado quando houver resposta

- **Status "Respondido":**
  - Ícone de check verde
  - Data da resposta
  - Resposta completa da empresa em destaque

- **Botão "Enviar Mensagem":**
  - Disponível para ambos os status
  - Ao clicar, abre um modal/dialog
  - No modal:
    - Textarea para digitar mensagem
    - Mensagem explicativa: "Sua mensagem será analisada pela nossa equipe"
    - Botão "Cancelar" para fechar
    - Botão "Enviar Mensagem" (desabilitado se campo vazio)
    - Ao enviar, mostra confirmação de sucesso

**Se o protocolo não for encontrado:**
- Mensagem: "Protocolo não encontrado"
- Orientação para verificar se o protocolo está correto

---

## 4. ÁREA ADMINISTRATIVA - ADMIN MASTER

**Rota:** `/admin`

### 4.1. Home do Admin
**Rota:** `/admin`

#### Opções Disponíveis:
- **Botão "Relatos"**: Direciona para `/admin/relatos`
- **Botão "Usuarios"**: Direciona para `/admin/usuarios`
- **Botão "Comites"**: Direciona para `/admin/comites`
- **Botão "Dashboard"**: Direciona para `/admin/dashboard`

---

### 4.2. Gestão de Relatos
**Rota:** `/admin/relatos`

#### Funcionalidades:

**1. Filtros:**
- Filtro por Status: Nova, Em Andamento, Finalizado
- Filtro por Comitê: Dropdown com lista de comitês

**2. Lista de Relatos:**
- Cards exibindo informações resumidas de cada relato
- Categoria, data, status
- Ao clicar em um relato, abre painel lateral com detalhes completos

**3. Painel de Detalhes do Relato:**

**Para Relatos "Nova":**
- Botão "Transferir" - abre dialog para transferir para um comitê
- Botão "Iniciar Tratamento" - muda status para "Em Andamento"

**Para Relatos "Em Andamento":**
- Botão "Adicionar Comentário" - abre dialog para adicionar comentário sobre o tratamento
- Botão "Transferir" - abre dialog para transferir para outro comitê
- Botão "Responder" - abre dialog para escrever resposta final
- **Seção de Comentários**: Exibe todos os comentários adicionados durante o tratamento, com autor e data

**Para Relatos "Finalizado":**
- Botão "Reabrir Caso" - abre dialog de confirmação para reabrir o caso
- **Seção de Resposta Final**: Exibe a resposta final enviada ao denunciante
- **Seção de Comentários**: Exibe histórico completo de comentários

**4. Funcionalidades de Comentários:**
- Dialog para adicionar comentário
- Campo de texto para escrever comentário
- Salva comentário com autor (Admin) e data
- Comentários são exibidos em cards com borda colorida

---

### 4.3. Gestão de Usuários
**Rota:** `/admin/usuarios`

#### Funcionalidades:

**1. Filtros e Busca:**
- Campo de busca por nome
- Filtro por Comitê (dropdown)

**2. Lista de Usuários:**
- Cards com informações: Nome, Comitê, Status (Ativo/Inativo)
- **Ao clicar em um usuário**: Abre dialog de edição

**3. Dialog de Edição:**
- Campo "Nome" - editável
- Campo "Email (Login)" - editável
- Select "Comitê" - dropdown com opções de comitês
- Switch "Status" - alterna entre Ativo/Inativo
- Botão "Salvar Alterações" - atualiza os dados
- Botão "Cancelar" - fecha sem salvar

**4. Botão "Cadastrar Usuario":**
- Abre dialog de cadastro
- Campos: Nome, Email
- Radio buttons: Associado ou Administrador
- Botão "Cadastrar" e "Cancelar"

---

### 4.4. Gestão de Comitês
**Rota:** `/admin/comites`

#### Funcionalidades:

**1. Filtros e Busca:**
- Campo de busca
- Filtro por Equipe (dropdown)

**2. Lista de Comitês:**
- Cards com informações: Nome do Comitê, Quantidade de Integrantes, Status (Ativo/Inativo)
- **Ao clicar em um comitê**: Abre dialog de edição

**3. Dialog de Edição:**
- Campo "Nome do Comitê" - editável
- **Seleção de Participantes**: 
  - Lista de usuários ativos com checkboxes
  - Cada usuário mostra: Nome e Email
  - Contador mostra quantos integrantes estão selecionados
  - Checkboxes permitem adicionar/remover participantes
- Switch "Status" - alterna entre Ativo/Inativo
- Botão "Salvar Alterações" - atualiza os dados
- Botão "Cancelar" - fecha sem salvar

**4. Botão "Cadastrar Comitê":**
- Abre dialog de cadastro
- Campo: Nome do Comitê
- Lista de usuários ativos com checkboxes para selecionar participantes
- Botão "Cadastrar" e "Cancelar"

---

### 4.5. Dashboard Administrativo
**Rota:** `/admin/dashboard`

#### Funcionalidades:
- Gráficos e estatísticas sobre relatos
- Métricas gerais do sistema
- Visualizações de dados (implementação específica conforme design)

---

## 5. ÁREA OPERACIONAL - OPERADOR

**Rota:** `/operador`

### 5.1. Home do Operador
**Rota:** `/operador`

#### Opções Disponíveis:
- **Botão "Relatos"**: Direciona para `/operador/relatos`
- **Botão "Dashboard"**: Direciona para `/operador/dashboard`

**Observação:** Operadores não têm acesso a gestão de usuários e comitês.

---

### 5.2. Gestão de Relatos (Operador)
**Rota:** `/operador/relatos`

#### Funcionalidades:

**Similar à área de relatos do Admin, mas com diferenças:**

**Para Relatos "Em Andamento":**
- Botão "Adicionar Comentário" - disponível
- **Botão "Transferir" - REMOVIDO** (operadores não podem transferir)
- Botão "Responder" - disponível

**Para Relatos "Finalizado":**
- Botão "Reabrir Caso" - disponível
- Seção de Resposta Final - disponível
- Seção de Comentários - disponível

**Observação:** Comentários adicionados por operadores aparecem com autor "Operador".

---

### 5.3. Dashboard do Operador
**Rota:** `/operador/dashboard`

#### Funcionalidades:
- Gráficos e estatísticas sobre relatos
- Métricas específicas para operadores
- Visualizações de dados (implementação específica conforme design)

---

## 6. NAVEGAÇÃO E INFORMAÇÕES GERAIS

### 6.1. Páginas Informativas
- **Dúvidas Frequentes** (`/duvidas-frequentes`): Página com perguntas e respostas frequentes
- **Código de Ética** (`/codigo-de-etica`): Página com informações sobre código de ética
- **Regras** (`/regras`): Página com regras e regulamentos

### 6.2. Header Administrativo
- Presente em todas as páginas administrativas (`/admin/*` e `/operador/*`)
- Contém logo e opções de navegação específicas para área administrativa

### 6.3. Fluxo de Navegação Resumido

```
Página Inicial (/)
├── FAÇA SEU RELATO
│   ├── Formulário de Relato (/faca-seu-relato)
│   ├── Anexos (se houver evidências) (/faca-seu-relato/anexos)
│   └── Sucesso com Protocolo (/faca-seu-relato/relatofeito)
│
├── ACOMPANHE SEU RELATO
│   └── Busca e Visualização (/acompanhe-seu-relato)
│
└── LOGIN ADMIN
    ├── Admin Master (/admin)
    │   ├── Relatos (/admin/relatos)
    │   ├── Usuários (/admin/usuarios)
    │   ├── Comitês (/admin/comites)
    │   └── Dashboard (/admin/dashboard)
    │
    └── Operador (/operador)
        ├── Relatos (/operador/relatos)
        └── Dashboard (/operador/dashboard)
```

---

## 🔐 DIFERENÇAS ENTRE ADMIN MASTER E OPERADOR

### Admin Master:
- ✅ Acesso completo a todas as funcionalidades
- ✅ Pode gerenciar usuários (criar, editar, ativar/desativar)
- ✅ Pode gerenciar comitês (criar, editar, adicionar participantes)
- ✅ Pode transferir relatos entre comitês
- ✅ Pode adicionar comentários, responder e reabrir casos
- ✅ Acesso ao dashboard administrativo completo

### Operador:
- ✅ Pode visualizar e gerenciar relatos
- ✅ Pode adicionar comentários
- ✅ Pode responder relatos
- ✅ Pode reabrir casos finalizados
- ❌ **NÃO pode** transferir relatos
- ❌ **NÃO tem acesso** a gestão de usuários
- ❌ **NÃO tem acesso** a gestão de comitês
- ✅ Acesso ao dashboard operacional

---

## 📝 OBSERVAÇÕES IMPORTANTES

1. **Sistema de Protocolo**: Cada relato recebe um protocolo único que deve ser guardado pelo denunciante, especialmente em casos anônimos.

2. **Anonimato**: O sistema permite relatos totalmente anônimos ou parcialmente anônimos (apenas com email para notificações).

3. **Status dos Relatos**: 
   - **Nova**: Relato recém-criado, aguardando início de tratamento
   - **Em Andamento**: Relato sendo tratado por um comitê
   - **Finalizado**: Relato com resposta enviada ao denunciante

4. **Comentários**: Permitem que a equipe interna acompanhe o progresso do tratamento de cada relato.

5. **Reabertura de Casos**: Casos finalizados podem ser reabertos se necessário.

6. **LGPD**: O sistema está em conformidade com a LGPD, com termos claros sobre uso de dados pessoais.

---

**Documento gerado para apresentação do projeto**
**Sistema de Ouvidoria - Grupo Aliança Empreendedora**

