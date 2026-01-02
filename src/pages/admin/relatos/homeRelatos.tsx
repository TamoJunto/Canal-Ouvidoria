import { HeaderAdmin } from "@/components/headerAdmin"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState, useEffect } from "react"
import { AlertTriangle, ChevronLeft, Mail, Clock, Check, MessageSquare, RotateCcw, Info, Loader2, Download, Paperclip, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { relatosAuthApi, comitesApi, relatosPublicApi } from "@/services"
import type { RelatoDetalhado, Comite, Anexo } from "@/services"

export default function RelatosPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState("NOVO")
  const [comiteFilter, setComiteFilter] = useState<string>("todos")
  const [tipoRelatoFilter, setTipoRelatoFilter] = useState("Todos")
  const [selectedRelato, setSelectedRelato] = useState<string | null>(null)

  // Mapeamento de tipos de relato do Select para valores da API
  const tipoRelatoMap: Record<string, string | undefined> = {
    "Todos": undefined,
    "ASSÉDIO MORAL": "ASSEDIO_MORAL",
    "ASSÉDIO SEXUAL": "ASSEDIO_SEXUAL",
    "CONFLITO DE INTERESSES": "CONFLITO_INTERESSES",
    "DISCRIMINAÇÃO": "PRECONCEITO_DISCRIMINACAO",
    "FRAUDE": "CORRUPCAO",
    "COMPORTAMENTO INADEQUADO": "COMPORTAMENTO_INADEQUADO",
    "OUTROS (Uso Indevido)": "OUTROS",
  }
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showResponseDialog, setShowResponseDialog] = useState(false)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [showReopenDialog, setShowReopenDialog] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [responseText, setResponseText] = useState("")
  const [reopenMotivo, setReopenMotivo] = useState("")
  const [targetComite, setTargetComite] = useState("")
  const [responseFiles, setResponseFiles] = useState<File[]>([])
  
  const [relatos, setRelatos] = useState<RelatoDetalhado[]>([])
  const [comites, setComites] = useState<Comite[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")
  const [relatoDetalhado, setRelatoDetalhado] = useState<RelatoDetalhado | null>(null)
  const [loadingDetalhes, setLoadingDetalhes] = useState(false)
  const [anexos, setAnexos] = useState<Anexo[]>([])
  const [loadingAnexos, setLoadingAnexos] = useState(false)

  useEffect(() => {
    loadComites()
  }, [])

  useEffect(() => {
    loadRelatos()
  }, [statusFilter, tipoRelatoFilter, comiteFilter])

  const loadRelatos = async () => {
    setLoading(true)
    setError("")
    try {
      // Mapeia o tipo de relato do Select para o valor da API
      const tipoApi = tipoRelatoMap[tipoRelatoFilter]
      
      // Converte comiteFilter (ID do comitê) para número
      const comiteId = comiteFilter && comiteFilter !== "todos" ? parseInt(comiteFilter) : undefined
      
      console.log('Carregando relatos com filtros:', { statusFilter, tipoRelatoFilter, tipoApi, comiteFilter, comiteId })
      const response = await relatosAuthApi.listarRelatos({
        status: statusFilter,
        tipo: tipoApi,
        comite_id: comiteId,
      })
      console.log('Relatos carregados:', response.relatos.length)
      setRelatos(response.relatos || [])
    } catch (error: any) {
      console.error('Erro ao carregar relatos:', error)
      console.error('Detalhes:', error.response?.data)
      setError(error.response?.data?.message || 'Erro ao carregar relatos')
      setRelatos([])
    } finally {
      setLoading(false)
    }
  }

  const loadComites = async () => {
    try {
      const data = await comitesApi.listarComites()
      setComites(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar comitês:', error)
      setComites([])
    }
  }

  const loadRelatoDetalhes = async (relatoId: string) => {
    setLoadingDetalhes(true)
    try {
      console.log('Buscando detalhes do relato:', relatoId)
      const detalhes = await relatosAuthApi.getRelatoDetalhes(relatoId)
      console.log('Detalhes carregados:', detalhes)
      console.log('Comentários:', detalhes.comentarios)
      console.log('Mensagens:', detalhes.mensagens)
      console.log('Histórico:', detalhes.historico)
      setRelatoDetalhado(detalhes)
      
      // Se possui evidências, busca os anexos
      if ((detalhes as any)?.possui_evidencias && (detalhes as any)?.protocolo) {
        loadAnexos((detalhes as any).protocolo)
      }
    } catch (error: any) {
      console.error('ERRO ao carregar detalhes:', error)
      console.error('Status:', error.response?.status)
      console.error('Dados:', error.response?.data)
      alert(error.response?.data?.message || 'Erro ao carregar detalhes do relato')
      setSelectedRelato(null)
    } finally {
      setLoadingDetalhes(false)
    }
  }

  const loadAnexos = async (protocolo: string) => {
    setLoadingAnexos(true)
    try {
      console.log('Buscando anexos do protocolo:', protocolo)
      const anexosData = await relatosPublicApi.getAnexos(protocolo)
      console.log('Anexos retornados:', anexosData)
      console.log('Total de anexos:', anexosData?.length)
      setAnexos(anexosData || [])
    } catch (error: any) {
      console.error('Erro ao carregar anexos:', error)
      console.error('Status:', error.response?.status)
      console.error('Dados:', error.response?.data)
      setAnexos([])
    } finally {
      setLoadingAnexos(false)
    }
  }

  const handleDownloadAnexo = async (anexoId: number, nomeOriginal: string) => {
    if (!detailedRelato) return
    try {
      const blob = await relatosPublicApi.downloadAnexo((detailedRelato as any).protocolo, anexoId)
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

  const handleDownloadTodosAnexos = async () => {
    for (const anexo of anexos) {
      await handleDownloadAnexo(anexo.id, anexo.nome_original)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  const handleSelectRelato = (relatoId: string) => {
    setSelectedRelato(relatoId)
    loadRelatoDetalhes(relatoId)
  }

  const detailedRelato = relatoDetalhado

  return (
    <div className="min-h-screen bg-background">
      <HeaderAdmin />
      <main className="flex flex-col items-center px-4 py-8">
        {!selectedRelato ? (
          <div className="w-full max-w-7xl">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 text-foreground hover:text-primary mb-6 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="font-medium">Voltar</span>
            </button>
            <div className="bg-primary rounded-t-3xl p-6">
              <div className="flex gap-4 mb-6">
                <Button
                  onClick={() => setStatusFilter("NOVO")}
                  className={`flex-1 h-14 text-base font-semibold ${statusFilter === "NOVO" ? "bg-white text-black hover:bg-white/90" : "bg-white/20 text-white hover:bg-white/30"}`}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  NOVO
                </Button>
                <Button
                  onClick={() => setStatusFilter("EM_ANDAMENTO")}
                  className={`flex-1 h-14 text-base font-semibold ${statusFilter === "EM_ANDAMENTO" ? "bg-white text-black hover:bg-white/90" : "bg-white/20 text-white hover:bg-white/30"}`}
                >
                  <Clock className="mr-2 h-5 w-5" />
                  EM ANDAMENTO
                </Button>
                <Button
                  onClick={() => setStatusFilter("FINALIZADO")}
                  className={`flex-1 h-14 text-base font-semibold ${statusFilter === "FINALIZADO" ? "bg-white text-black hover:bg-white/90" : "bg-white/20 text-white hover:bg-white/30"}`}
                >
                  <Check className="mr-2 h-5 w-5" />
                  FINALIZADO
                </Button>
              </div>
            </div>

            <div className="bg-white border-4 border-primary rounded-b-3xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold">Relatos</h1>
                <div className="flex gap-4 items-end">
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground mb-1">Tipo de Relato</span>
                    <Select value={tipoRelatoFilter} onValueChange={setTipoRelatoFilter}>
                      <SelectTrigger className="w-56">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todos">Todos os tipos</SelectItem>
                        <SelectItem value="ASSÉDIO MORAL">Assédio Moral</SelectItem>
                        <SelectItem value="ASSÉDIO SEXUAL">Assédio Sexual</SelectItem>
                        <SelectItem value="CONFLITO DE INTERESSES">Conflito de Interesses</SelectItem>
                        <SelectItem value="DISCRIMINAÇÃO">Discriminação</SelectItem>
                        <SelectItem value="FRAUDE">Fraude / Corrupção</SelectItem>
                        <SelectItem value="COMPORTAMENTO INADEQUADO">Comportamento Inadequado</SelectItem>
                        <SelectItem value="OUTROS (Uso Indevido)">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground mb-1">Comitês</span>
                    <Select value={comiteFilter} onValueChange={setComiteFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Todos os comitês" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os comitês</SelectItem>
                        {comites.map((comite) => (
                          <SelectItem key={comite.id} value={comite.id.toString()}>
                            {comite.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-3 text-muted-foreground">Carregando relatos...</p>
                </div>
              ) : relatos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Nenhum relato encontrado com os filtros selecionados.</p>
                  <p className="text-xs mt-2">Status atual: {statusFilter}</p>
                </div>
              ) : (
              <div className="space-y-4">
                  {relatos.map((relato) => (
                  <div
                    key={relato.id}
                      onClick={() => handleSelectRelato(relato.id.toString())}
                    className="border-2 border-gray-300 rounded-2xl p-6 hover:border-primary cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{relato.tipo}</h3>
                          <p className="text-sm text-muted-foreground">
                            Protocolo: {relato.protocolo} | Prioridade: {relato.prioridade}
                          </p>
                        </div>
                      <div className="text-right">
                          <div className="text-sm font-semibold mb-1">Enviado</div>
                          <div className="text-sm">{new Date(relato.criado_em).toLocaleDateString('pt-BR')}</div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed line-clamp-2">{relato.descricao}</p>
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-5xl">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setSelectedRelato(null)}
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="font-medium">Voltar</span>
              </button>
              
            </div>

            <h1 className="text-4xl font-bold mb-8">Relatos</h1>

            {loadingDetalhes ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Carregando detalhes...</p>
              </div>
            ) : detailedRelato ? (
            <div className="border-4 border-primary rounded-3xl p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold">{detailedRelato?.tipo}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Protocolo: {detailedRelato?.protocolo} | Status: {detailedRelato?.status} | Prioridade: {detailedRelato?.prioridade}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">Enviado</div>
                  <div className="text-sm">{detailedRelato?.criado_em && new Date(detailedRelato.criado_em).toLocaleDateString('pt-BR')}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-4">Descrição</h3>
                  <p className="text-sm leading-relaxed">{detailedRelato?.descricao}</p>
                </div>

                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2">Informações Adicionais</h3>
                  <div className="text-xs leading-relaxed space-y-1">
                    {(detailedRelato as any)?.pessoas_envolvidas && (
                      <p>
                        <span className="font-semibold">Pessoas Envolvidas:</span> {(detailedRelato as any).pessoas_envolvidas}
                      </p>
                    )}
                    {(detailedRelato as any)?.quem_sabe && (
                      <p>
                        <span className="font-semibold">Quem Sabe:</span> {(detailedRelato as any).quem_sabe}
                      </p>
                    )}
                    {(detailedRelato as any)?.possui_evidencias && (
                      <p>
                        <span className="font-semibold text-blue-600">Possui Evidências</span>
                      </p>
                    )}
                    {(detailedRelato as any)?.identificado && (
                      <>
                        {(detailedRelato as any)?.denunciante_nome && (
                          <p>
                            <span className="font-semibold">Nome:</span> {(detailedRelato as any).denunciante_nome}
                          </p>
                        )}
                        {(detailedRelato as any)?.denunciante_email && (
                          <p>
                            <span className="font-semibold">Email:</span> {(detailedRelato as any).denunciante_email}
                          </p>
                        )}
                        {(detailedRelato as any)?.denunciante_telefone && (
                          <p>
                            <span className="font-semibold">Telefone:</span> {(detailedRelato as any).denunciante_telefone}
                          </p>
                        )}
                      </>
                    )}
                    {!(detailedRelato as any)?.identificado && (
                      <p className="font-semibold text-yellow-600">Relato Anônimo</p>
                    )}
                    {(detailedRelato as any)?.email_notificacao && (
                      <p>
                        <span className="font-semibold">Email para notificação:</span> {(detailedRelato as any).email_notificacao}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ANEXOS E EVIDÊNCIAS */}
              {(detailedRelato as any)?.possui_evidencias && (
              <div className="mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Paperclip className="h-5 w-5" />
                    <h3 className="text-lg font-bold">Anexos e Evidências</h3>
                  </div>
                  <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      {anexos.length > 1 && (
                        <Button
                          onClick={handleDownloadTodosAnexos}
                          size="sm"
                          className=" text-white"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Baixar Todos
                        </Button>
                      )}
                    </div>
                    
                    {loadingAnexos ? (
                      <div className="flex items-center gap-2 ">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Carregando anexos...</span>
                      </div>
                    ) : anexos.length > 0 ? (
                      <div className="space-y-2">
                        {anexos.map((anexo) => (
                          <div key={anexo.id} className="flex items-center justify-between bg-white p-3 rounded border ">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{anexo.nome_original}</p>
                              <p className="text-xs text-gray-500">
                                {(anexo.tamanho / 1024).toFixed(2)} KB | {new Date(anexo.criado_em).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <Button
                              onClick={() => handleDownloadAnexo(anexo.id, anexo.nome_original)}
                              size="sm"
                              variant="outline"
                              className="ml-4"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-purple-600">
                        O denunciante informou que possui evidências mas ainda não enviou arquivos.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* DIVISÓRIA: TRATATIVAS */}
              <div className="my-12">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                  </div>
                  
                </div>
              </div>

              {/* RESPOSTA FINAL */}
              {(detailedRelato as any)?.resposta_final && (
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="h-5 w-5" />
                    <h3 className="text-lg font-bold">Resposta Final Enviada ao Denunciante</h3>
                  </div>
                  <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">Resposta Final
                      </span>
                  </div>
                    {(detailedRelato as any)?.respondido_em && (
                      <p className="text-xs text-muted-foreground ">
                        Respondido em: {new Date((detailedRelato as any).respondido_em).toLocaleString('pt-BR')}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed text-gray-700 bg-white p-4 rounded">
                      {(detailedRelato as any).resposta_final}
                    </p>
                  </div>
                </div>
              )}


              {/* MENSAGENS DO DENUNCIANTE */}
              {detailedRelato?.mensagens && detailedRelato.mensagens.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="h-5 w-5" />
                    <h3 className="text-lg font-bold">Mensagens do Denunciante</h3>
                  </div>
                  <div className="space-y-4">
                    {detailedRelato.mensagens.map((msg: any) => (
                      <div
                        key={msg.id}
                        className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-700">
                              Denunciante
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.criado_em).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-700">{msg.texto || msg.conteudo}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* COMENTÁRIOS INTERNOS */}
              {detailedRelato?.comentarios && detailedRelato.comentarios.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-5 w-5" />
                    <h3 className="text-lg font-bold">Comentários Internos</h3>
                  </div>
                  <div className="space-y-4">
                    {detailedRelato.comentarios.map((comment: any) => (
                        <div
                          key={comment.id}
                          className="bg-primary/10 border-l-4 border-primary rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-semibold text-primary">
                            {comment.usuario || 'Operador'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.criado_em).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{comment.conteudo || comment.texto}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botões - diferentes para cada status */}
              <div className="flex justify-end gap-4 mt-8">
                {detailedRelato?.status === "FINALIZADO" || detailedRelato?.status === "ARQUIVADO" ? (
                  <Button
                    onClick={() => setShowReopenDialog(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-8"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reabrir Caso
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => setShowCommentDialog(true)}
                      className="bg-primary hover:bg-primary/90 text-white px-8"
                    >
                      Adicionar Comentário
                    </Button>
                    <Button
                      onClick={() => setShowTransferDialog(true)}
                      className="bg-primary hover:bg-primary/90 text-white px-8"
                    >
                      Transferir
                    </Button>
                    <Button
                      onClick={() => setShowResponseDialog(true)}
                      className="bg-primary hover:bg-primary/90 text-white px-8"
                    >
                      Responder e Finalizar
                    </Button>
                  </>
                )}
              </div>
            </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Erro ao carregar detalhes do relato.
              </div>
            )}
          </div>
        )}
      </main>

      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="max-w-2xl rounded-3xl border-4 border-primary p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-6">Transferir para Comitê</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold mb-2 block">Selecione o Comitê</Label>
              <Select value={targetComite} onValueChange={setTargetComite}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um comitê" />
                </SelectTrigger>
                <SelectContent>
                  {comites.map((comite) => (
                    <SelectItem key={comite.id} value={comite.id.toString()}>
                      {comite.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="flex justify-end gap-4 mt-8">
                <Button
                onClick={() => {
                  setShowTransferDialog(false)
                  setTargetComite("")
                }}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  if (!selectedRelato || !targetComite) {
                    alert('Selecione um comitê')
                    return
                  }
                  setActionLoading(true)
                  const statusAntes = detailedRelato?.status
                  try {
                    // Se o relato está NOVO, primeiro inicia o tratamento
                    if (statusAntes === 'NOVO') {
                      await relatosAuthApi.iniciarRelato(selectedRelato)
                    }
                    
                    // Motivo automático
                    const comiteSelecionado = comites.find(c => c.id.toString() === targetComite)
                    const motivo = `Transferido para ${comiteSelecionado?.nome || 'outro comitê'}`
                    
                    await relatosAuthApi.transferirRelato(
                      selectedRelato,
                      targetComite,
                      motivo
                    )
                    alert('Relato transferido com sucesso!')
                    setShowTransferDialog(false)
                    setTargetComite("")
                    
                    // Só muda de aba se era NOVO
                    if (statusAntes === 'NOVO') {
                      setStatusFilter("EM_ANDAMENTO")
                      setSelectedRelato(null)
                    } else {
                      await loadRelatoDetalhes(selectedRelato)
                    }
                    
                    await loadRelatos()
                  } catch (error: any) {
                    alert(error.response?.data?.message || 'Erro ao transferir relato')
                  } finally {
                    setActionLoading(false)
                  }
                }}
                disabled={actionLoading || !targetComite}
                  className="bg-primary hover:bg-primary/90 text-white px-8"
                >
                {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Transferir
                </Button>
              </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-2xl rounded-3xl border-4 border-primary p-8">
          <DialogHeader>
             <DialogTitle className="text-2xl font-bold text-center mb-6">Responder e Finalizar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-yellow-400/70 bg-yellow-50 p-4 text-sm text-yellow-900">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold">Esta é a resposta final do caso.</p>
                <p>Ao enviar, o relato será encerrado. Revise com atenção.</p>
              </div>
            </div>
            <div>
              <Label className="text-base font-semibold">Mensagem</Label>
              <Textarea 
                className="mt-2 min-h-32" 
                placeholder="Digite sua resposta ao denunciante (mínimo 10 caracteres)..." 
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
              />
              {responseText.trim().length > 0 && responseText.trim().length < 10 && (
                <p className="text-xs text-red-600 mt-1">
                  Mínimo 10 caracteres. Faltam {10 - responseText.trim().length}.
                </p>
              )}
            </div>
            <div>
              <Label className="text-base font-semibold">Anexar Arquivos (opcional)</Label>
              <div className="mt-2">
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setResponseFiles(Array.from(e.target.files))
                    }
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Formatos aceitos: PDF, JPG, PNG (máx. 10MB por arquivo)
                </p>
                {responseFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {responseFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded text-sm">
                        <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setResponseFiles(responseFiles.filter((_, i) => i !== index))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                onClick={() => {
                  setShowResponseDialog(false)
                  setResponseText("")
                }}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white px-8"
                onClick={async () => {
                  if (!selectedRelato || !responseText.trim()) {
                    alert('Digite uma mensagem')
                    return
                  }
                  
                  if (responseText.length < 10) {
                    alert('A resposta deve ter no mínimo 10 caracteres')
                    return
                  }
                  
                  setActionLoading(true)
                  try {
                    const protocolo = (detailedRelato as any)?.protocolo
                    
                    // 1. Se tem arquivos, faz upload primeiro
                    if (responseFiles.length > 0 && protocolo) {
                      console.log('Fazendo upload de', responseFiles.length, 'arquivo(s)...')
                      try {
                        await relatosPublicApi.uploadAnexos(protocolo, responseFiles)
                        console.log('Arquivos enviados com sucesso!')
                      } catch (uploadError: any) {
                        console.error('Erro ao enviar arquivos:', uploadError)
                        alert('Aviso: Houve um erro ao enviar os arquivos anexados, mas a resposta será enviada.')
                      }
                    }
                    
                    // 2. Envia a resposta (já finaliza automaticamente)
                    console.log('Respondendo e finalizando relato:', selectedRelato, responseText)
                    await relatosAuthApi.responderRelato(selectedRelato, responseText)
                    console.log('Relato respondido e finalizado!')
                    
                    alert('Relato respondido e finalizado com sucesso!')
                    setShowResponseDialog(false)
                    setResponseText("")
                    setResponseFiles([])
                    setStatusFilter("FINALIZADO")
                    setSelectedRelato(null)
                    await loadRelatos()
                  } catch (error: any) {
                    console.error('ERRO ao finalizar:', error)
                    console.error('Response:', error.response?.data)
                    alert(error.response?.data?.message || error.response?.data?.error?.message || 'Erro ao finalizar relato')
                  } finally {
                    setActionLoading(false)
                  }
                }}
                disabled={actionLoading || !responseText.trim()}
              >
                {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Enviar e Finalizar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReopenDialog} onOpenChange={setShowReopenDialog}>
        <DialogContent className="max-w-2xl rounded-3xl border-4 border-primary p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-6">Reabrir Caso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Motivo da Reabertura</Label>
              <Textarea 
                className="mt-2 min-h-32" 
                placeholder="Descreva o motivo para reabrir este caso (mínimo 10 caracteres)..."
                value={reopenMotivo}
                onChange={(e) => setReopenMotivo(e.target.value)}
              />
              {reopenMotivo.trim().length > 0 && reopenMotivo.trim().length < 10 && (
                <p className="text-xs text-red-600 mt-1">
                  Mínimo 10 caracteres. Faltam {10 - reopenMotivo.trim().length}.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-4">
              <Button
                onClick={() => {
                  setShowReopenDialog(false)
                  setReopenMotivo("")
                }}
                variant="outline"
                className="px-8"
              >
                Cancelar
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white px-8"
                onClick={async () => {
                  if (!selectedRelato || !reopenMotivo.trim()) {
                    alert('Digite o motivo da reabertura')
                    return
                  }
                  
                  if (reopenMotivo.trim().length < 10) {
                    alert('O motivo deve ter no mínimo 10 caracteres')
                    return
                  }
                  
                  setActionLoading(true)
                  try {
                    await relatosAuthApi.reabrirRelato(selectedRelato, reopenMotivo)
                    alert('Caso reaberto com sucesso!')
                  setShowReopenDialog(false)
                    setReopenMotivo("")
                    setStatusFilter("EM_ANDAMENTO")
                    setSelectedRelato(null)
                    await loadRelatos()
                  } catch (error: any) {
                    console.error('Erro ao reabrir:', error)
                    alert(error.response?.data?.message || error.response?.data?.error?.message || 'Erro ao reabrir caso')
                  } finally {
                    setActionLoading(false)
                  }
                }}
                disabled={actionLoading || !reopenMotivo.trim() || reopenMotivo.trim().length < 10}
              >
                {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Reabrir Caso
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent className="max-w-2xl rounded-3xl border-4 border-primary p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-6">Adicionar Comentário sobre o Tratamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label className="text-base font-semibold">Comentário</Label>
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="text-sm">
                        <strong>Comunicação interna:</strong> Este comentário é apenas para registro interno e comunicação entre a equipe. O denunciante não verá esta mensagem.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Textarea 
                className="min-h-32" 
                placeholder="Descreva como está indo o tratamento da denúncia, atualizações, próximos passos, etc..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button
                onClick={() => {
                  setShowCommentDialog(false)
                  setCommentText("")
                }}
                variant="outline"
                className="px-8"
              >
                Cancelar
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white px-8"
                onClick={async () => {
                  if (!commentText.trim() || !selectedRelato) {
                    alert('Digite um comentário')
                    return
                  }
                  setActionLoading(true)
                  const statusAntes = detailedRelato?.status
                  try {
                    // Se o relato está NOVO, primeiro inicia o tratamento
                    if (statusAntes === 'NOVO') {
                      await relatosAuthApi.iniciarRelato(selectedRelato)
                    }
                    
                    // Depois adiciona o comentário
                    await relatosAuthApi.addComentario(selectedRelato, commentText)
                    alert('Comentário adicionado com sucesso!')
                    setShowCommentDialog(false)
                    setCommentText("")
                    
                    // Só muda de aba se o status era NOVO (agora virou EM_ANDAMENTO)
                    if (statusAntes === 'NOVO') {
                      setStatusFilter("EM_ANDAMENTO")
                      setSelectedRelato(null)
                    } else {
                      // Se já estava em andamento, apenas recarrega os detalhes
                      await loadRelatoDetalhes(selectedRelato)
                    }
                    
                    await loadRelatos()
                  } catch (error: any) {
                    alert(error.response?.data?.message || error.response?.data?.error?.message || 'Erro ao adicionar comentário')
                    console.error('Erro detalhado:', error.response?.data)
                  } finally {
                    setActionLoading(false)
                  }
                }}
                disabled={!commentText.trim() || actionLoading}
              >
                {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Salvar Comentário
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
