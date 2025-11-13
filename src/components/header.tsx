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
      alert("Email inválido.");
    return
    }

    } else {
      const celularLimpo = valor.replace(/\\D/g, "")
      if (celularLimpo.length < 10) {
        alert("Número de celular inválido.")
        return
      }
    }

    setShowLoginModal(false)
    navigate("/admin")
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
              <label className="flex items-center gap-4">
                <input
                  type="radio"
                  name="loginType"
                  value="email"
                  checked={logintype === "email"}
                  onChange={() => {
                    setLoginType("email");
                    setValor("");
                  }}
                />
                <span className="text-lg">Email</span>
              </label>
              <label className="flex items-center gap-4">
                <input
                  type="radio"
                  name="loginType"
                  value="celular"
                  checked={logintype === "celular"}
                  onChange={() => {
                    setLoginType("celular");
                    setValor("");
                  }}
                />
                <span className="text-lg">Celular</span>
              </label>
              {logintype === "email" && (
                <Input
                  type="email"
                  placeholder="exemplo@exemplo.com"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="text-center text-lg"
                  required
                />
              )}
              {logintype === "celular" && (
                <Input
                  type="tel"
                  placeholder="(DD) 99999-9999"
                  value={valor}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, '');
                    v = v.replace(/(\d{2})(\d)/, '($1) $2');
                    v = v.replace(/(\d{5})(\d)/, '$1-$2');
                    setValor(v);
                  }}
                  className="text-center text-lg"
                  required
                />
                
              )}

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
