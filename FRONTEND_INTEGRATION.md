# 🔗 Integração Frontend ↔️ Backend

Guia para conectar o frontend React/Vite com o backend Node.js.

## 📋 Visão Geral

O frontend já está preparado com a estrutura removida dos dados mockados. Agora vamos conectar com o backend real.

## 🔧 Configuração

### 1. Variáveis de Ambiente (Frontend)

Crie `frontend/.env` (ou `.env.local`):

```env
VITE_API_URL=http://localhost:3001/api
VITE_API_TIMEOUT=30000
```

### 2. Cliente HTTP (Axios/Fetch)

Crie `src/services/api.ts`:

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se token expirou e não é retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Renova tokens
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        // Salva novos tokens
        localStorage.setItem('accessToken', data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.tokens.refreshToken);

        // Reexecuta requisição original
        originalRequest.headers.Authorization = `Bearer ${data.tokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh falhou, redireciona para login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

## 🔐 Autenticação

### Serviço de Autenticação

Crie `src/services/authService.ts`:

```typescript
import api from './api';

export interface LoginResponse {
  success: boolean;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: {
    id: string;
    nome: string;
    email: string;
    tipo: 'ADMIN_MASTER' | 'OPERADOR';
  };
}

export const authService = {
  /**
   * Solicita magic link
   */
  async requestMagicLink(email: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post('/auth/magic-link', { email });
    return data;
  },

  /**
   * Verifica magic link e faz login
   */
  async verifyMagicLink(token: string): Promise<LoginResponse> {
    const { data } = await api.get(`/auth/verify-magic-link?token=${token}`);
    
    // Salva tokens no localStorage
    localStorage.setItem('accessToken', data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  /**
   * Faz logout
   */
  async logout(revokeAll: boolean = false): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    try {
      await api.post('/auth/logout', { refreshToken, revokeAll });
    } finally {
      // Limpa storage independente do resultado
      localStorage.clear();
    }
  },

  /**
   * Obtém usuário autenticado
   */
  async me(): Promise<{ id: string; email: string; tipo: string }> {
    const { data } = await api.get('/auth/me');
    return data.user;
  },

  /**
   * Verifica se está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  /**
   * Obtém usuário do localStorage
   */
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
```

### Hook de Autenticação

Crie `src/hooks/useAuth.ts`:

```typescript
import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [user, setUser] = useState(authService.getUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verifica autenticação ao montar
    setIsAuthenticated(authService.isAuthenticated());
    setUser(authService.getUser());
  }, []);

  const requestMagicLink = async (email: string) => {
    setLoading(true);
    try {
      const result = await authService.requestMagicLink(email);
      return result;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Erro ao solicitar magic link');
    } finally {
      setLoading(false);
    }
  };

  const verifyMagicLink = async (token: string) => {
    setLoading(true);
    try {
      const result = await authService.verifyMagicLink(token);
      setIsAuthenticated(true);
      setUser(result.user);
      return result;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Erro ao verificar magic link');
    } finally {
      setLoading(false);
    }
  };

  const logout = async (revokeAll: boolean = false) => {
    setLoading(true);
    try {
      await authService.logout(revokeAll);
      setIsAuthenticated(false);
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isAuthenticated,
    user,
    loading,
    requestMagicLink,
    verifyMagicLink,
    logout,
  };
}
```

### Rota Protegida

Crie `src/components/ProtectedRoute.tsx`:

```typescript
import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN_MASTER' | 'OPERADOR';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.tipo !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
```

## 📡 Serviços da API

### Dashboard

Substitua `src/services/dashboardApi.ts`:

```typescript
import api from './api';
import type { DashboardResumo, DashboardFilters } from '@/types/dashboard';

export async function getDashboardResumo(
  filters?: DashboardFilters
): Promise<DashboardResumo> {
  const { data } = await api.post('/dashboard/resumo', filters);
  return data;
}

export async function exportDashboardReport(
  filters?: DashboardFilters
): Promise<Blob> {
  const { data } = await api.post('/dashboard/export', filters, {
    responseType: 'blob',
  });
  return data;
}
```

### Relatos (quando implementado no backend)

Crie `src/services/relatosService.ts`:

```typescript
import api from './api';

export const relatosService = {
  /**
   * Lista relatos (admin/operador)
   */
  async list(params: {
    status?: string;
    comiteId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { data } = await api.get('/relatos', { params });
    return data;
  },

  /**
   * Busca relato por ID
   */
  async getById(id: string) {
    const { data } = await api.get(`/relatos/${id}`);
    return data;
  },

  /**
   * Busca relato público por protocolo
   */
  async getByProtocol(protocolo: string) {
    const { data } = await api.get(`/public/relatos/${protocolo}`);
    return data;
  },

  /**
   * Cria novo relato
   */
  async create(relato: any) {
    const { data } = await api.post('/public/relatos', relato);
    return data;
  },

  /**
   * Adiciona comentário interno
   */
  async addComment(id: string, texto: string) {
    const { data } = await api.post(`/relatos/${id}/comentarios`, { texto });
    return data;
  },

  /**
   * Envia resposta final
   */
  async sendFinalResponse(id: string, resposta: string) {
    const { data } = await api.post(`/relatos/${id}/resposta-final`, { resposta });
    return data;
  },
};
```

## 🔄 Exemplo de Uso

### Página de Login

```typescript
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { requestMagicLink, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await requestMagicLink(email);
      setMessage(result.message);
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar Magic Link'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
```

### Página de Verificação

```typescript
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyMagicLink } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      verifyMagicLink(token)
        .then(() => navigate('/admin'))
        .catch(() => navigate('/login'));
    }
  }, [searchParams]);

  return <div>Verificando...</div>;
}
```

### Dashboard com Dados Reais

```typescript
import { useDashboard } from '@/hooks/useDashboard';

export function DashboardPage() {
  const filters = { groupBy: 'semana' };
  const { data, loading, error } = useDashboard(filters);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  if (!data) return <div>Sem dados</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div>Total: {data.kpis.total}</div>
      <div>Novos: {data.kpis.novos}</div>
      {/* ... */}
    </div>
  );
}
```

## 🚀 Testando a Integração

### 1. Iniciar Backend

```bash
cd backend
docker-compose up -d
npm run dev
```

### 2. Iniciar Frontend

```bash
cd .. # voltar para raiz
npm run dev
```

### 3. Testar Fluxo

1. Acesse http://localhost:5173
2. Vá para página de login
3. Digite `admin@ouvidoria.com`
4. Verifique logs do backend para ver o magic link
5. Copie o token e acesse: http://localhost:5173/auth/verify?token=TOKEN
6. Deve redirecionar para admin com usuário autenticado

## 🐛 Debugging

### Verificar Requisições

No DevTools (F12):

1. Aba **Network**
2. Filtrar por `XHR` ou `Fetch`
3. Ver headers: `Authorization: Bearer ...`
4. Ver responses

### Logs do Backend

```bash
docker-compose logs -f backend
```

### Erros Comuns

#### CORS Error
**Problema**: `Access-Control-Allow-Origin`

**Solução**: Verifique `ALLOWED_ORIGINS` no backend `.env`

```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### 401 Unauthorized
**Problema**: Token inválido/expirado

**Solução**: Limpe localStorage e faça login novamente

```javascript
localStorage.clear();
```

#### Network Error
**Problema**: Backend não está rodando

**Solução**: 
```bash
cd backend
docker-compose ps  # Verificar containers
docker-compose up -d  # Iniciar se necessário
```

## 📝 Checklist de Integração

Frontend:
- [ ] Cliente API configurado (`api.ts`)
- [ ] Serviço de autenticação (`authService.ts`)
- [ ] Hook de autenticação (`useAuth.ts`)
- [ ] Rotas protegidas (`ProtectedRoute.tsx`)
- [ ] Interceptor de refresh token
- [ ] Tratamento de erros
- [ ] Loading states
- [ ] Página de login
- [ ] Página de verificação
- [ ] Logout implementado

Backend:
- [ ] CORS configurado
- [ ] Rate limiting ajustado
- [ ] Logs habilitados
- [ ] Banco de dados inicializado
- [ ] Redis rodando
- [ ] Usuário admin criado

## 🎯 Próximos Passos

1. ✅ Integrar autenticação
2. ⏭️ Integrar módulo de relatos
3. ⏭️ Integrar dashboard
4. ⏭️ Integrar usuários
5. ⏭️ Integrar comitês
6. ⏭️ Upload de anexos
7. ⏭️ Notificações em tempo real (WebSocket)

---

**Dúvidas?** Consulte:
- `backend/README.md` - Documentação do backend
- `backend/requests.http` - Exemplos de requisições
- DevTools Network tab - Ver requisições em tempo real



