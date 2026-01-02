import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Link, useLocation } from "react-router-dom"
import { CheckCircle, Copy, AlertTriangle } from "lucide-react"
import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SucessoPage() {
  const location = useLocation()
  const locationState = location.state as { 
    protocol?: string;
    naoSeIdentificou?: boolean; 
    receberProtocoloPorEmail?: boolean;
  } | undefined
  
  const protocolo = locationState?.protocol || "ERRO-000000"
  const naoSeIdentificou = locationState?.naoSeIdentificou ?? false
  const receberProtocoloPorEmail = locationState?.receberProtocoloPorEmail ?? !naoSeIdentificou

  const [copied, setCopied] = useState(false)
  const [hasCopied, setHasCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(protocolo).then(() => {
      setCopied(true)
      setHasCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    }).catch(() => {
      setCopied(true)
      setHasCopied(true)
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
            <h1 className="text-3xl md:text-4xl font-bold text-white">Seu Relato foi registrado com sucesso!</h1>
            
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

            <div className="w-full max-w-2xl space-y-4 text-white text-lg leading-relaxed">
              {naoSeIdentificou && !receberProtocoloPorEmail ? (
                <Alert className="border-2 border-yellow-400 bg-yellow-50/95 shadow-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                  <div className="flex-1">
                    <AlertTitle className="text-yellow-800 font-bold text-lg mb-2">Atenção: Guarde seu protocolo!</AlertTitle>
                    <AlertDescription className="text-yellow-700 font-bold text-center">
                      <strong className="font-semibold">Como você escolheu não se identificar, não será possível reenviar o código do protocolo por e-mail. Guarde este código para acompanhar o andamento do seu relato.</strong>  
                    </AlertDescription>
                  </div>
                </Alert>
              ) : (
                <p className="text-white/90 text-center font-semibold">
                  Enviamos o protocolo do Relato para o e-mail informado.
                </p>
              )}
            </div>

            {hasCopied ? (
              <Link to="/">
                <Button className="bg-white hover:bg-white/90 text-foreground font-semibold uppercase tracking-wide px-12 py-6 mt-8">
                  FINALIZAR
                </Button>
              </Link>
            ) : (
              <p className="text-white/80 text-sm font-medium mt-6">Copie o protocolo para liberar o botão de finalizar.</p>
            )}

            <span className="absolute bottom-8 right-12 text-white text-4xl font-light">3</span>
          </div>
        </div>
      </main>
    </div>
  )
}
