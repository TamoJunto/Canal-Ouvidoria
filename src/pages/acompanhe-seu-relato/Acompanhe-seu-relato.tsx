import type { FormEvent } from "react"
import { Header } from "@/components/header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Search, X, MessageSquare, Clock, CheckCircle, Send, AlertCircle, Loader2, Download, Paperclip } from "lucide-react"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { relatosPublicApi } from "@/services"
import type { RelatoPublico, Anexo } from "@/services"

export default function AcompanheSeuRelato() {
  const [protocolo, setProtocolo] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [showResponseDialog, setShowResponseDialog] = useState(false)
  const [responseText, setResponseText] = useState("")
  const [relatoEncontrado, setRelatoEncontrado] = useState<RelatoPublico | null>(null)
  const [loading, setLoading] = useState(false)
  const [enviandoMensagem, setEnviandoMensagem] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [anexos, setAnexos] = useState<Anexo[]>([])
  const [loadingAnexos, setLoadingAnexos] = useState(false)

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()
    if (!protocolo.trim()) return

    setLoading(true)
    setErrorMessage("")
    try {
      console.log('Buscando protocolo:', protocolo.toUpperCase())
      const relato = await relatosPublicApi.getRelatoByProtocol(protocolo.toUpperCase())
      console.log('Relato encontrado:', relato)
      console.log('Tem resposta_final?', (relato as any)?.resposta_final)
      console.log('Timeline:', relato.timeline)
      setRelatoEncontrado(relato)
      setShowResults(true)
      
      // Buscar anexos
      loadAnexos(protocolo.toUpperCase())
    } catch (error: any) {
      console.error('Erro completo:', error)
      console.error('Status:', error.response?.status)
      console.error('Dados do erro:', error.response?.data)
      
      let mensagemErro = 'Protocolo não encontrado'
      
      if (error.response?.status === 500) {
        mensagemErro = 'Erro no servidor ao buscar o relato. Verifique o console do BACKEND para mais detalhes.'
      } else if (error.response?.status === 404) {
        mensagemErro = 'Protocolo não encontrado no sistema.'
      } else if (error.response?.data?.message) {
        mensagemErro = error.response.data.message
      } else if (error.response?.data?.error?.message) {
        mensagemErro = error.response.data.error.message
      }
      
      setErrorMessage(mensagemErro)
      setRelatoEncontrado(null)
      setShowResults(true)
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setProtocolo("")
    setShowResults(false)
    setRelatoEncontrado(null)
    setAnexos([])
  }

  const loadAnexos = async (protocoloParam: string) => {
    setLoadingAnexos(true)
    try {
      const anexosData = await relatosPublicApi.getAnexos(protocoloParam)
      setAnexos(anexosData || [])
    } catch (error) {
      console.error('Erro ao carregar anexos:', error)
      setAnexos([])
    } finally {
      setLoadingAnexos(false)
    }
  }

  const handleDownloadAnexo = async (anexoId: number, nomeOriginal: string) => {
    if (!relatoEncontrado) return
    try {
      const blob = await relatosPublicApi.downloadAnexo(relatoEncontrado.protocol, anexoId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nomeOriginal
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      alert('Erro ao baixar anexo')
    }
  }

  const handleSendResponse = async () => {
    if (!responseText.trim() || !relatoEncontrado) return

    setEnviandoMensagem(true)
    try {
      await relatosPublicApi.createMensagem(relatoEncontrado.protocol, responseText)
      
      setShowResponseDialog(false)
      setResponseText("")
      
      alert("Sua mensagem foi enviada com sucesso! Nossa equipe irá analisar e responder em breve.")
      
      // Recarrega o relato para ver a mensagem enviada
      const relatoAtualizado = await relatosPublicApi.getRelatoByProtocol(relatoEncontrado.protocol)
      setRelatoEncontrado(relatoAtualizado)
    } catch (error: any) {
      alert(
        error.response?.data?.message || 
        'Erro ao enviar mensagem. Tente novamente.'
      )
    } finally {
      setEnviandoMensagem(false)
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
                    disabled={loading}
                    className="hover:opacity-70 transition-opacity disabled:opacity-50"
                    title="Buscar"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                    ) : (
                      <Search className="w-5 h-5 text-muted-foreground" />
                    )}
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
                          <span className="font-semibold">Protocolo:</span> {relatoEncontrado.protocol}
                        </p>
                        <p className="text-sm text-white/80">
                          <span className="font-semibold">Tipo:</span> {relatoEncontrado.type}
                        </p>
                        <p className="text-sm text-white/80">
                          <span className="font-semibold">Data de envio:</span> {new Date(relatoEncontrado.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-white/80">
                          <span className="font-semibold">Status:</span>{" "}
                          <span className="text-yellow-300 font-semibold">
                            {relatoEncontrado.status}
                          </span>
                        </p>
                      </div>
                      <p className="text-sm leading-relaxed bg-white text-foreground p-4 rounded-lg">
                        {relatoEncontrado.description}
                      </p>
                    </div>

                    {/* Resposta Final */}
                    {(relatoEncontrado as any)?.resposta_final && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle className="h-5 w-5 text-green-300" />
                          <h3 className="text-xl font-bold">Resposta da Equipe</h3>
                        </div>
                        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 text-foreground">
                          {(relatoEncontrado as any)?.respondido_em && (
                            <p className="text-xs text-gray-500 mb-3">
                              Respondido em: {new Date((relatoEncontrado as any).respondido_em).toLocaleString('pt-BR')}
                            </p>
                          )}
                          <p className="text-sm leading-relaxed mb-4">
                            {(relatoEncontrado as any).resposta_final}
                          </p>
                          
                          {/* Anexos da Resposta */}
                          {anexos.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-green-200">
                              <div className="flex items-center gap-2 mb-3">
                                <Paperclip className="h-4 w-4 text-green-700" />
                                <h4 className="text-sm font-semibold text-green-700">
                                  Arquivos Anexados ({anexos.length})
                                </h4>
                              </div>
                              <div className="space-y-2">
                                {anexos.map((anexo) => (
                                  <div key={anexo.id} className="flex items-center justify-between bg-white p-3 rounded border border-green-200">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900">{anexo.nome_original}</p>
                                      <p className="text-xs text-gray-500">
                                        {(anexo.tamanho / 1024).toFixed(2)} KB
                                      </p>
                                    </div>
                                    <Button
                                      onClick={() => handleDownloadAnexo(anexo.id, anexo.nome_original)}
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white ml-4"
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Histórico de Mensagens */}
                    {relatoEncontrado.timeline && relatoEncontrado.timeline.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <MessageSquare className="h-5 w-5 text-blue-300" />
                          <h3 className="text-xl font-bold">Suas Mensagens</h3>
                        </div>
                        <div className="space-y-3">
                          {relatoEncontrado.timeline
                            .filter(event => event.type === 'MENSAGEM_PUBLICA' || event.type === 'RESPOSTA_FINAL')
                            .map((event, index) => (
                            <div key={index} className="bg-white text-foreground p-4 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-2">
                                {new Date(event.timestamp).toLocaleString('pt-BR')}
                              </p>
                              {event.content && typeof event.content === 'object' && (
                                <p className="text-sm leading-relaxed">
                                  {event.content.mensagem || event.content.texto || JSON.stringify(event.content)}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Botão para enviar mensagem */}
                    {relatoEncontrado.status !== 'FINALIZADO' && relatoEncontrado.status !== 'ARQUIVADO' && (
                      <div className="flex justify-center pt-4">
                        <Button
                          onClick={() => setShowResponseDialog(true)}
                          className="bg-white hover:bg-white/90 text-primary font-semibold px-8 py-6 flex items-center gap-2"
                        >
                          <MessageSquare className="h-5 w-5" />
                          Enviar Mensagem
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
                    <p className="text-white text-lg mb-2">Protocolo não encontrado</p>
                    <p className="text-white/80 text-sm mb-4">
                      {errorMessage || 'Verifique se o protocolo está correto e tente novamente.'}
                    </p>
                    <div className="bg-white/10 border border-white/20 rounded-lg p-4 text-left text-sm text-white/80 max-w-md mx-auto">
                      <p className="font-semibold mb-2">Formato correto do protocolo:</p>
                      <p className="font-mono">AAAA-XXXXXX</p>
                      <p className="mt-2">Exemplo: <span className="font-mono">2025-ABC123</span></p>
                    </div>
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
                disabled={!responseText.trim() || enviandoMensagem}
              >
                {enviandoMensagem ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
