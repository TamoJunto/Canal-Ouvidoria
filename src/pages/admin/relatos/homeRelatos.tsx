import { HeaderAdmin } from "@/components/headerAdmin"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { ChevronLeft, Mail, Clock, Check, MessageSquare, RotateCcw, FileText } from "lucide-react"

const mockRelatos = [
  // --- 6 NOVOS ---
  {
    id: 1,
    categoria: "ASSÉDIO MORAL",
    descricao:
      "O gerente da área de Vendas, Sr. Silva, humilha a equipe em reuniões, usando palavras de baixo calão e fazendo ameaças constantes de demissão se as metas não forem batidas.",
    evidencias: "Tenho uma gravação de áudio da última reunião (anexo).",
    envolvidos: "", // Caso Anônimo (Email Apenas)
    relacao: "", // Caso Anônimo (Email Apenas)
    quemsabe: "", // Caso Anônimo (Email Apenas)
    email: "equipe.vendas.desgastada@email.com",
    data: "14/11/2025",
    status: "nova",
  },
  {
    id: 2,
    categoria: "SAUDE E SEGURANÇA",
    descricao:
      "A máquina de prensa 03 está sem a grade de proteção obrigatória. A trava de segurança foi 'amarrada' para produzir mais rápido. Um operador quase perdeu a mão hoje.",
    evidencias: "Fotos da máquina e da 'gambiarra' na trava.",
    envolvidos: "Supervisor de Produção (Carlos)",
    relacao: "Operador de Máquina (Turno B)",
    quemsabe: "Toda a equipe do Turno B sabe, mas tem medo de falar.",
    email: "operador.seguro@email.com",
    data: "13/11/2025",
    status: "nova",
  },
  {
    id: 3,
    categoria: "FRAUDE",
    descricao:
      "Estão inflando as notas de despesa de viagem. O valor do hotel da última viagem do diretor foi o dobro do que realmente custou. A secretária está lançando as notas 'corrigidas'.",
    evidencias: "Sem evidências, mas podem checar a Nota Fiscal 12345 da viagem para Recife.",
    envolvidos: "", // Caso Totalmente Anônimo
    relacao: "", // Caso Totalmente Anônimo
    quemsabe: "", // Caso Totalmente Anônimo
    email: "", // Caso Totalmente Anônimo
    data: "12/11/2025",
    status: "nova",
  },
  {
    id: 4,
    categoria: "DISCRIMINAÇÃO",
    descricao:
      "Durante o processo seletivo para vaga de Analista Sr., ouvi o recrutador dizer que 'não contrataria aquela candidata porque ela acabou de casar e logo vai querer engravidar'.",
    evidencias: "Sem evidências, foi uma conversa de corredor.",
    envolvidos: "Recrutador (João) e Gerente (Mariana)",
    relacao: "Analista de RH",
    quemsabe: "Apenas eu ouvi.",
    email: "rh.consciente@email.com",
    data: "11/11/2025",
    status: "nova",
  },
  {
    id: 5,
    categoria: "CONFLITO DE INTERESSES",
    descricao:
      "O processo de licitação para o novo software de RH está sendo direcionado para a empresa 'SoftTech'. Descobri que essa empresa pertence ao cunhado da gerente de RH.",
    evidencias: "E-mails internos direcionando a escolha antes mesmo da cotação.",
    envolvidos: "", // Caso Anônimo (Email Apenas)
    relacao: "", // Caso Anônimo (Email Apenas)
    quemsabe: "", // Caso Anônimo (Email Apenas)
    email: "analista.ti.correto@email.com",
    data: "10/11/2025",
    status: "nova",
  },
  {
    id: 6,
    categoria: "VAZAMENTO DE DADOS",
    descricao:
      "A lista de e-mails e CPFs de todos os clientes premium está disponível em uma pasta pública na rede interna (\\\\server\\public\\clientes_premium.xls), sem proteção alguma.",
    evidencias: "O caminho da pasta está na descrição.",
    envolvidos: "", // Caso Totalmente Anônimo
    relacao: "", // Caso Totalmente Anônimo
    quemsabe: "", // Caso Totalmente Anônimo
    email: "", // Caso Totalmente Anônimo
    data: "09/11/2025",
    status: "nova",
  },

  // --- 6 EM ANDAMENTO ---
  {
    id: 7,
    categoria: "AMEAÇA / AGRESSÃO",
    descricao:
      "Um funcionário do time de logística ameaçou um motorista terceirizado no pátio, dizendo que 'ia pegar ele lá fora' porque ele demorou para manobrar.",
    evidencias: "A câmera 04 do pátio deve ter gravado a discussão.",
    envolvidos: "", // Caso Anônimo (Email Apenas)
    relacao: "", // Caso Anônimo (Email Apenas)
    quemsabe: "", // Caso Anônimo (Email Apenas)
    email: "seguranca.patrimonial@email.com",
    data: "05/11/2025",
    status: "andamento",
  },
  {
    id: 8,
    categoria: "ASSÉDIO SEXUAL",
    descricao:
      "Meu coordenador (Marcos) vive fazendo 'elogios' ao meu corpo e me chamando para 'happy hour' só nós dois, mesmo eu já tendo dito não. Hoje ele tocou meu ombro e desceu a mão nas minhas costas.",
    evidencias: "Tenho prints de mensagens dele no Teams.",
    envolvidos: "Coordenador Marcos P.",
    relacao: "Estagiária",
    quemsabe: "Minha colega de baia (Juliana) viu a cena de hoje.",
    email: "estagiaria.constrangida@email.com",
    data: "04/11/2025",
    status: "andamento",
  },
  {
    id: 9,
    categoria: "FRAUDE",
    descricao:
      "O ponto eletrônico está sendo batido por outra pessoa para cobrir faltas de um funcionário do financeiro. O 'amigo' bate o ponto para ele às 8h, mas ele só chega às 10h.",
    evidencias: "Podem puxar as câmeras da entrada às 8h e comparar com o login.",
    envolvidos: "", // Caso Totalmente Anônimo
    relacao: "", // Caso Totalmente Anônimo
    quemsabe: "", // Caso Totalmente Anônimo
    email: "", // Caso Totalmente Anônimo
    data: "03/11/2025",
    status: "andamento",
  },
  {
    id: 10,
    categoria: "SAUDE E SEGURANÇA",
    descricao:
      "Fiação exposta no corredor do segundo andar, perto da máquina de café. Já deu curto-circuito duas vezes essa semana. Alguém vai tomar um choque.",
    evidencias: "Foto anexa.",
    envolvidos: "", // Caso Anônimo (Email Apenas)
    relacao: "", // Caso Anônimo (Email Apenas)
    quemsabe: "", // Caso Anônimo (Email Apenas)
    email: "alerta.manutencao@email.com",
    data: "01/11/2025",
    status: "andamento",
  },
  {
    id: 11,
    categoria: "OUTROS (Uso Indevido)",
    descricao:
      "O carro da empresa (Placa ABC-1234, modelo Onix) está sendo usado para fins pessoais pelo gerente de contas todo fim de semana. Ele leva os filhos na praia com o carro.",
    evidencias: "Vi o carro no estacionamento de um shopping no sábado.",
    envolvidos: "Gerente de Contas (Fábio)",
    relacao: "Analista de Frota",
    quemsabe: "Se puxarem o rastreador GPS, vão confirmar.",
    email: "controle.frota@email.com",
    data: "30/10/2025",
    status: "andamento",
  },
  {
    id: 12,
    categoria: "ASSÉDIO MORAL",
    descricao:
      "A liderança da equipe de TI está sobrecarregando um funcionário específico de propósito, tirando ele de projetos e passando tarefas operacionais repetitivas, para forçar ele a pedir demissão.",
    evidencias: "Basta ver o histórico de alocação de tarefas dele no Jira dos últimos 3 meses.",
    envolvidos: "", // Caso Totalmente Anônimo
    relacao: "", // Caso Totalmente Anônimo
    quemsabe: "", // Caso Totalmente Anônimo
    email: "", // Caso Totalmente Anônimo
    data: "28/10/2025",
    status: "andamento",
  },

  // --- 6 FINALIZADOS ---
  {
    id: 13,
    categoria: "FRAUDE (Suborno)",
    descricao:
      "Recebemos um fornecedor que nos ofereceu 5% de comissão 'por fora' para ganhar a concorrência. (Investigação concluída, fornecedor bloqueado e política reforçada).",
    evidencias: "Proposta de e-mail do fornecedor.",
    envolvidos: "", // Caso Anônimo (Email Apenas)
    relacao: "", // Caso Anônimo (Email Apenas)
    quemsabe: "", // Caso Anônimo (Email Apenas)
    email: "compras.compliance@email.com",
    data: "15/10/2025",
    status: "finalizado",
  },
  {
    id: 14,
    categoria: "AMEAÇA / AGRESSÃO",
    descricao:
      "Discussão entre dois colegas que escalou para agressão verbal e empurrões. (Medidas disciplinares aplicadas em ambos após análise das câmeras).",
    evidencias: "Testemunho da equipe e câmeras internas.",
    envolvidos: "Funcionário A e Funcionário B",
    relacao: "Líder de Equipe",
    quemsabe: "Toda a equipe de operações.",
    email: "lider.equipe@email.com",
    data: "10/10/2025",
    status: "finalizado",
  },
  {
    id: 15,
    categoria: "SAUDE E SEGURANÇA",
    descricao:
      "Denúncia sobre falta de EPIs (luvas térmicas) na área da caldeira. (Auditoria realizada, EPIs fornecidos e supervisor treinado).",
    evidencias: "Sem evidências, apenas relato.",
    envolvidos: "", // Caso Totalmente Anônimo
    relacao: "", // Caso Totalmente Anônimo
    quemsabe: "", // Caso Totalmente Anônimo
    email: "", // Caso Totalmente Anônimo
    data: "05/10/2025",
    status: "finalizado",
  },
  {
    id: 16,
    categoria: "ASSÉDIO MORAL",
    descricao:
      "Líder que fazia piadas constrangedoras sobre a aparência dos subordinados. (Líder passou por treinamento de conduta e foi advertido formalmente).",
    evidencias: "Relatos de 3 testemunhas.",
    envolvidos: "", // Caso Anônimo (Email Apenas)
    relacao: "", // Caso Anônimo (Email Apenas)
    quemsabe: "", // Caso Anônimo (Email Apenas)
    email: "nao.aguento.mais@email.com",
    data: "01/10/2025",
    status: "finalizado",
  },
  {
    id: 17,
    categoria: "VAZAMENTO DE DADOS",
    descricao:
      "Falha no portal do cliente que permitia, ao trocar o ID na URL, ver dados de outros usuários. (Falha crítica corrigida pela equipe de dev em 2 horas).",
    evidencias: "Vídeo gravando a tela mostrando a falha.",
    envolvidos: "Equipe de TI",
    relacao: "Cliente (Externo)",
    quemsabe: "N/A",
    email: "cliente.atento@email.com",
    data: "28/09/2025",
    status: "finalizado",
  },
  {
    id: 18,
    categoria: "CONFLITO DE INTERESSES",
    descricao:
      "Funcionário do financeiro aprovando pagamentos para empresa de buffet da própria esposa sem cotação. (Funcionário desligado após investigação).",
    evidencias: "CNPJ da empresa da esposa e notas fiscais aprovadas.",
    envolvidos: "", // Caso Totalmente Anônimo
    relacao: "", // Caso Totalmente Anônimo
    quemsabe: "", // Caso Totalmente Anônimo
    email: "", // Caso Totalmente Anônimo
    data: "20/09/2025",
    status: "finalizado",
  },
];

interface Comment {
  id: number
  texto: string
  data: string
  autor: string
}

export default function RelatosPage() {
  const [statusFilter, setStatusFilter] = useState("nova")
  const [comiteFilter, setComiteFilter] = useState("Comitê 1")
  const [selectedRelato, setSelectedRelato] = useState<number | null>(null)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showResponseDialog, setShowResponseDialog] = useState(false)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [showReopenDialog, setShowReopenDialog] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<Record<number, Comment[]>>({
    // Comentários mockados para demonstração
    7: [
      {
        id: 1,
        texto: "Iniciamos a investigação. Entrevistamos o funcionário do time de logística e revisamos as gravações da câmera 04.",
        data: "06/11/2025",
        autor: "Admin"
      },
      {
        id: 2,
        texto: "Aguardando depoimento do motorista terceirizado. Previsão de conclusão: 10/11/2025.",
        data: "07/11/2025",
        autor: "Admin"
      }
    ],
    8: [
      {
        id: 1,
        texto: "Coordenador foi notificado e afastado preventivamente. Iniciando processo de apuração.",
        data: "05/11/2025",
        autor: "Admin"
      }
    ],
    // Comentários para relatos finalizados
    13: [
      {
        id: 1,
        texto: "Investigação iniciada. Fornecedor foi contatado e proposta de suborno confirmada.",
        data: "16/10/2025",
        autor: "Admin"
      },
      {
        id: 2,
        texto: "Fornecedor bloqueado no sistema. Política de compliance reforçada com toda a equipe de compras.",
        data: "18/10/2025",
        autor: "Admin"
      }
    ],
    14: [
      {
        id: 1,
        texto: "Câmeras revisadas. Ambos os funcionários foram identificados e chamados para depoimento.",
        data: "11/10/2025",
        autor: "Admin"
      }
    ]
  })
  const [finalResponses, setFinalResponses] = useState<Record<number, string>>({
    // Respostas finais mockadas
    13: "Investigação concluída. Fornecedor foi bloqueado permanentemente e política de compliance foi reforçada com toda a equipe de compras. Todos os processos de licitação foram revisados.",
    14: "Medidas disciplinares aplicadas em ambos os funcionários após análise das câmeras. Ambos receberam advertência formal e foram orientados sobre conduta profissional.",
    15: "Auditoria realizada na área da caldeira. EPIs (luvas térmicas) foram fornecidos imediatamente e o supervisor passou por treinamento obrigatório de segurança.",
    16: "Líder passou por treinamento de conduta e foi advertido formalmente. Monitoramento contínuo implementado.",
    17: "Falha crítica corrigida pela equipe de desenvolvimento em 2 horas. Patch de segurança aplicado e testes de penetração realizados.",
    18: "Funcionário desligado após investigação confirmar conflito de interesses. Processo de aprovação de pagamentos foi revisado e novas salvaguardas implementadas."
  })

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

              {/* Resposta Final - apenas para finalizados */}
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

              {/* Comentários - para andamento e finalizados */}
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

              {/* Botões - diferentes para cada status */}
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
                  </>
                )}
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
              <Label className="text-base font-semibold text-center mb-6 flex">Comite</Label>
              <Select defaultValue="comite1">
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comite1">Comitê 1</SelectItem>
                  <SelectItem value="comite2">Comitê 2</SelectItem>
                  <SelectItem value="comite3">Comitê 3</SelectItem>
                  <SelectItem value="comite4">Comitê 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="flex justify-end gap-4 mt-8">
                <Button
                  onClick={() => setShowTransferDialog(false)}
                  className="bg-primary hover:bg-primary/90 text-white px-8"
                >
                  Transferir
                </Button>
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
                  // Aqui você pode adicionar a lógica para reabrir o caso
                  // Por exemplo, atualizar o status do relato de "finalizado" para "andamento"
                  console.log("Caso reaberto:", selectedRelato)
                  setShowReopenDialog(false)
                  // Você pode adicionar uma notificação de sucesso aqui
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
                      autor: "Admin" // Você pode pegar do contexto de autenticação
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
