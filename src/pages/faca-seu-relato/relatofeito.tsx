import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Link, useLocation } from "react-router-dom"
import { CheckCircle, Copy, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SucessoPage() {
  const location = useLocation()
  const naoSeIdentificou = (location.state as { naoSeIdentificou?: boolean })?.naoSeIdentificou || false

  const protocolo = "ZXA-S0R"
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(protocolo).then(() => {
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    }).catch(() => {
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    })
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
              <div className="bg-accent text-foreground text-3xl md:text-4xl font-bold px-12 py-6 rounded-full flex items-center justify-center gap-3 relative">
                {protocolo}
                <Button 
                  onClick={handleCopy} 
                  className="bg-transparent hover:bg-transparent border-0 p-0 cursor-pointer"
                  title={copied ? "Copiado!" : "Copiar protocolo"}
                  type="button"
                  >
                  {copied ? <CheckCircle className="w-8 h-8 text-green-500" /> : <Copy className="w-8 h-8 text-foreground hover:text-primary transition-colors" />}
                </Button>
              </div>
            </div>

            <p className="text-white text-lg max-w-2xl leading-relaxed">
              {/* Alerta para quem não se identificou - dentro do quadro */}
              {naoSeIdentificou && (
                <Alert className="w-full max-w-2xl border-2 border-yellow-400 bg-yellow-50/95 shadow-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                  <div className="flex-1">
                    <AlertTitle className="text-yellow-800 font-bold text-lg mb-2">Atenção: Guarde seu protocolo!</AlertTitle>
                    <AlertDescription className="text-yellow-700 font-bold text-center">
                      <strong className="font-semibold">Como você escolheu não se identificar Não será possível reenviar o código do protocolo por e-mail É fundamental que você guarde este código para acompanhar o andamento do seu relato.</strong>  
                       
                    </AlertDescription>
                  </div>
                </Alert>
              )}
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
