import { HeaderAdmin } from "../homeadm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Search, UserPlus } from "lucide-react"

const mockUsuarios = [
  { id: 1, nome: "Frank Oceano", comite: "Blond", status: "Ativo", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 2, nome: "Frank Oceano", comite: "Blond", status: "Inativo", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 3, nome: "Frank Oceano", comite: "Blond", status: "Ativo", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 4, nome: "Frank Oceano", comite: "Blond", status: "Ativo", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 5, nome: "Frank Oceano", comite: "Blond", status: "Inativo", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 6, nome: "Frank Oceano", comite: "Blond", status: "Ativo", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 7, nome: "Frank Oceano", comite: "Blond", status: "Ativo", avatar: "/placeholder.svg?height=40&width=40" },
]

export default function UsuariosPage() {
  const navigate = useNavigate()
  const [showDialog, setShowDialog] = useState(false)
  const [equipeFilter, setEquipeFilter] = useState("Comitê")

  return (
    <div className="min-h-screen bg-background">
      <HeaderAdmin />
      <main className="flex flex-col items-center px-4 py-8">
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
              <h1 className="text-4xl font-bold">USUARIOS</h1>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Input placeholder="Buscar..." className="w-80 pl-10" />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-muted-foreground mb-1">Equipes</span>
                  <Select value={equipeFilter} onValueChange={setEquipeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Comitê">Comitê</SelectItem>
                      <SelectItem value="Comitê 1">Comitê 1</SelectItem>
                      <SelectItem value="Comitê 2">Comitê 2</SelectItem>
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
              {mockUsuarios.map((usuario) => (
                <div
                  key={usuario.id}
                  className="flex items-center justify-between bg-gray-100 rounded-full px-6 py-4 border border-gray-200"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={usuario.avatar || "/placeholder.svg"}
                      alt={usuario.nome}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <span className="font-semibold">Nome:</span>
                    <span>{usuario.nome}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 justify-center">
                    <span className="font-semibold">Comitê:</span>
                    <span>{usuario.comite}</span>
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
              <Input placeholder="Celular" className="bg-white" />
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
    </div>
  )
}
