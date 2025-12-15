import type { FormEvent } from "react"
import { Header } from "@/components/header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Search, X, MessageSquare, Clock, CheckCircle, Send, AlertCircle } from "lucide-react"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Mock de relatos com diferentes status
const mockRelatos: Record<string, {
  protocolo: string
  descricao: string
  status: "pendente" | "respondido"
  resposta?: string
  dataEnvio: string
  dataResposta?: string
  mensagensEnviadas?: { texto: string; data: string }[]
}> = {
  "ZXA-S0R": {
    protocolo: "ZXA-S0R",
    descricao: "Relato sobre comportamento inadequado de um supervisor durante reuniões de equipe. O supervisor tem utilizado linguagem inadequada e feito comentários desrespeitosos.",
    status: "pendente",
    dataEnvio: "14/11/2025",
    mensagensEnviadas: [
      { texto: "Gostaria de adicionar que esse comportamento se repete todas as semanas.", data: "16/11/2025" }
    ]
  },
  "ABC-123": {
    protocolo: "ABC-123",
    descricao: "Denúncia sobre possível conflito de interesses na contratação de fornecedores.",
    status: "respondido",
    dataEnvio: "10/11/2025",
    dataResposta: "15/11/2025",
    resposta: "Agradecemos seu relato. Iniciamos uma investigação interna sobre o caso mencionado. Nossa equipe de compliance está analisando todas as informações fornecidas e tomaremos as medidas necessárias. Você será informado sobre o andamento em breve.",
    mensagensEnviadas: [
      { texto: "Consegui mais informações sobre o caso. O fornecedor X também está envolvido.", data: "12/11/2025" }
    ]
  },
  "XYZ-789": {
    protocolo: "XYZ-789",
    descricao: "Relato sobre situação de assédio moral no ambiente de trabalho.",
    status: "pendente",
    dataEnvio: "12/11/2025"
  }
}

export default function AcompanheSeuRelato() {
  const [protocolo, setProtocolo] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [showResponseDialog, setShowResponseDialog] = useState(false)
  const [responseText, setResponseText] = useState("")
  const [relatoEncontrado, setRelatoEncontrado] = useState<typeof mockRelatos[string] | null>(null)

  // Função para calcular dias desde o envio
  const calcularDiasDesdeEnvio = (dataEnvio: string): number => {
    const partes = dataEnvio.split("/")
    const dataRelato = new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]))
    const hoje = new Date()
    const diffTime = Math.abs(hoje.getTime() - dataRelato.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Verifica se pode enviar mensagem (até 15 dias)
  const podeEnviarMensagem = relatoEncontrado 
    ? calcularDiasDesdeEnvio(relatoEncontrado.dataEnvio) <= 15 
    : false
  
  const diasPassados = relatoEncontrado 
    ? calcularDiasDesdeEnvio(relatoEncontrado.dataEnvio) 
    : 0

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (protocolo.trim()) {
      const relato = mockRelatos[protocolo.toUpperCase()]
      if (relato) {
        setRelatoEncontrado(relato)
        setShowResults(true)
      } else {
        // Protocolo não encontrado
        setRelatoEncontrado(null)
        setShowResults(true)
      }
    }
  }

  const clearSearch = () => {
    setProtocolo("")
    setShowResults(false)
    setRelatoEncontrado(null)
  }

  const handleSendResponse = () => {
    if (responseText.trim()) {
      // Aqui você enviaria a resposta para o backend
      console.log("Resposta enviada:", responseText)
      setShowResponseDialog(false)
      setResponseText("")
      // Poderia mostrar uma mensagem de sucesso
      alert("Sua mensagem foi enviada com sucesso! Nossa equipe irá analisar e responder em breve.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="flex flex-col items-center px-4 py-12 md:py-16">
        <div className="w-full max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground text-center mb-12">Acompanhe seu Relato</h1>

          <div className="bg-primary rounded-3xl p-8 md:p-12 min-h-[500px]">
            <form onSubmit={handleSearch} className="mb-8">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Digite o Protocolo"
                  value={protocolo}
                  onChange={(e) => setProtocolo(e.target.value)}
                  className="bg-white border-0 text-foreground pr-24 py-6 text-base"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {protocolo && (
                    <button 
                      type="button" 
                      onClick={clearSearch} 
                      className="hover:opacity-70 transition-opacity"
                      title="Limpar busca"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  )}
                  <button 
                    type="submit" 
                    className="hover:opacity-70 transition-opacity"
                    title="Buscar"
                  >
                    <Search className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </form>

            {showResults && (
              <div className="space-y-8 text-white">
                {relatoEncontrado ? (
                  <>
                    {/* Informações do Relato */}
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Meu Relato</h2>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-white/80">
                          <span className="font-semibold">Protocolo:</span> {relatoEncontrado.protocolo}
                        </p>
                        <p className="text-sm text-white/80">
                          <span className="font-semibold">Data de envio:</span> {relatoEncontrado.dataEnvio}
                        </p>
                        <p className="text-sm text-white/80">
                          <span className="font-semibold">Status:</span>{" "}
                          <span className={relatoEncontrado.status === "respondido" ? "text-green-300 font-semibold" : "text-yellow-300 font-semibold"}>
                            {relatoEncontrado.status === "respondido" ? "Respondido" : "Em análise"}
                          </span>
                        </p>
                      </div>
                      <p className="text-sm leading-relaxed bg-white text-foreground p-4 rounded-lg">
                        {relatoEncontrado.descricao}
                      </p>
                    </div>

                    {/* Resposta da empresa */}
                    {relatoEncontrado.status === "respondido" && relatoEncontrado.resposta ? (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle className="h-5 w-5 text-blue-300" />
                          <h3 className="text-xl font-bold">Relato Finalizado</h3>
                        </div>
                        {relatoEncontrado.dataResposta && (
                          <p className="text-sm text-white/80 mb-2">
                            Respondido em: {relatoEncontrado.dataResposta}
                          </p>
                        )}
                        <div className="bg-white text-foreground p-4 rounded-lg">
                          <p className="text-sm leading-relaxed">
                            {relatoEncontrado.resposta}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Clock className="h-5 w-5 text-yellow-300" />
                          <h3 className="text-xl font-bold">Status do Relato</h3>
                        </div>
                        <div className="bg-yellow-500/20 border border-yellow-400/50 p-4 rounded-lg">
                          <p className="text-sm leading-relaxed">
                            Seu relato está em análise pela nossa equipe. Você será notificado assim que houver uma resposta.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Mensagens enviadas pelo denunciante */}
                    {relatoEncontrado.mensagensEnviadas && relatoEncontrado.mensagensEnviadas.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <MessageSquare className="h-5 w-5 text-blue-300" />
                          <h3 className="text-xl font-bold">Minhas Mensagens</h3>
                        </div>
                        <div className="space-y-3">
                          {relatoEncontrado.mensagensEnviadas.map((mensagem, index) => (
                            <div key={index} className="bg-white text-foreground p-4 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-2">
                                Enviada em: {mensagem.data}
                              </p>
                              <p className="text-sm leading-relaxed">
                                {mensagem.texto}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Alerta sobre limite de 15 dias */}
                    {relatoEncontrado.status === "pendente" && (
                      <div className="flex items-start gap-3 rounded-2xl border border-orange-400/70 bg-orange-50 p-4 text-sm text-orange-900">
                        <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Prazo para envio de mensagens</p>
                          <p>
                            {podeEnviarMensagem 
                              ? `Você pode enviar mensagens até 15 dias após o envio do relato. Restam ${15 - diasPassados} dias.`
                              : "O prazo de 15 dias para envio de mensagens já expirou. Para novos apontamentos, abra um novo protocolo."
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Botão para enviar mensagem/resposta */}
                    {relatoEncontrado.status === "pendente" ? (
                      <div className="flex justify-center pt-4">
                        <Button
                          onClick={() => setShowResponseDialog(true)}
                          disabled={!podeEnviarMensagem}
                          className="bg-white hover:bg-white/90 text-primary font-semibold px-8 py-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <MessageSquare className="h-5 w-5" />
                          Enviar Mensagem
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-6 bg-white/10 border border-white/20 rounded-2xl p-4 text-center text-sm text-white/80">
                        Relato encerrado. Para novos apontamentos, abra um novo protocolo.
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-white text-lg mb-2">Protocolo não encontrado</p>
                    <p className="text-white/80 text-sm">
                      Verifique se o protocolo está correto e tente novamente.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Dialog para enviar mensagem/resposta */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-2xl rounded-3xl border-4 border-primary p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-6">
              Enviar Mensagem sobre seu Relato
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold mb-2 block">
                Sua mensagem será analisada pela nossa equipe
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Descreva sua dúvida, solicitação ou comentário sobre o relato. Nossa equipe irá analisar e responder em breve.
              </p>
              <Textarea
                className="min-h-32"
                placeholder="Digite sua mensagem aqui..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button
                onClick={() => {
                  setShowResponseDialog(false)
                  setResponseText("")
                }}
                variant="outline"
                className="px-8"
              >
                Cancelar
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-white px-8 flex items-center gap-2"
                onClick={handleSendResponse}
                disabled={!responseText.trim()}
              >
                <Send className="h-4 w-4" />
                Enviar Mensagem
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
