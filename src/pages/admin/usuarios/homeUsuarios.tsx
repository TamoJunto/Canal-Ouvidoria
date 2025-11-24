import { HeaderAdmin } from "@/components/headerAdmin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Search, UserPlus, Edit } from "lucide-react"

interface Usuario {
  id: number
  nome: string
  email: string
  comite: string
  status: "Ativo" | "Inativo"
  avatar: string
}

const mockUsuarios: Usuario[] = [
  { id: 1, nome: "Frank Oceano", email: "frank.oceano@email.com", comite: "Comitê 1", status: "Ativo", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 2, nome: "Frank Oceano", email: "frank.oceano2@email.com", comite: "Comitê 2", status: "Inativo", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 3, nome: "Frank Oceano", email: "frank.oceano3@email.com", comite: "Comitê 1", status: "Ativo", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 4, nome: "Frank Oceano", email: "frank.oceano4@email.com", comite: "Comitê 3", status: "Ativo", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 5, nome: "Frank Oceano", email: "frank.oceano5@email.com", comite: "Comitê 2", status: "Inativo", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 6, nome: "Frank Oceano", email: "frank.oceano6@email.com", comite: "Comitê 4", status: "Ativo", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 7, nome: "Frank Oceano", email: "frank.oceano7@email.com", comite: "Comitê 1", status: "Ativo", avatar: "/placeholder.svg?height=40&width=40" },
]

export default function UsuariosPage() {
  const navigate = useNavigate()
  const [showDialog, setShowDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [equipeFilter, setEquipeFilter] = useState("Comitê")
  const [usuarios, setUsuarios] = useState<Usuario[]>(mockUsuarios)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [editForm, setEditForm] = useState({
    nome: "",
    email: "",
    comite: "",
    status: "Ativo" as "Ativo" | "Inativo"
  })

  const handleEditUsuario = (usuario: Usuario) => {
    setSelectedUsuario(usuario)
    setEditForm({
      nome: usuario.nome,
      email: usuario.email,
      comite: usuario.comite,
      status: usuario.status
    })
    setShowEditDialog(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderAdmin />
      <main className="flex flex-col items-center px-4 py-8">
          <h1 className="text-4xl font-bold items-center text-center">USUARIOS</h1>
        <div className="w-full max-w-6xl">
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
                    <SelectTrigger className="w-48 text-black border-primary text-black">
                      <SelectValue placeholder="Selecione a equipe" className="text-black" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      <SelectItem value="Comitê 1">Comitê 1</SelectItem>
                      <SelectItem value="Comitê 2">Comitê 2</SelectItem>
                      <SelectItem value="Comitê 3">Comitê 3</SelectItem>
                      <SelectItem value="Comitê 4">Comitê 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => setShowDialog(true)} className="bg-primary hover:bg-primary/90 text-white">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Cadastrar Usuario
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {usuarios.map((usuario) => (
                <div
                  key={usuario.id}
                  onClick={() => handleEditUsuario(usuario)}
                  className="flex items-center justify-between bg-gray-100 rounded-full px-6 py-4 border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className="font-semibold">Nome: {usuario.nome}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 justify-center">
                    <span className="font-semibold">Comitê: {usuario.comite}</span>
                    
                  </div>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="font-semibold">Status:</span>
                    <span className={usuario.status === "Ativo" ? "text-green-600 font-semibold" : "text-gray-400"}>
                      {usuario.status}
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
            <DialogTitle className="text-2xl font-bold text-center text-white mb-6">Cadastro Usuários</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input placeholder="Nome" className="bg-white" />
            </div>
            <div>
              <Input placeholder="Email" className="bg-white" />
            </div>
            <RadioGroup defaultValue="associado" className="flex gap-8 justify-center py-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="associado" id="associado" className="border-white text-white" />
                <Label htmlFor="associado" className="text-white font-medium cursor-pointer">
                  Associado
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="administrador" id="administrador" className="border-white text-white" />
                <Label htmlFor="administrador" className="text-white font-medium cursor-pointer">
                  Administrador
                </Label>
              </div>
            </RadioGroup>
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
          setSelectedUsuario(null)
        }
      }}>
        <DialogContent className="max-w-md rounded-3xl bg-primary border-4 border-white p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2 text-white">
              <Edit className="h-5 w-5" />
              Editar Usuário
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold mb-2 block text-white">Nome</Label>
              <Input 
                placeholder="Nome" 
                value={editForm.nome}
                onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                className="bg-white" 
              />
            </div>
            <div>
              <Label className="text-base font-semibold mb-2 block text-white">Email (Login)</Label>
              <Input 
                type="email"
                placeholder="email@exemplo.com" 
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="bg-white" 
              />
            </div>
            <div>
              <Label className="text-base font-semibold mb-2 block text-white">Comitê</Label>
              <Select value={editForm.comite} onValueChange={(value) => setEditForm({ ...editForm, comite: value })}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione o comitê" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Comitê 1">Comitê 1</SelectItem>
                  <SelectItem value="Comitê 2">Comitê 2</SelectItem>
                  <SelectItem value="Comitê 3">Comitê 3</SelectItem>
                  <SelectItem value="Comitê 4">Comitê 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-base font-semibold">Status</Label>
                <p className="text-sm text-muted-foreground">
                  {editForm.status === "Ativo" ? "Usuário ativo no sistema" : "Usuário inativo no sistema"}
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
                  if (selectedUsuario) {
                    setUsuarios(usuarios.map(u => 
                      u.id === selectedUsuario.id 
                        ? { ...u, ...editForm }
                        : u
                    ))
                    setShowEditDialog(false)
                    setSelectedUsuario(null)
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
                  setSelectedUsuario(null)
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
