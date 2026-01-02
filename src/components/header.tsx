import { type FormEvent, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { Menu, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { authApi } from "@/services"

export function Header() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null)
  const [loading, setLoading] = useState(false)
  const [magicLink, setMagicLink] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')
    setMessageType(null)
    setMagicLink(null)
    setLoading(true)

    try {
      const data = await authApi.requestMagicLink(email)

      setMessage(data.message || 'Link enviado! Verifique seu email ou o console do backend.')
      setMessageType('success')
      
      if ((data as any).magicLink) {
        setMagicLink((data as any).magicLink)
        console.log('Magic Link (desenvolvimento):', (data as any).magicLink)
      } else {
        console.log('Verifique o console do BACKEND para ver o link do Ethereal.')
        setMessage(
          'Link enviado! Como estamos usando Ethereal (ambiente de desenvolvimento), ' +
          'verifique o CONSOLE DO BACKEND (terminal onde rodou npm run dev no backend) ' +
          'para ver a URL onde o email está disponível.'
        )
      }
    } catch (error: any) {
      console.error('Erro ao solicitar magic link:', error)
      setMessage(
        error.response?.data?.message || 
        error.message || 
        'Erro ao conectar com o servidor. Verifique se o backend está rodando.'
      )
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const navigationLinks = [
    { to: "/", label: "INÍCIO" },
    { to: "/duvidas-frequentes", label: "DÚVIDAS FREQUENTES" },
    { to: "/codigo-de-etica", label: "CÓDIGO DE ÉTICA" },
    { to: "/regras", label: "Políticas adicionais" },
  ]

  const handleNavigate = (to: string) => {
    setMobileMenuOpen(false)
    navigate(to)
  }

  return (
    <>
      <header className="w-full py-6 px-6 sm:px-8 bg-background border-b border-border/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="https://prod-cms-us-east-1-uploads.s3.us-east-1.amazonaws.com/logo_ae_text_white_v2024_1_37365009bd.svg" 
              alt="Aliança Empreendedora" 
              className="h-12 w-auto"
              onError={(e) => {
                // Fallback se a imagem não carregar
                console.error('Erro ao carregar logo:', e);
              }}
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-semibold text-foreground uppercase tracking-wide hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowLoginModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wide px-4 sm:px-6"
            >
              LOGIN ADMIN
            </Button>
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md border border-border/70 p-2 text-foreground"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 px-6 sm:px-8 pb-6 bg-background/95 border-t border-border/40">
            <div className="flex flex-col gap-4">
              {navigationLinks.map((link) => (
                <button
                  key={link.to}
                  onClick={() => handleNavigate(link.to)}
                  className="text-left text-sm font-semibold text-foreground uppercase tracking-wide py-2 border-b border-border/30"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-foreground">
              Login Administrativo
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleLogin} className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                type="email"
                placeholder="admin@ouvidoria.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-lg"
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Link de Acesso'
              )}
            </Button>

            {message && (
              <div
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  messageType === 'success'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                {messageType === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <p className={`text-sm leading-relaxed ${
                  messageType === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message}
                </p>
              </div>
            )}
            
            {magicLink && (
              <div className="flex flex-col gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-blue-900 text-sm font-semibold mb-2">
                      🔗 Magic Link (Modo Desenvolvimento)
                    </p>
                    <p className="text-blue-800 text-xs mb-3">
                      Clique no link abaixo para fazer login:
                    </p>
                    <a
                      href={magicLink}
                      onClick={() => setShowLoginModal(false)}
                      className="block bg-blue-100 hover:bg-blue-200 text-blue-900 text-xs p-3 rounded break-all transition-colors font-mono"
                    >
                      {magicLink}
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Acesso restrito para operadores e administradores
              </p>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
