import { type FormEvent, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"

export function Header() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const navigate = useNavigate()
  const[celular, setCelular] = useState("")
  const[logintype, setLoginType] = useState<"email" | "celular">("celular");
  const[valor, setValor] = useState("")



  const handleLogin = (e: FormEvent) => {
    e.preventDefault()

    if(!valor.trim()) {
      alert("Por favor, preencha o campo.")
      return
    }

    if (logintype === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(valor)) {
        alert("Email inválido.")
        return
      }
    }

    // TODO: Quando tiver backend, verificar o tipo de usuário (admin ou operador)
    // Por enquanto, vamos usar uma lógica simples baseada no email
    // Emails que terminam com @admin ou contêm "admin" vão para /admin
    // Outros vão para /operador
    const isAdmin = valor.toLowerCase().includes("admin") || valor.toLowerCase().endsWith("@admin.com")
    
    setShowLoginModal(false)
    
    if (isAdmin) {
      navigate("/admin")
    } else {
      navigate("/operador")
    }
  }

  return (
    <>
      <header className="w-full py-6 px-8 bg-background">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img 
              src="https://aliancaempreendedora.org.br/wp-content/uploads/2024/02/logo-ae-text-white-v2024.svg" 
              alt="Aliança Empreendedora" 
              className="h-12 w-auto"
              onError={(e) => {
                // Fallback se a imagem não carregar
                console.error('Erro ao carregar logo:', e);
              }}
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-semibold text-foreground uppercase tracking-wide hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1"
            >
              INÍCIO
            </Link>
            <Link
              to="/duvidas-frequentes"
              className="text-sm font-semibold text-foreground uppercase tracking-wide hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1"
            >
              DÚVIDAS FREQUENTES
            </Link>
            <Link
              to="/codigo-de-etica"
              className="text-sm font-semibold text-foreground uppercase tracking-wide hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1"
            >
              CÓDIGO DE ÉTICA
            </Link>
            <Link
              to="/regras"
              className="text-sm font-semibold text-foreground uppercase tracking-wide hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1"
            >
              REGRAS
            </Link>
          </nav>

          <Button
            onClick={() => setShowLoginModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wide px-6"
          >
            LOGIN ADMIN
          </Button>
        </div>
      </header>

      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-foreground">Login</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-6 pt-4">
            <div className="space-y-2">
              
              <Input
                type="email"
                placeholder="exemplo@exemplo.com"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="text-center text-lg"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-accent font-bold uppercase">
              Login
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
