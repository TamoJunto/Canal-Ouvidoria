import { Routes, Route } from 'react-router-dom'
import Home from './pages/page'
import FacaSeuRelato from './pages/faca-seu-relato/faca-seu-relato'
import AcompanheSeuRelato from './pages/acompanhe-seu-relato/Acompanhe-seu-relato'
import DuvidasFrequentes from './pages/duvidas-frequentes'
import CodigoEtica from './pages/codigo-etica'
import Regras from './pages/regras'
import HomeAdm from './pages/admin/homeadm'
import AnexoRelato from './pages/faca-seu-relato/anexorelato'
import RelatoFeito from './pages/faca-seu-relato/relatofeito'
import HomeRelatos from './pages/admin/relatos/homeRelatos'
import HomeUsuarios from './pages/admin/usuarios/homeUsuarios'
import Comites from './pages/admin/comites/comites'
import DashADM from './pages/admin/dashboard/dashADM'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/faca-seu-relato" element={<FacaSeuRelato />} />
      <Route path="/faca-seu-relato/anexos" element={<AnexoRelato />} />
      <Route path="/faca-seu-relato/relatofeito" element={<RelatoFeito />} />
      <Route path="/acompanhe-seu-relato" element={<AcompanheSeuRelato />} />
      <Route path="/duvidas-frequentes" element={<DuvidasFrequentes />} />
      <Route path="/codigo-de-etica" element={<CodigoEtica />} />
      <Route path="/regras" element={<Regras />} />
      <Route path="/admin" element={<HomeAdm />} />
      <Route path="/admin/relatos" element={<HomeRelatos />} />
      <Route path="/admin/usuarios" element={<HomeUsuarios />} />
      <Route path="/admin/comites" element={<Comites />} />
      <Route path="/admin/dashboard" element={<DashADM />} />
    </Routes>
  )
}

export default App

