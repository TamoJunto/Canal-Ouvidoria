# 🔐 Guia de Login - Sistema de Ouvidoria

## ✅ Tudo Pronto!

Acabei de criar **todos os arquivos necessários** para o login funcionar!

## 📁 Arquivos Criados

### Backend (Já estava pronto)
- ✅ API de autenticação funcionando
- ✅ Usuário admin pré-cadastrado: `admin@ouvidoria.com`

### Frontend (Criados agora)
1. **Serviços**
   - ✅ `src/services/api.ts` - Cliente HTTP com interceptors
   - ✅ `src/services/authService.ts` - Lógica de autenticação

2. **Hooks**
   - ✅ `src/hooks/useAuth.ts` - Hook customizado para autenticação

3. **Componentes**
   - ✅ `src/components/ProtectedRoute.tsx` - Proteção de rotas

4. **Páginas**
   - ✅ `src/pages/login.tsx` - Página de login
   - ✅ `src/pages/auth/verify.tsx` - Verificação do magic link
   - ✅ `src/pages/unauthorized.tsx` - Página de acesso negado

5. **Rotas**
   - ✅ `src/App.tsx` - Atualizado com rotas protegidas

6. **Configuração**
   - ✅ `env.local.example` - Exemplo de variáveis de ambiente

---

## 🚀 Como Usar

### 1️⃣ Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto (pasta `canal/`):

```bash
# Windows PowerShell
Copy-Item env.local.example .env.local

# Ou crie manualmente com este conteúdo:
```

Conteúdo do `.env.local`:
```env
VITE_API_URL=http://localhost:3001/api
VITE_API_TIMEOUT=30000
```

---

### 2️⃣ Iniciar o Backend

```bash
cd backend
npm install
docker-compose up -d postgres redis
npm run dev
```

**Aguarde ver:** `🚀 API rodando em http://localhost:3001`

---

### 3️⃣ Iniciar o Frontend

```bash
# Em outro terminal, na raiz do projeto
npm run dev
```

**Aguarde ver:** `Local: http://localhost:5173`

---

### 4️⃣ Fazer Login

#### **Passo 1:** Acessar página de login
Abra: http://localhost:5173/login

#### **Passo 2:** Digitar email
Digite: `admin@ouvidoria.com`

Clique em **"Enviar Link de Acesso"**

#### **Passo 3:** Pegar o magic link nos logs do backend

No terminal do backend, procure por:
```
Magic link gerado: http://localhost:5173/auth/verify?token=ABC123...
```

**Copie o link completo!**

#### **Passo 4:** Acessar o link

Cole o link no navegador e pressione Enter.

✅ **Pronto!** Você será redirecionado para `/admin` já logado!

---

## 🎯 Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│  1. Usuário acessa /login                                   │
│     Digite: admin@ouvidoria.com                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Frontend chama Backend                                  │
│     POST http://localhost:3001/api/auth/magic-link          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Backend gera token e loga no terminal                   │
│     Magic link gerado: http://...?token=ABC123              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Copie o link e cole no navegador                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Frontend chama Backend para verificar                   │
│     GET http://localhost:3001/api/auth/verify-magic-link    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  6. Backend retorna JWT (access + refresh tokens)           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  7. Frontend salva tokens e redireciona                     │
│     → /admin (se for ADMIN_MASTER)                          │
│     → /operador (se for OPERADOR)                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ✅ LOGADO!
```

---

## 🔒 Rotas Protegidas

Agora as seguintes rotas exigem login:

### Admin Master (Exclusivo)
- `/admin` - Home administrativa
- `/admin/relatos` - Gerenciar relatos
- `/admin/usuarios` - Gerenciar usuários
- `/admin/comites` - Gerenciar comitês
- `/admin/dashboard` - Dashboard

### Operador (Operador + Admin)
- `/operador` - Home do operador
- `/operador/relatos` - Ver relatos
- `/operador/dashboard` - Dashboard operador

Se tentar acessar sem estar logado → **Redireciona para /login**

Se tentar acessar área admin sendo operador → **Redireciona para /unauthorized**

---

## 🧪 Testar

### 1. Testar Health Check
```bash
curl http://localhost:3001/health
```

Deve retornar:
```json
{
  "success": true,
  "service": "Canal de Ouvidoria API",
  ...
}
```

### 2. Testar Solicitar Magic Link
```bash
curl -X POST http://localhost:3001/api/auth/magic-link \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"admin@ouvidoria.com\"}"
```

### 3. Ver logs do backend
```bash
# No terminal do backend
docker-compose logs -f backend
```

Procure por: `Magic link gerado`

---

## 🐛 Problemas Comuns

### Erro: CORS
**Sintoma:** Erro no console do navegador sobre CORS

**Solução:** Verifique se o backend está configurado com:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Erro: Network Error
**Sintoma:** Frontend não consegue conectar

**Solução:**
1. Verifique se o backend está rodando: `curl http://localhost:3001/health`
2. Verifique se a URL está correta no `.env.local`

### Erro: Token não encontrado
**Sintoma:** Após clicar no link, diz "token não encontrado"

**Solução:** Certifique-se de copiar o link COMPLETO dos logs, incluindo o token.

### Página em branco após login
**Sintoma:** Após verificar o token, página fica em branco

**Solução:** 
1. Abra o console (F12)
2. Veja se há erros
3. Verifique se as rotas `/admin` ou `/operador` existem

---

## 📧 Email em Produção

⚠️ **IMPORTANTE:** No desenvolvimento, o email NÃO é enviado de verdade!

O token aparece nos logs para facilitar o teste.

Em **produção**, você deve configurar um provedor de email:
- SendGrid
- AWS SES
- Mailgun
- Etc.

Edite `backend/src/modules/auth/auth.service.ts` na classe `EmailService`.

---

## ✨ Recursos Implementados

### No Login
- ✅ Validação de email
- ✅ Loading state
- ✅ Feedback visual (sucesso/erro)
- ✅ Design responsivo
- ✅ Aviso para modo desenvolvimento

### Na Verificação
- ✅ Loading spinner
- ✅ Mensagens de status
- ✅ Animações
- ✅ Redirecionamento automático
- ✅ Tratamento de erros

### Segurança
- ✅ Tokens JWT salvos no localStorage
- ✅ Refresh token automático
- ✅ Rotas protegidas
- ✅ Verificação de roles (Admin/Operador)
- ✅ Redirecionamento para login se não autenticado

---

## 🎉 Está Pronto!

Agora você tem um sistema de autenticação completo e funcional!

**Próximos passos:**
1. ✅ Configurar `.env.local`
2. ✅ Iniciar backend
3. ✅ Iniciar frontend
4. ✅ Fazer login
5. 🎯 Desenvolver o resto do sistema!

---

**Dúvidas?** Consulte:
- `backend/README.md` - Documentação do backend
- `backend/QUICKSTART.md` - Início rápido
- `FRONTEND_INTEGRATION.md` - Guia de integração completo


