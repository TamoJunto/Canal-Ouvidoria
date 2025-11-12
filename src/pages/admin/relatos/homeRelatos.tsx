import { HeaderAdmin } from "../homeadm"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Mail, Clock, Check } from "lucide-react"

const mockRelatos = [
  {
    id: 1,
    categoria: "SAUDE E SEGURANÇA",
    descricao:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus pronin sapien nunc accuan eget.",
    evidencias:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus pronin sapien nunc accuan eget.",
    data: "11/12/2025",
    status: "nova",
  },
  {
    id: 2,
    categoria: "AMEAÇA / AGRESSÃO",
    descricao:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus pronin sapien nunc accuan eget.",
    evidencias: "Sem evidências anexadas.",
    data: "11/12/2025",
    status: "andamento",
  },
  {
    id: 3,
    categoria: "FRAUDE",
    descricao:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus pronin sapien nunc accuan eget.",
    evidencias: "Documentos anexados.",
    data: "11/12/2025",
    status: "finalizado",
  },
]

export default function RelatosPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState("nova")
  const [comiteFilter, setComiteFilter] = useState("Comitê 1")
  const [selectedRelato, setSelectedRelato] = useState<number | null>(null)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showResponseDialog, setShowResponseDialog] = useState(false)

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
                        <div className="text-sm font-semibold">Enviado</div>
                        <div className="text-sm">{relato.data}</div>
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

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2">Detalhes da Denuncia</h3>
                  <p className="text-xs leading-relaxed">
                    s parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis
                    tellus mollis orci, sed rhoncus pronin sapien nunc accuan eget.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4">Evidencias</h3>
                <p className="text-sm leading-relaxed">{detailedRelato?.evidencias}</p>
              </div>

              <div className="flex justify-end gap-4 mt-8">
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
                  Responder
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="max-w-2xl rounded-3xl border-4 border-primary p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-6">Transferir para Equipe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Comite</Label>
              <Select defaultValue="comite1">
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comite1">Comitê 1</SelectItem>
                  <SelectItem value="comite2">Comitê 2</SelectItem>
                  <SelectItem value="comite3">Comitê 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
            <Button className="w-full bg-primary hover:bg-primary/90 text-white">Enviar Resposta</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
