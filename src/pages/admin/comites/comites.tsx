import { HeaderAdmin } from "../homeadm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Search, UserPlus } from "lucide-react"

const mockComites = [
  { id: 1, nome: "Frank Oceano", integrantes: 4, status: "Ativo" },
  { id: 2, nome: "Frank Oceano", integrantes: 4, status: "Inativo" },
  { id: 3, nome: "Frank Oceano", integrantes: 4, status: "Ativo" },
  { id: 4, nome: "Frank Oceano", integrantes: 4, status: "Ativo" },
  { id: 5, nome: "Frank Oceano", integrantes: 4, status: "Inativo" },
  { id: 6, nome: "Frank Oceano", integrantes: 4, status: "Ativo" },
  { id: 7, nome: "Frank Oceano", integrantes: 4, status: "Ativo" },
]

export default function ComitesPage() {
  const navigate = useNavigate()
  const [showDialog, setShowDialog] = useState(false)

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
              <h1 className="text-4xl font-bold">Comites</h1>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Input placeholder="Buscar..." className="w-80 pl-10" />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <Button
                  onClick={() => setShowDialog(true)}
                  className="bg-accent hover:bg-accent/90 text-black font-semibold"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Cadastrar Comitê
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {mockComites.map((comite) => (
                <div
                  key={comite.id}
                  className="flex items-center justify-between bg-gray-100 rounded-full px-6 py-4 border border-gray-200"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-semibold">Comite:</span>
                    <span>{comite.nome}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 justify-center">
                    <span className="font-semibold">Integrantes:</span>
                    <span>{comite.integrantes}</span>
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
              <Textarea
                placeholder="Khamari&#10;Mac Miler&#10;Tyler The Creator&#10;Frank Ocean&#10;Andre 3000"
                className="bg-white min-h-48"
              />
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
    </div>
  )
}
