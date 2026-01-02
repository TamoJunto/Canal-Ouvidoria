import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { ShieldAlert } from 'lucide-react';
import { tokenManager, authApi } from '@/services';
import type { Usuario } from '@/services';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN_MASTER' | 'OPERADOR';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = tokenManager.isAuthenticated();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      navigate('/', { replace: true });
      return;
    }

    try {
      const userData = await authApi.getMe();
      setUser(userData);
      
      if (requiredRole && userData.perfil !== requiredRole) {
      setShowUnauthorizedModal(true);
    }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      tokenManager.clearTokens();
      navigate('/', { replace: true });
    } finally {
      setLoading(false);
    }
  };


  // Modal de acesso negado
  if (showUnauthorizedModal) {
    return (
      <>
        <Dialog open={showUnauthorizedModal} onOpenChange={setShowUnauthorizedModal}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-foreground flex flex-col items-center gap-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                  <ShieldAlert className="h-8 w-8 text-red-600" />
                </div>
                Acesso Negado
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <p className="text-center text-muted-foreground">
                Você não tem permissão para acessar esta área.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Área:</strong> {requiredRole === 'ADMIN_MASTER' ? 'Administração' : 'Operador'}
                  <br />
                  <strong>Seu perfil:</strong> {user?.perfil === 'ADMIN_MASTER' ? 'Admin Master' : 'Operador'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setShowUnauthorizedModal(false);
                    if (user?.perfil === 'ADMIN_MASTER') {
                      navigate('/admin');
                    } else if (user?.perfil === 'OPERADOR') {
                      navigate('/operador');
                    } else {
                      navigate('/');
                    }
                  }}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Ir para Minha Área
                </Button>
                
                <Button
                  onClick={() => {
                    setShowUnauthorizedModal(false);
                    navigate('/');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Voltar ao Início
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return <>{children}</>;
}


