import { HeaderAdmin } from "@/components/headerAdmin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Search, UserPlus, Edit, Loader2 } from "lucide-react"
import { comitesApi, usuariosApi } from "@/services"
import type { Comite, Usuario } from "@/services"

export default function ComitesPage() {
  const navigate = useNavigate()
  const [showDialog, setShowDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [equipeFilter, setEquipeFilter] = useState("")
  const [searchText, setSearchText] = useState("")
  const [comites, setComites] = useState<Comite[]>([])
  const [comitesComDetalhes, setComitesComDetalhes] = useState<Comite[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [selectedComite, setSelectedComite] = useState<Comite | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedMembros, setSelectedMembros] = useState<string[]>([])
  const [novoComite, setNovoComite] = useState({
    nome: "",
    descricao: "",
  })
  const [editForm, setEditForm] = useState({
    nome: "",
    descricao: "",
    ativo: true
  })

  useEffect(() => {
    loadComites()
    loadUsuarios()
  }, [])

  const loadComites = async () => {
    setLoading(true)
    try {
      const data = await comitesApi.listarComites()
      setComites(data || [])
      
      // Busca detalhes de cada comitê para pegar os nomes dos membros
      const detalhesPromises = data.map(async (comite) => {
        try {
          const detalhes = await comitesApi.getComiteById(comite.id as any)
          return detalhes
        } catch (error) {
          console.error('Erro ao buscar detalhes do comitê:', comite.id, error)
          return comite
        }
      })
      
      const comitesCompletos = await Promise.all(detalhesPromises)
      setComitesComDetalhes(comitesCompletos)
    } catch (error) {
      console.error('Erro ao carregar comitês:', error)
      setComites([])
      setComitesComDetalhes([])
    } finally {
      setLoading(false)
    }
  }

  const loadUsuarios = async () => {
    try {
      const data = await usuariosApi.listarUsuarios()
      setUsuarios(data || [])
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      setUsuarios([])
    }
  }

  const handleEditComite = async (comite: Comite) => {
    setSelectedComite(comite)
    setEditForm({
      nome: comite.nome,
      descricao: comite.descricao || "",
      ativo: comite.ativo
    })
    
    // Busca detalhes completos do comitê para pegar os membros
    try {
      console.log('Buscando detalhes do comitê:', comite.id)
      const detalhesComite = await comitesApi.getComiteById(comite.id as any)
      console.log('Detalhes retornados:', detalhesComite)
      console.log('Membros:', detalhesComite?.membros)
      const membrosIds = detalhesComite?.membros?.map(m => m.id.toString()) || []
      setSelectedMembros(membrosIds)
    } catch (error: any) {
      console.error('Erro ao carregar membros:', error)
      console.error('Response:', error.response?.data)
      setSelectedMembros([])
    }
    
    setShowEditDialog(true)
  }

  const toggleMembro = (usuarioId: string) => {
    if (selectedMembros.includes(usuarioId)) {
      setSelectedMembros(selectedMembros.filter(id => id !== usuarioId))
    } else {
      setSelectedMembros([...selectedMembros, usuarioId])
    }
  }

  // Filtrar comitês
  const comitesParaExibir = comitesComDetalhes.length > 0 ? comitesComDetalhes : comites
  const comitesFiltrados = comitesParaExibir.filter((comite) => {
    const matchSearch = searchText === "" || 
      comite.nome.toLowerCase().includes(searchText.toLowerCase()) ||
      (comite.descricao && comite.descricao.toLowerCase().includes(searchText.toLowerCase()))
    
    const matchStatus = equipeFilter === "" || equipeFilter === "todos" ||
      (equipeFilter === "ativos" && comite.ativo) ||
      (equipeFilter === "inativos" && !comite.ativo)
    
    return matchSearch && matchStatus
  })

  const handleCreateComite = async () => {
    if (!novoComite.nome) {
      alert('Digite o nome do comitê')
      return
    }
    setActionLoading(true)
    try {
      await comitesApi.createComite(novoComite)
      alert('Comitê criado com sucesso!')
      setShowDialog(false)
      setNovoComite({ nome: "", descricao: "" })
      await loadComites()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao criar comitê')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateComite = async () => {
    if (!selectedComite) return
    setActionLoading(true)
    try {
      // 1. Atualiza nome e descrição
      await comitesApi.updateComite(selectedComite.id as any, {
        nome: editForm.nome,
        descricao: editForm.descricao,
      })
      
      // 2. Atualiza status
      if (editForm.ativo !== selectedComite.ativo) {
        if (editForm.ativo) {
          await comitesApi.reativarComite(selectedComite.id as any)
        } else {
          await comitesApi.desativarComite(selectedComite.id as any)
        }
      }
      
      // 3. Atualiza membros
      const membrosAtuais = selectedComite.membros?.map(m => m.id.toString()) || []
      const membrosAdicionados = selectedMembros.filter(id => !membrosAtuais.includes(id))
      const membrosRemovidos = membrosAtuais.filter(id => !selectedMembros.includes(id))
      
      // Adiciona novos membros
      for (const usuarioId of membrosAdicionados) {
        try {
          await comitesApi.addMembro(selectedComite.id.toString(), usuarioId)
        } catch (error) {
          console.error('Erro ao adicionar membro:', error)
        }
      }
      
      // Remove membros
      for (const usuarioId of membrosRemovidos) {
        try {
          await comitesApi.removeMembro(selectedComite.id.toString(), usuarioId)
        } catch (error) {
          console.error('Erro ao remover membro:', error)
        }
      }
      
      alert('Comitê atualizado com sucesso!')
      setShowEditDialog(false)
      setSelectedComite(null)
      setSelectedMembros([])
      await loadComites()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao atualizar comitê')
    } finally {
      setActionLoading(false)
    }
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
                  <Input 
                    placeholder="Buscar por nome..." 
                    className="w-80 pl-10 border-primary"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <Select value={equipeFilter || "todos"} onValueChange={(value) => setEquipeFilter(value === "todos" ? "" : value)}>
                    <SelectTrigger className="w-48 text-black border-primary">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="ativos">Ativos</SelectItem>
                      <SelectItem value="inativos">Inativos</SelectItem>
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

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Carregando comitês...</p>
              </div>
            ) : comitesFiltrados.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {comites.length === 0 
                  ? 'Nenhum comitê encontrado.'
                  : 'Nenhum comitê encontrado com os filtros aplicados.'}
              </div>
            ) : (
              <div className="space-y-3">
                {comitesFiltrados.map((comite) => {
                  const membrosNomes = comite.membros?.map(m => m.nome).join(", ") || "Sem membros"
                  const totalMembros = comite.membros?.length || 0

                  return (
                    <div
                      key={comite.id}
                      onClick={() => handleEditComite(comite)}
                      className="flex items-center justify-between bg-gray-100 rounded-3xl px-6 py-4 border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      <div className="flex flex-col gap-1 flex-1 pr-4">
                        <span className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Comitê</span>
                        <span className="font-medium text-lg">{comite.nome}</span>
                        {comite.descricao && (
                          <span className="text-xs text-muted-foreground">{comite.descricao}</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 flex-[1.2] items-center text-center">
                        <span className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                          Integrantes ({totalMembros})
                        </span>
                        <span className="text-sm text-gray-600 line-clamp-2">
                          {membrosNomes}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 flex-1 items-end">
                        <span className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Status</span>
                        <span className={comite.ativo ? "text-green-600 font-semibold" : "text-gray-400"}>
                          {comite.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
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
              <Label className="text-white font-semibold mb-2 block">Nome do Comitê</Label>
              <Input 
                placeholder="Nome do Comitê" 
                className="bg-white"
                value={novoComite.nome}
                onChange={(e) => setNovoComite({ ...novoComite, nome: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-white font-semibold mb-2 block">Descrição (opcional)</Label>
              <Textarea
                placeholder="Descrição do comitê..."
                className="bg-white"
                value={novoComite.descricao}
                onChange={(e) => setNovoComite({ ...novoComite, descricao: e.target.value })}
              />
            </div>
            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleCreateComite}
                disabled={actionLoading}
                className="flex-1 bg-white text-black hover:bg-white/90 font-semibold"
              >
                {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
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
              <Label className="text-base font-semibold mb-2 block text-white">Descrição</Label>
              <Textarea
                placeholder="Descrição do comitê..."
                value={editForm.descricao}
                onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
                className="bg-white"
              />
            </div>
            <div>
              <Label className="text-base font-semibold mb-2 block text-white">Membros do Comitê</Label>
              <div className="bg-white rounded-lg p-4 max-h-64 overflow-y-auto">
                {usuarios.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center">Nenhum usuário disponível</p>
                ) : (
                  <div className="space-y-3">
                    {usuarios.map((usuario) => (
                      <div
                        key={usuario.id}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => toggleMembro(usuario.id.toString())}
                      >
                        <Checkbox
                          id={`membro-${usuario.id}`}
                          checked={selectedMembros.includes(usuario.id.toString())}
                          onCheckedChange={() => toggleMembro(usuario.id.toString())}
                        />
                        <Label
                          htmlFor={`membro-${usuario.id}`}
                          className="flex-1 cursor-pointer font-normal"
                        >
                          <div>
                            <div className="font-medium">{usuario.nome}</div>
                            <div className="text-xs text-muted-foreground">
                              {usuario.email} | {(usuario as any).tipo === 'ADMIN_MASTER' ? 'Admin' : 'Operador'}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-white/80 mt-2">
                {selectedMembros.length} membro(s) selecionado(s)
              </p>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-base font-semibold">Status</Label>
                <p className="text-sm text-muted-foreground">
                  {editForm.ativo ? "Comitê ativo no sistema" : "Comitê inativo no sistema"}
                </p>
              </div>
              <Switch
                checked={editForm.ativo}
                onCheckedChange={(checked: boolean) => {
                  setEditForm({ ...editForm, ativo: checked })
                }}
              />
            </div>
            <div className="flex gap-4 pt-4">
              <Button 
                className="flex-1 font-semibold bg-white text-black hover:bg-white/90"
                onClick={handleUpdateComite}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Salvar Alterações
              </Button>
              <Button
                variant="outline"
                className="flex-1 font-semibold"
                onClick={() => {
                  setShowEditDialog(false)
                  setSelectedComite(null)
                  setSelectedMembros([])
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

