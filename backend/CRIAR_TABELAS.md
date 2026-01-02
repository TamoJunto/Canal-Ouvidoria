# 🗄️ Como Criar as Tabelas do Banco de Dados

## ❌ Problema Atual

```
Erro: relação "usuarios" não existe
```

Isso significa que o banco `canal_ouvidoria` existe, mas as tabelas ainda não foram criadas.

## ✅ Solução: 3 Formas de Executar o Script

### **Forma 1: Via pgAdmin (MAIS FÁCIL)** ⭐

1. **Abra o pgAdmin**
2. **Conecte ao servidor PostgreSQL local**
3. **Selecione o banco `canal_ouvidoria`**
4. **Clique em Tools > Query Tool** (ou pressione F5)
5. **Abra o arquivo `init.sql`**: 
   - Clique no ícone de pasta 📂
   - Navegue até: `backend/init.sql`
6. **Execute**: Clique no botão ▶️ (ou F5)
7. **Aguarde**: Você verá "Query returned successfully"

✅ Pronto! As tabelas foram criadas.

---

### **Forma 2: Via Docker (se você criou o container)**

```powershell
# 1. Copiar o arquivo SQL para dentro do container
docker cp backend/init.sql canal-postgres:/init.sql

# 2. Executar o script
docker exec -it canal-postgres psql -U postgres -d canal_ouvidoria -f /init.sql
```

---

### **Forma 3: Via Script Node.js**

1. **Configure a senha correta no arquivo `.env`**:
   ```env
   DB_PASSWORD=SUA_SENHA_AQUI
   ```

2. **Execute o script**:
   ```powershell
   cd backend
   node run-init.js
   ```

Se aparecer erro de autenticação, verifique a senha no `.env`!

---

## 🔍 Como Saber a Senha do PostgreSQL

### Se você instalou localmente:
- A senha foi definida durante a instalação
- Geralmente é: `postgres` ou `admin`

### Se você está usando Docker:
- A senha é `postgres` (configurada no docker-compose.yml)

### Resetar senha (se esqueceu):

**Via pgAdmin:**
1. Conecte como superuser
2. Clique com botão direito em `postgres` (em Login/Group Roles)
3. Properties > Definition > Password
4. Digite a nova senha

**Via psql:**
```sql
ALTER USER postgres WITH PASSWORD 'nova_senha';
```

---

## ✅ Como Verificar se Funcionou

Depois de executar o `init.sql`, verifique:

### Via pgAdmin:
1. Expanda `canal_ouvidoria` > Schemas > public > Tables
2. Você deve ver 11 tabelas:
   - usuarios
   - comites
   - relatos
   - anexos
   - mensagens_publicas
   - comentarios
   - relato_eventos
   - magic_link_tokens
   - refresh_tokens
   - audit_log

### Via Query:
```sql
-- Ver todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Ver usuário admin criado
SELECT * FROM usuarios;

-- Ver comitês criados
SELECT * FROM comites;
```

---

## 🎯 Resultado Esperado

Após executar o `init.sql`, você terá:

✅ **11 tabelas criadas**
✅ **1 usuário admin**: `admin@ouvidoria.com`
✅ **3 comitês padrão**:
   - Comitê Executivo
   - Comitê Jurídico
   - Comitê de Diversidade

---

## 🚀 Próximo Passo

Depois de criar as tabelas:

1. **Reinicie o backend**:
   ```powershell
   cd backend
   npm run dev
   ```

2. **Acesse o frontend**: http://localhost:3002

3. **Faça login com**:
   - Email: `admin@ouvidoria.com`
   - O sistema gerará um magic link (veja no console do backend)

---

## 🐛 Problemas Comuns

### Erro: "type already exists"
Significa que você já executou o script antes. Tudo certo! ✅

### Erro: "relation already exists"
Significa que as tabelas já foram criadas. Tudo certo! ✅

### Erro: "authentication failed"
Verifique a senha do PostgreSQL no arquivo `.env`

### Quer recriar tudo do zero?
```sql
-- CUIDADO: Isso apaga tudo!
DROP DATABASE canal_ouvidoria;
CREATE DATABASE canal_ouvidoria;
-- Depois execute o init.sql novamente
```

---

## 💡 Dica Importante

**SEMPRE** use o pgAdmin para tarefas de banco de dados no Windows. É muito mais fácil e visual do que tentar usar comandos no terminal.

---

**Dúvidas?** Siga a **Forma 1** (pgAdmin) que é a mais simples! 🎯
