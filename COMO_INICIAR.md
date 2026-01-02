# 🚀 Como Iniciar o Sistema - Guia Definitivo

## ⚡ Início Rápido (Copy & Paste)

### **Terminal 1 - Backend**

```powershell
# 1. Entrar na pasta do backend
cd backend

# 2. Instalar dependências (só na primeira vez)
npm install

# 3. Criar arquivo .env (só na primeira vez)
Copy-Item env.example .env

# 4. Iniciar PostgreSQL e Redis com Docker (só na primeira vez)
docker-compose up -d postgres redis

# Aguardar 10 segundos para os bancos iniciarem
Start-Sleep -Seconds 10

# 5. Iniciar o backend
npm run dev
```

**Aguarde ver:** `🚀 API rodando em http://localhost:3001`

---

### **Terminal 2 - Frontend**

```powershell
# 1. Voltar para a raiz (se estiver em backend/)
cd ..

# 2. Criar .env.local (só na primeira vez)
Copy-Item env.local.example .env.local

# 3. Instalar axios (só na primeira vez)
npm install axios

# 4. Iniciar o frontend
npm run dev
```

**Aguarde ver:** `Local: http://localhost:5173`

---

## 🔐 Como Fazer Login

### **1. Acessar página de login**
Abra no navegador: http://localhost:5173/login

### **2. Digitar email**
Digite: `admin@ouvidoria.com`

Clique em **"Enviar Link de Acesso"**

### **3. Pegar o link nos logs do backend**

No terminal do backend, você verá:
```
Magic link gerado (implementar envio de email)
{
  email: 'admin@ouvidoria.com',
  magicLink: 'http://localhost:5173/auth/verify?token=abc123...'
}
```

**Copie apenas a URL completa** que começa com `http://localhost:5173/auth/verify?token=`

### **4. Colar no navegador**

Cole o link completo no navegador e pressione Enter.

### **5. ✅ Pronto!**

Você será automaticamente:
- ✅ Autenticado
- ✅ Redirecionado para `/admin`
- ✅ Logado como Admin Master

---

## 🛑 Troubleshooting

### ❌ "npm não encontrado"
**Solução:** Instale Node.js: https://nodejs.org/ (versão 18+)

### ❌ "docker não encontrado" 
**Opção 1:** Instale Docker Desktop: https://www.docker.com/products/docker-desktop/

**Opção 2:** Use PostgreSQL e Redis locais:
- PostgreSQL: https://www.postgresql.org/download/windows/
- Redis: https://github.com/microsoftarchive/redis/releases

Depois ajuste o `.env` do backend com as credenciais locais.

### ❌ "Porta 3001 já em uso"
**Solução:** Mude a porta no `backend/.env`:
```env
PORT=3002
```

E no `env.local.example` (copie para `.env.local`):
```env
VITE_API_URL=http://localhost:3002/api
```

### ❌ "Cannot connect to database"
**Solução:**
```powershell
# Reiniciar PostgreSQL
docker-compose restart postgres

# Ver se está rodando
docker-compose ps
```

### ❌ "CORS error" no navegador
**Solução:** Verifique se no `backend/.env` tem:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### ❌ Link não funciona / Token inválido
**Soluções:**
1. Certifique-se de copiar o link COMPLETO dos logs
2. Use o link em até 15 minutos (expira)
3. Cada link só funciona UMA vez
4. Se expirou, solicite outro na página de login

---

## 📊 Verificar se está tudo OK

### Backend está rodando?
```powershell
curl http://localhost:3001/health
```

Ou abra no navegador: http://localhost:3001/health

### Frontend está rodando?
Abra no navegador: http://localhost:5173

### PostgreSQL está rodando?
```powershell
docker-compose ps postgres
```

Deve mostrar `Up`

### Redis está rodando?
```powershell
docker-compose ps redis
```

Deve mostrar `Up`

---

## 🔄 Reiniciar Tudo

Se algo não estiver funcionando, reinicie tudo:

```powershell
# 1. Parar tudo
docker-compose down

# 2. Limpar e iniciar novamente
docker-compose up -d postgres redis

# 3. Aguardar
Start-Sleep -Seconds 10

# 4. Iniciar backend
cd backend
npm run dev

# 5. Iniciar frontend (outro terminal)
cd ..
npm run dev
```

---

## 📱 Email em Produção

⚠️ **No desenvolvimento, o email NÃO é enviado!**

O magic link aparece nos **logs do backend** para você testar.

Em **produção**, você vai configurar um provedor de email (SendGrid, AWS SES, etc) e aí o link será enviado por email automaticamente.

---

## ✨ Tudo Está Alinhado!

| Item | Status |
|------|--------|
| Backend rodando | ✅ |
| Frontend rodando | ✅ |
| PostgreSQL rodando | ✅ |
| Redis rodando | ✅ |
| Usuário admin no banco | ✅ |
| Página de login | ✅ |
| Página de verificação | ✅ |
| Rotas protegidas | ✅ |
| Integração completa | ✅ |

---

## 🎉 Pronto para Usar!

Agora é só seguir os comandos acima e testar!

**Dúvidas?** Me avise que eu te ajudo! 😊


