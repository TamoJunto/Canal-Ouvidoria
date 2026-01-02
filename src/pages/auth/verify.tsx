import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { authApi, tokenManager } from '@/services';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando link de acesso...');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Token não encontrado na URL');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (tokenManager.isAuthenticated()) {
      setStatus('success');
      setMessage('Você já está autenticado! Redirecionando...');
      
      authApi.getMe()
        .then((userData) => {
      setTimeout(() => {
            const userRole = (userData as any).tipo || userData.perfil;
            if (userRole === 'ADMIN_MASTER') {
          navigate('/admin', { replace: true });
            } else if (userRole === 'OPERADOR') {
          navigate('/operador', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }, 1000);
        })
        .catch(() => {
          tokenManager.clearTokens();
        });
      return;
    }

    if (isVerifying) {
      return;
    }

    const verifyToken = async () => {
      if (isVerifying) return;
      setIsVerifying(true);
      try {
        const data = await authApi.verifyMagicLink(token);

        console.log('Login bem-sucedido:', data);

        setStatus('success');
        setMessage('Login realizado com sucesso! Redirecionando...');
        
        // Backend retorna 'tipo', não 'perfil'
        const userRole = (data.user as any).tipo || data.user.perfil;
        
        setTimeout(() => {
          if (userRole === 'ADMIN_MASTER') {
            navigate('/admin', { replace: true });
          } else if (userRole === 'OPERADOR') {
            navigate('/operador', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }, 1500);
      } catch (error: any) {
        console.error('Erro ao verificar token:', error);
        
        if (tokenManager.isAuthenticated()) {
          setStatus('success');
          setMessage('Login realizado! Redirecionando...');
          
          authApi.getMe()
            .then((userData) => {
              const userRole = (userData as any).tipo || userData.perfil;
              setTimeout(() => {
                if (userRole === 'ADMIN_MASTER') {
                  navigate('/admin', { replace: true });
                } else if (userRole === 'OPERADOR') {
                  navigate('/operador', { replace: true });
                } else {
                  navigate('/', { replace: true });
                }
              }, 1000);
            })
            .catch(() => {
              setStatus('error');
              setMessage('Erro ao carregar dados do usuário.');
              setTimeout(() => navigate('/'), 3000);
            });
        } else {
        setStatus('error');
          setMessage(
            error.response?.data?.error?.message || 
            error.message || 
            'Link inválido ou expirado. Solicite um novo link.'
          );
        setTimeout(() => navigate('/'), 3000);
        }
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [searchParams, navigate, isVerifying]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-primary rounded-3xl p-12 text-center shadow-xl">
          {/* Ícone de Status */}
          <div className="mb-6">
            {status === 'loading' && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            )}
            
            {status === 'success' && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full animate-bounce">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
            )}
            
            {status === 'error' && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500 rounded-full">
                <XCircle className="h-10 w-10 text-white" />
              </div>
            )}
          </div>

          {/* Mensagem */}
          <h1 className="text-2xl font-bold text-white mb-4">
            {status === 'loading' && 'Verificando...'}
            {status === 'success' && 'Sucesso!'}
            {status === 'error' && 'Erro'}
          </h1>

          <p className="text-white/80 text-base leading-relaxed">
            {message}
          </p>

          {/* Progresso */}
          {status === 'loading' && (
            <div className="mt-6">
              <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}

          {/* Informação adicional */}
          {status === 'error' && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex items-start gap-2 text-white/60 text-xs">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-left">
                  O link de acesso expira em 15 minutos. Se você demorou muito para clicar, 
                  solicite um novo link na página de login.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Link de voltar */}
        {status === 'error' && (
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Voltar para página inicial
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

