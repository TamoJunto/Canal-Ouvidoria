import { Button } from "@/components/ui/button"
import { FileText, Users, UsersRound, TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"
import { HeaderAdmin } from "@/components/headerAdmin"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderAdmin />

      <main className="flex flex-col items-center px-4 py-12 md:py-20">
        <div className="w-full max-w-4xl space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Bem-vindo ao site da ouvidoria</h1>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">do Grupo Aliança Empreendedora</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <Link to="/admin/relatos" className="md:col-span-1">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wide py-8 flex items-center justify-center gap-3">
                <FileText className="w-5 h-5" />
                Relatos
              </Button>
            </Link>

            <Link to="/admin/usuarios" className="md:col-span-1">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wide py-8 flex items-center justify-center gap-3">
                <Users className="w-5 h-5" />
                Usuarios
              </Button>
            </Link>

            <Link to="/admin/comites" className="md:col-span-1">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wide py-8 flex items-center justify-center gap-3">
                <UsersRound className="w-5 h-5" />
                Comites
              </Button>
            </Link>
          </div>

          <div className="flex justify-center pt-4">
            <Link to="/admin/dashboard" className="w-full md:w-1/2">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wide py-8 flex items-center justify-center gap-3">
                <TrendingUp className="w-5 h-5" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
