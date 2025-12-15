import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="flex flex-col items-center justify-center px-8 py-24 md:py-32">
        <div className="max-w-4xl text-center space-y-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
            Você está no Canal de Relatos da Aliança Empreendedora.
            <br />
            
          </h1>
          <h3 className="text-lg text-foreground text-balance"> Aqui você pode enviar seus relatos de forma segura e confidencial.</h3>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 mt-10">
            <Link to="/faca-seu-relato">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wide px-8 py-6 text-base"
              >
                FAÇA SEU RELATO
              </Button>
            </Link>
            <Link to="/acompanhe-seu-relato">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold uppercase tracking-wide px-8 py-6 text-base"
              >
                ACOMPANHE SEU RELATO
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
