import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { CheckCircle, Copy } from "lucide-react"
import { useState } from "react"

export default function SucessoPage() {

  const protocolo = "ZXA-S0R"
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  } 

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="flex flex-col items-center px-4 py-12 md:py-16">
        <div className="w-full max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-12">Finalizado</h1>
          <div className="bg-primary rounded-3xl p-8 md:p-16 relative min-h-[600px] flex flex-col items-center justify-center text-center space-y-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Sua reclamação foi realizada com sucesso!</h1>
            <div className="space-y-6 flex flex-col items-center justify-center text-center animate-fadeIn">
              <p className="text-xl md:text-2xl text-white font-medium">O Protocolo da sua denúncia é:</p>
              <div className="bg-accent text-foreground text-3xl md:text-4xl font-bold px-12 py-6 rounded-full flex items-center justify-center">
                {protocolo}
                <Button onClick={handleCopy} className=" absolute cursor-pointer top-1/2 right-1/3 -translate-x-1/2 -translate-y-2">
                  {copied ? <CheckCircle className="w-14 h-14" /> : <Copy className="w-10 h-10" />}
                </Button>
              </div>
            </div>

            <p className="text-white text-lg max-w-2xl leading-relaxed">
              Coonsulte pelo protocolo enviado no email de relacionomento
            </p>

            <Link to="/">
              <Button className="bg-white hover:bg-white/90 text-foreground font-semibold uppercase tracking-wide px-12 py-6 mt-8">
                FINALIZAR
              </Button>
            </Link>

            <span className="absolute bottom-8 right-12 text-white text-4xl font-light">3</span>
          </div>
        </div>
      </main>
    </div>
  )
}
