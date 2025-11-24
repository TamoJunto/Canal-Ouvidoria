import { useLocation } from "react-router-dom"
import { Header } from "./header"
import { HeaderAdmin } from "./headerAdmin"

export function ConditionalHeader() {
  const location = useLocation()
  
  // Verifica se está em uma rota de admin
  const isAdminRoute = location.pathname.startsWith('/admin') || 
                       location.pathname === '/homeadm'
  
  // Retorna o header apropriado
  return isAdminRoute ? <HeaderAdmin /> : <Header />
}