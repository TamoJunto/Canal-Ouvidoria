import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import Home from './pages/page'
import FacaSeuRelato from './pages/faca-seu-relato/faca-seu-relato'
import AcompanheSeuRelato from './pages/acompanhe-seu-relato/Acompanhe-seu-relato'
import DuvidasFrequentes from './pages/duvidas-frequentes'
import CodigoEtica from './pages/codigo-etica'
import Regras from './pages/regras'
import AnexoRelato from './pages/faca-seu-relato/anexorelato'
import RelatoFeito from './pages/faca-seu-relato/relatofeito'

// Autenticação
import VerifyPage from './pages/auth/verify'

// Admin
import HomeAdm from './pages/admin/homeadm'
import HomeRelatos from './pages/admin/relatos/homeRelatos'
import HomeUsuarios from './pages/admin/usuarios/homeUsuarios'
import Comites from './pages/admin/comites/comites'
import DashADM from './pages/admin/dashboard/dashADM'

// Operador
import HomeOperador from './pages/operador/homeOperador'
import HomeRelatosOperador from './pages/operador/relatos/homeRelatosOperador'
import DashOperador from './pages/operador/dashboard/dashOperador'

function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/faca-seu-relato" element={<FacaSeuRelato />} />
      <Route path="/faca-seu-relato/anexos" element={<AnexoRelato />} />
      <Route path="/faca-seu-relato/relatofeito" element={<RelatoFeito />} />
      <Route path="/acompanhe-seu-relato" element={<AcompanheSeuRelato />} />
      <Route path="/duvidas-frequentes" element={<DuvidasFrequentes />} />
      <Route path="/codigo-de-etica" element={<CodigoEtica />} />
      <Route path="/regras" element={<Regras />} />

      {/* Autenticação */}
      <Route path="/auth/verify" element={<VerifyPage />} />

      {/* Rotas Admin (Protegidas) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ADMIN_MASTER">
            <HomeAdm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/relatos"
        element={
          <ProtectedRoute requiredRole="ADMIN_MASTER">
            <HomeRelatos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/usuarios"
        element={
          <ProtectedRoute requiredRole="ADMIN_MASTER">
            <HomeUsuarios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/comites"
        element={
          <ProtectedRoute requiredRole="ADMIN_MASTER">
            <Comites />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="ADMIN_MASTER">
            <DashADM />
          </ProtectedRoute>
        }
      />

      {/* Rotas Operador (Protegidas) */}
      <Route
        path="/operador"
        element={
          <ProtectedRoute>
            <HomeOperador />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operador/relatos"
        element={
          <ProtectedRoute>
            <HomeRelatosOperador />
          </ProtectedRoute>
        }
      />
      <Route
        path="/operador/dashboard"
        element={
          <ProtectedRoute>
            <DashOperador />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App

