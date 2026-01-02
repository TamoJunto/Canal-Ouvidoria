import { HeaderAdmin } from "@/components/headerAdmin"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { ChevronLeft, Mail, Clock, Check, MessageSquare, RotateCcw, FileText } from "lucide-react"

// TODO: Buscar relatos do backend
const mockRelatos: any[] = []

interface Comment {
  id: number
  texto: string
  data: string
  autor: string
}

export default function RelatosOperadorPage() {
  const [statusFilter, setStatusFilter] = useState("nova")
  const [comiteFilter, setComiteFilter] = useState("Comitê 1")
  const [selectedRelato, setSelectedRelato] = useState<number | null>(null)
  const [showResponseDialog, setShowResponseDialog] = useState(false)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [showReopenDialog, setShowReopenDialog] = useState(false)
  const [commentText, setCommentText] = useState("")
  // TODO: Buscar comentários do backend
  const [comments, setComments] = useState<Record<number, Comment[]>>({})
  // TODO: Buscar respostas finais do backend
  const [finalResponses, setFinalResponses] = useState<Record<number, string>>({})

  const filteredRelatos = mockRelatos.filter((r) => r.status === statusFilter)
  const detailedRelato = mockRelatos.find((r) => r.id === selectedRelato)

  return (
    <div className="min-h-screen bg-background">
      <HeaderAdmin />
      <main className="flex flex-col items-center px-4 py-8">
        {!selectedRelato ? (
          <div className="w-full max-w-7xl">
            <div className="bg-primary rounded-t-3xl p-6">
              <div className="flex gap-4 mb-6">
                <Button
                  onClick={() => setStatusFilter("nova")}
                  className={`flex-1 h-14 text-base font-semibold ${statusFilter === "nova" ? "bg-white text-black hover:bg-white/90" : "bg-white/20 text-white hover:bg-white/30"}`}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  NOVA
                </Button>
                <Button
                  onClick={() => setStatusFilter("andamento")}
                  className={`flex-1 h-14 text-base font-semibold ${statusFilter === "andamento" ? "bg-white text-black hover:bg-white/90" : "bg-white/20 text-white hover:bg-white/30"}`}
                >
                  <Clock className="mr-2 h-5 w-5" />
                  ANDAMENTO
                </Button>
                <Button
                  onClick={() => setStatusFilter("finalizado")}
                  className={`flex-1 h-14 text-base font-semibold ${statusFilter === "finalizado" ? "bg-white text-black hover:bg-white/90" : "bg-white/20 text-white hover:bg-white/30"}`}
                >
                  <Check className="mr-2 h-5 w-5" />
                  FINALIZADO
                </Button>
              </div>
            </div>

            <div className="bg-white border-4 border-primary rounded-b-3xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold">Relatos</h1>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-muted-foreground mb-1">Comitês</span>
                  <Select value={comiteFilter} onValueChange={setComiteFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Comitê 1">Comitê 1</SelectItem>
                      <SelectItem value="Comitê 2">Comitê 2</SelectItem>
                      <SelectItem value="Comitê 3">Comitê 3</SelectItem>
                      <SelectItem value="Comitê 4">Comitê 4</SelectItem>
                      <SelectItem value="Comitê 5">Comitê 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredRelatos.map((relato) => (
                  <div
                    key={relato.id}
                    onClick={() => setSelectedRelato(relato.id)}
                    className="border-2 border-gray-300 rounded-2xl p-6 hover:border-primary cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold">{relato.categoria}</h3>
                      <div className="text-right">
                        <div className="text-sm font-semibold mb-4">Enviado</div>
                        <div className="text-sm font-semibold mb-2" >{relato.data}</div>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">{relato.descricao}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-5xl">
            <button
              onClick={() => setSelectedRelato(null)}
              className="flex items-center gap-2 text-foreground hover:text-primary mb-6 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="font-medium">Voltar</span>
            </button>

            <h1 className="text-4xl font-bold mb-8">Relatos</h1>

            <div className="border-4 border-primary rounded-3xl p-8">
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-2xl font-bold">{detailedRelato?.categoria}</h2>
                <div className="text-right">
                  <div className="text-sm font-semibold">Enviado</div>
                  <div className="text-sm">{detailedRelato?.data}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-4">Detalhes da Denuncia</h3>
                  <p className="text-sm leading-relaxed">{detailedRelato?.descricao}</p>
                </div>

                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2">Detalhes da Denuncia</h3>
                  <p className="text-xs leading-relaxed">
                    {detailedRelato?.envolvidos ? (<>
                      <span className="font-semibold">Envolvidos:</span> {detailedRelato.envolvidos}
                    </>) : null}
                    {detailedRelato?.relacao ? (<>
                      <br />
                      <span className="font-semibold">Relação:</span> {detailedRelato.relacao}
                    </>) : null}
                    {detailedRelato?.quemsabe ? (<>
                      <br />
                      <span className="font-semibold">Quem sabe:</span> {detailedRelato.quemsabe}
                    </>) : null}
                    {detailedRelato?.email ? (<>
                      <br />
                      <span className="font-semibold">Email:</span> {detailedRelato.email}
                    </>) : null}
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4">Evidencias</h3>
                <p className="text-sm leading-relaxed">{detailedRelato?.evidencias}</p>
              </div>

              {detailedRelato?.status === "finalizado" && finalResponses[selectedRelato] && (
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5" />
                    <h3 className="text-lg font-bold">Resposta Final</h3>
                  </div>
                  <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                    <p className="text-sm leading-relaxed">{finalResponses[selectedRelato]}</p>
                  </div>
                </div>
              )}

              {(detailedRelato?.status === "andamento" || detailedRelato?.status === "finalizado") && (
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-5 w-5" />
                    <h3 className="text-lg font-bold">Comentários sobre o Tratamento</h3>
                  </div>
                  <div className="space-y-4">
                    {comments[selectedRelato] && comments[selectedRelato].length > 0 ? (
                      comments[selectedRelato].map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-primary/10 border-l-4 border-primary rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-semibold text-primary">{comment.autor}</span>
                            <span className="text-xs text-muted-foreground">{comment.data}</span>
                          </div>
                          <p className="text-sm leading-relaxed">{comment.texto}</p>
                        </div>
                      ))
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          Nenhum comentário adicionado ainda.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Botões - SEM botão Transferir para operadores */}
              <div className="flex justify-end gap-4 mt-8">
                {detailedRelato?.status === "finalizado" ? (
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
                      onClick={() => setShowResponseDialog(true)}
                      className="bg-primary hover:bg-primary/90 text-white px-8"
                    >
                      Responder
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-2xl rounded-3xl border-4 border-primary p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-6">Responder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Mensagem</Label>
              <Textarea className="mt-2 min-h-32" placeholder="Digite sua resposta..." />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 text-white"
            onClick={() => setShowResponseDialog(false)}
            >Enviar Resposta</Button>
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
                placeholder="Descreva o motivo para reabrir este caso..." 
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button
                onClick={() => setShowReopenDialog(false)}
                variant="outline"
                className="px-8"
              >
                Cancelar
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white px-8"
                onClick={() => {
                  console.log("Caso reaberto:", selectedRelato)
                  setShowReopenDialog(false)
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
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
              <Label className="text-base font-semibold">Comentário</Label>
              <Textarea 
                className="mt-2 min-h-32" 
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
                onClick={() => {
                  if (commentText.trim() && selectedRelato) {
                    const newComment: Comment = {
                      id: Date.now(),
                      texto: commentText.trim(),
                      data: new Date().toLocaleDateString("pt-BR"),
                      autor: "Operador"
                    }
                    
                    setComments((prev) => ({
                      ...prev,
                      [selectedRelato]: [...(prev[selectedRelato] || []), newComment]
                    }))
                    
                    setShowCommentDialog(false)
                    setCommentText("")
                  }
                }}
                disabled={!commentText.trim()}
              >
                Salvar Comentário
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

