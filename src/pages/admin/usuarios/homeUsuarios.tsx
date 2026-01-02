import { HeaderAdmin } from "@/components/headerAdmin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Search, UserPlus, Edit, Loader2 } from "lucide-react"
import { usuariosApi, comitesApi } from "@/services"
import type { Usuario, Comite } from "@/services"

export default function UsuariosPage() {
  const navigate = useNavigate()
  const [showDialog, setShowDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [equipeFilter, setEquipeFilter] = useState("")
  const [searchText, setSearchText] = useState("")
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [comites, setComites] = useState<Comite[]>([])
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [novoUsuario, setNovoUsuario] = useState({
    nome: "",
    email: "",
    tipo: "OPERADOR" as "OPERADOR" | "ADMIN_MASTER",
    comiteId: null as string | null,
  })
  const [editForm, setEditForm] = useState({
    nome: "",
    email: "",
    tipo: "OPERADOR" as "OPERADOR" | "ADMIN_MASTER",
    comiteId: null as string | null,
    ativo: true
  })

  useEffect(() => {
    loadUsuarios()
    loadComites()
  }, [])

  const loadUsuarios = async () => {
    setLoading(true)
    try {
      console.log('Carregando usuários do backend...')
      const data = await usuariosApi.listarUsuarios()
      console.log('Usuários carregados:', data)
      console.log('Total de usuários:', data?.length)
      console.log('Tipo de data:', typeof data, Array.isArray(data))
      setUsuarios(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('ERRO COMPLETO ao carregar usuários:', error)
      console.error('Response:', error.response?.data)
      console.error('Status:', error.response?.status)
      setUsuarios([])
    } finally {
      setLoading(false)
    }
  }

  const loadComites = async () => {
    try {
      const data = await comitesApi.listarComites()
      setComites(data || [])
    } catch (error) {
      console.error('Erro ao carregar comitês:', error)
      setComites([])
    }
  }

  // Filtrar usuários localmente
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const usuarioData = usuario as any
    
    // Filtro de busca por nome ou email
    const matchSearch = searchText === "" || 
      usuarioData.nome.toLowerCase().includes(searchText.toLowerCase()) ||
      usuarioData.email.toLowerCase().includes(searchText.toLowerCase())
    
    // Filtro por comitê
    const matchComite = equipeFilter === "" || 
      usuarioData.comite_nome === equipeFilter
    
    return matchSearch && matchComite
  })

  const handleEditUsuario = (usuario: Usuario) => {
    setSelectedUsuario(usuario)
    const usuarioData = usuario as any
    setEditForm({
      nome: usuarioData.nome,
      email: usuarioData.email,
      tipo: usuarioData.tipo,
      comiteId: usuarioData.comite_id || null,
      ativo: usuarioData.ativo
    })
    setShowEditDialog(true)
  }

  const handleCreateUsuario = async () => {
    if (!novoUsuario.nome || !novoUsuario.email) {
      alert('Preencha nome e email')
      return
    }
    setActionLoading(true)
    try {
      const payload: any = {
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        tipo: novoUsuario.tipo,
      }
      
      // Só envia comiteId se for um UUID válido
      if (novoUsuario.comiteId && novoUsuario.comiteId !== 'none') {
        payload.comiteId = novoUsuario.comiteId
      }
      
      await usuariosApi.createUsuario(payload)
      alert('Usuário criado com sucesso!')
      setShowDialog(false)
      setNovoUsuario({
        nome: "",
        email: "",
        tipo: "OPERADOR",
        comiteId: null,
      })
      await loadUsuarios()
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error)
      alert(error.response?.data?.message || error.response?.data?.error?.message || 'Erro ao criar usuário')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateUsuario = async () => {
    if (!selectedUsuario) return
    setActionLoading(true)
    try {
      const payload: any = {
        nome: editForm.nome,
        email: editForm.email,
        tipo: editForm.tipo,
      }
      
      // Só envia comiteId se for um UUID válido
      if (editForm.comiteId && editForm.comiteId !== 'null' && editForm.comiteId !== 'none') {
        payload.comiteId = editForm.comiteId
      }
      
      await usuariosApi.updateUsuario(selectedUsuario.id as any, payload)
      
      if (editForm.ativo !== selectedUsuario.ativo) {
        if (editForm.ativo) {
          await usuariosApi.reativarUsuario(selectedUsuario.id as any)
        } else {
          await usuariosApi.desativarUsuario(selectedUsuario.id as any)
        }
      }
      alert('Usuário atualizado com sucesso!')
      setShowEditDialog(false)
      setSelectedUsuario(null)
      
      // Pequeno delay para garantir que o backend processou
      setTimeout(async () => {
        await loadUsuarios()
      }, 500)
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error)
      alert(error.response?.data?.message || error.response?.data?.error?.message || 'Erro ao atualizar usuário')
    } finally {
      setActionLoading(false)
    }
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
                  <Input 
                    placeholder="Buscar por nome ou email..." 
                    className="w-80 pl-10 border-primary"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <Select value={equipeFilter || "todos"} onValueChange={(value) => setEquipeFilter(value === "todos" ? "" : value)}>
                    <SelectTrigger className="w-48 text-black border-primary">
                      <SelectValue placeholder="Filtrar por comitê" className="text-black" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      <SelectItem value="todos">Todos os comitês</SelectItem>
                      {comites.map((comite) => (
                        <SelectItem key={comite.id} value={comite.nome}>
                          {comite.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => setShowDialog(true)} className="bg-primary hover:bg-primary/90 text-white">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Cadastrar Usuario
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Carregando usuários...</p>
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {usuarios.length === 0 
                  ? 'Nenhum usuário encontrado.'
                  : 'Nenhum usuário encontrado com os filtros aplicados.'}
              </div>
            ) : (
            <div className="space-y-3">
                {usuariosFiltrados.map((usuario) => (
                <div
                  key={usuario.id}
                  onClick={() => handleEditUsuario(usuario)}
                  className="flex items-center justify-between bg-gray-100 rounded-full px-6 py-4 border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors"
                >
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="font-semibold">{usuario.nome}</span>
                      <span className="text-sm text-muted-foreground">{usuario.email}</span>
                  </div>
                    <div className="flex flex-col gap-1 flex-1 items-center">
                      <span className="text-sm font-semibold">
                        {(usuario as any).tipo === 'ADMIN_MASTER' ? 'Admin Master' : 'Operador'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(usuario as any).comite_nome || 'Sem comitê'}
                      </span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="font-semibold">Status:</span>
                      <span className={usuario.ativo ? "text-green-600 font-semibold" : "text-gray-400"}>
                        {usuario.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
              ))}
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
            <DialogTitle className="text-2xl font-bold text-center text-white mb-6">Cadastro Usuários</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white font-semibold mb-2 block">Nome</Label>
              <Input 
                placeholder="Nome completo" 
                className="bg-white"
                value={novoUsuario.nome}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-white font-semibold mb-2 block">Email</Label>
              <Input 
                placeholder="email@exemplo.com" 
                type="email"
                className="bg-white"
                value={novoUsuario.email}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-white font-semibold mb-2 block">Perfil</Label>
              <RadioGroup 
                value={novoUsuario.tipo} 
                onValueChange={(value) => setNovoUsuario({ ...novoUsuario, tipo: value as any })}
                className="flex gap-8 justify-center py-4"
              >
              <div className="flex items-center space-x-2">
                  <RadioGroupItem value="OPERADOR" id="operador" className="border-white text-white" />
                  <Label htmlFor="operador" className="text-white font-medium cursor-pointer">
                    Operador
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ADMIN_MASTER" id="admin" className="border-white text-white" />
                  <Label htmlFor="admin" className="text-white font-medium cursor-pointer">
                    Admin Master
                </Label>
              </div>
            </RadioGroup>
            </div>
            <div>
              <Label className="text-white font-semibold mb-2 block">Comitê (opcional)</Label>
              <Select value={novoUsuario.comiteId || "none"} onValueChange={(value) => setNovoUsuario({ ...novoUsuario, comiteId: value === "none" ? null : value })}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione um comitê" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {comites.map((comite) => (
                    <SelectItem key={comite.id} value={comite.id.toString()}>
                      {comite.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleCreateUsuario}
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
              <Label className="text-base font-semibold mb-2 block text-white">Perfil</Label>
              <RadioGroup 
                value={editForm.tipo} 
                onValueChange={(value) => setEditForm({ ...editForm, tipo: value as any })}
                className="flex gap-8 justify-center py-2 bg-white/10 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="OPERADOR" id="edit-operador" className="border-white text-white" />
                  <Label htmlFor="edit-operador" className="text-white font-medium cursor-pointer">
                    Operador
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ADMIN_MASTER" id="edit-admin" className="border-white text-white" />
                  <Label htmlFor="edit-admin" className="text-white font-medium cursor-pointer">
                    Admin Master
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label className="text-base font-semibold mb-2 block text-white">Comitê (opcional)</Label>
              <Select value={editForm.comiteId || "none"} onValueChange={(value) => setEditForm({ ...editForm, comiteId: value === "none" ? null : value })}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione o comitê" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {comites.map((comite) => (
                    <SelectItem key={comite.id} value={comite.id.toString()}>
                      {comite.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="text-base font-semibold">Status</Label>
                <p className="text-sm text-muted-foreground">
                  {editForm.ativo ? "Usuário ativo no sistema" : "Usuário inativo no sistema"}
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
                onClick={handleUpdateUsuario}
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
