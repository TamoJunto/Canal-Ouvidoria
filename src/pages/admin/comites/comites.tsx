import { HeaderAdmin } from "@/components/headerAdmin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Search, UserPlus, Edit } from "lucide-react"

interface Usuario {
  id: number
  nome: string
  email: string
  status: "Ativo" | "Inativo"
}

interface Comite {
  id: number
  nome: string
  participantesIds: number[] // IDs dos usuários participantes
  status: "Ativo" | "Inativo"
}

// Mock de usuários ativos (normalmente viria de uma API ou contexto compartilhado)
const mockUsuariosAtivos: Usuario[] = [
  { id: 1, nome: "Frank Oceano", email: "frank.oceano@email.com", status: "Ativo" },
  { id: 3, nome: "j Cole", email: "maria.silva@email.com", status: "Ativo" },
  { id: 4, nome: "Drake", email: "joao.santos@email.com", status: "Ativo" },
  { id: 6, nome: "Travis Scott", email: "ana.costa@email.com", status: "Ativo" },
  { id: 7, nome: "Tyler, The Creator", email: "pedro.oliveira@email.com", status: "Ativo" },
  { id: 8, nome: "Kanye West", email: "carla.souza@email.com", status: "Ativo" },
  { id: 9, nome: "MF DOOM", email: "roberto.lima@email.com", status: "Ativo" },
  { id: 10, nome: "Mac Miller", email: "juliana.ferreira@email.com", status: "Ativo" },
]

const mockComites: Comite[] = [
  { id: 1, nome: "Comitê 1", participantesIds: [1, 3, 4], status: "Ativo" },
  { id: 2, nome: "Comitê 2", participantesIds: [6, 7], status: "Inativo" },
  { id: 3, nome: "Comitê 3", participantesIds: [4, 8, 9], status: "Ativo" },
  { id: 4, nome: "Comitê 4", participantesIds: [1, 6, 10], status: "Ativo" },
  { id: 5, nome: "Comitê 5", participantesIds: [3, 7], status: "Inativo" },
  { id: 6, nome: "Comitê 6", participantesIds: [8, 9, 10], status: "Ativo" },
  { id: 7, nome: "Comitê 7", participantesIds: [1, 4, 6, 7], status: "Ativo" },
]

export default function ComitesPage() {
  const navigate = useNavigate()
  const [showDialog, setShowDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [equipeFilter, setEquipeFilter] = useState("Comitê")
  const [comites, setComites] = useState<Comite[]>(mockComites)
  const [selectedComite, setSelectedComite] = useState<Comite | null>(null)
  const [editForm, setEditForm] = useState({
    nome: "",
    participantesIds: [] as number[],
    status: "Ativo" as "Ativo" | "Inativo"
  })

  const handleEditComite = (comite: Comite) => {
    setSelectedComite(comite)
    setEditForm({
      nome: comite.nome,
      participantesIds: [...comite.participantesIds],
      status: comite.status
    })
    setShowEditDialog(true)
  }

  const toggleParticipante = (usuarioId: number) => {
    setEditForm(prev => {
      if (prev.participantesIds.includes(usuarioId)) {
        return {
          ...prev,
          participantesIds: prev.participantesIds.filter(id => id !== usuarioId)
        }
      } else {
        return {
          ...prev,
          participantesIds: [...prev.participantesIds, usuarioId]
        }
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderAdmin />
      <main className="flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-6xl">
          <h1 className="text-4xl font-bold items-center text-center">Comites</h1>
          <button 
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-foreground hover:text-primary mb-6 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium">Voltar</span>
          </button>

          <div className="border-4 border-primary rounded-3xl p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Input placeholder="Buscar..." className="w-80 pl-10 border-primary" />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <Select value={equipeFilter} onValueChange={setEquipeFilter}>
                    <SelectTrigger className="w-48 text-black border-primary">
                      <SelectValue placeholder="Selecione a equipe" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      <SelectItem value="Comitê 1">Comitê 1</SelectItem>
                      <SelectItem value="Comitê 2">Comitê 2</SelectItem>
                      <SelectItem value="Comitê 3">Comitê 3</SelectItem>
                      <SelectItem value="Comitê 4">Comitê 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => setShowDialog(true)}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Cadastrar Comitê
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {comites.map((comite) => (
                <div
                  key={comite.id}
                  onClick={() => handleEditComite(comite)}
                  className="flex items-center justify-between bg-gray-100 rounded-full px-6 py-4 border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-semibold">Comite:</span>
                    <span>{comite.nome}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 justify-center">
                    <span className="font-semibold">Integrantes:</span>
                    <span>{comite.participantesIds.length}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="font-semibold">Status:</span>
                    <span className={comite.status === "Ativo" ? "text-green-600 font-semibold" : "text-gray-400"}>
                      {comite.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md rounded-3xl bg-primary p-8">
          <button
            onClick={() => setShowDialog(false)}
            className="flex items-center gap-2 text-white hover:text-white/80 mb-4"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium">Previous</span>
          </button>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-white mb-6">Cadastro Comites</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input placeholder="Nome Equipe" className="bg-white" />
            </div>
            <div>
              <label className="text-white font-semibold mb-2 block">Participantes</label>
              <div className="bg-white rounded-lg p-4 max-h-64 overflow-y-auto border border-gray-200">
                <div className="space-y-3">
                  {mockUsuariosAtivos.map((usuario) => (
                    <div
                      key={usuario.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <Checkbox
                        id={`cadastro-usuario-${usuario.id}`}
                      />
                      <Label
                        htmlFor={`cadastro-usuario-${usuario.id}`}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        <div>
                          <div className="font-medium">{usuario.nome}</div>
                          <div className="text-xs text-muted-foreground">{usuario.email}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button className="flex-1 bg-white text-black hover:bg-white/90 font-semibold">
                <UserPlus className="mr-2 h-4 w-4" />
                Cadastrar
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-white text-black hover:bg-white/90 font-semibold"
                onClick={() => setShowDialog(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={(open) => {
        setShowEditDialog(open)
        if (!open) {
          setSelectedComite(null)
        }
      }}>
        <DialogContent className="max-w-md rounded-3xl bg-primary border-4 border-white p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2 text-white">
              <Edit className="h-5 w-5" />
              Editar Comitê
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold mb-2 block text-white">Nome do Comitê</Label>
              <Input 
                placeholder="Nome do Comitê" 
                value={editForm.nome}
                onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                className="bg-white" 
              />
            </div>
            <div>
              <Label className="text-base font-semibold mb-2 block text-white">Participantes</Label>
              <div className="bg-white rounded-lg p-4 max-h-64 overflow-y-auto border border-gray-200">
                <div className="space-y-3">
                  {mockUsuariosAtivos.map((usuario) => (
                    <div
                      key={usuario.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => toggleParticipante(usuario.id)}
                    >
                      <Checkbox
                        id={`usuario-${usuario.id}`}
                        checked={editForm.participantesIds.includes(usuario.id)}
                        onCheckedChange={() => toggleParticipante(usuario.id)}
                      />
                      <Label
                        htmlFor={`usuario-${usuario.id}`}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        <div>
                          <div className="font-medium">{usuario.nome}</div>
                          <div className="text-xs text-muted-foreground">{usuario.email}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-white/80 mt-2">
                {editForm.participantesIds.length} integrante(s) selecionado(s)
              </p>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-base font-semibold">Status</Label>
                <p className="text-sm text-muted-foreground">
                  {editForm.status === "Ativo" ? "Comitê ativo no sistema" : "Comitê inativo no sistema"}
                </p>
              </div>
              <Switch
                checked={editForm.status === "Ativo"}
                onCheckedChange={(checked: boolean) => {
                  setEditForm({ ...editForm, status: checked ? "Ativo" : "Inativo" })
                }}
              />
            </div>
            <div className="flex gap-4 pt-4">
              <Button 
                className="flex-1 font-semibold bg-white text-black hover:bg-white/90"
                onClick={() => {
                  if (selectedComite) {
                    setComites(comites.map(c => 
                      c.id === selectedComite.id 
                        ? { ...c, ...editForm }
                        : c
                    ))
                    setShowEditDialog(false)
                    setSelectedComite(null)
                  }
                }}
              >
                Salvar Alterações
              </Button>
              <Button
                variant="outline"
                className="flex-1 font-semibold"
                onClick={() => {
                  setShowEditDialog(false)
                  setSelectedComite(null)
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
