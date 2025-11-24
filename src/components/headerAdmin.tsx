import { Button } from "@/components/ui/button"
import { FileText, Users, UsersRound, TrendingUp } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"


export function HeaderAdmin() {
  const navigate = useNavigate()
  
  return (
    <header className="w-full py-6 px-8 bg-background">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img 
            src="https://aliancaempreendedora.org.br/wp-content/uploads/2024/02/logo-ae-text-white-v2024.svg" 
            alt="Aliança Empreendedora" 
            className="h-12 w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/admin"
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

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
              <Users className="w-5 h-5 text-background" />
            </div>
            <span className="text-sm font-medium text-foreground">usuario</span>
          </div>
          <Button 
            onClick={() => navigate("/")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wide px-6"
          >
            Sair
          </Button>
        </div>
      </div>
    </header>
  )
}