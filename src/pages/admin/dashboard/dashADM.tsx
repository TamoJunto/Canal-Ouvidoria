import { useMemo, useState } from "react"
import { HeaderAdmin } from "@/components/headerAdmin"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Calendar as CalendarIcon, BarChart3, TrendingUp, TrendingDown, Loader2, X, ChevronLeft, Filter } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useDashboard } from "@/hooks/useDashboard"
import type { DashboardPeriod } from "@/types/dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange as DateRangeType } from "react-day-picker"
import { useNavigate } from "react-router-dom"

export default function DashboardPage() {
  const navigate = useNavigate()
  const [groupBy, setGroupBy] = useState<DashboardPeriod>("semana")
  const [tipoOcorrencia, setTipoOcorrencia] = useState<string>("Todos")
  const [dateRange, setDateRange] = useState<DateRangeType | undefined>()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isTipoPopoverOpen, setIsTipoPopoverOpen] = useState(false)
  // Estado temporário para o calendário
  const [tempDateRange, setTempDateRange] = useState<DateRangeType | undefined>()

  const filters = useMemo(
    () => ({
      groupBy,
      tipoOcorrencia: tipoOcorrencia !== "Todos" ? tipoOcorrencia : undefined,
      dataInicio: dateRange?.from?.toISOString(),
      dataFim: dateRange?.to?.toISOString(),
    }),
    [
      groupBy,
      tipoOcorrencia,
      dateRange?.from?.getTime(),
      dateRange?.to?.getTime(),
    ]
  )

  const { data, loading, error, exportReport } = useDashboard(filters)

  const handleExport = async () => {
    await exportReport()
  }

  const formatVariacao = (percentual: number) => {
    const isPositive = percentual >= 0
    return {
      percentual: Math.abs(percentual),
      isPositive,
    }
  }

  const formatDateLabel = (date?: Date) => {
    if (!date) return ""
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const selectedPeriodLabel =
    dateRange?.from && dateRange?.to
      ? `${formatDateLabel(dateRange.from)} - ${formatDateLabel(dateRange.to)}`
      : data?.periodo.inicio && data?.periodo.fim
        ? `${data.periodo.inicio} - ${data.periodo.fim}`
        : "Selecione um período"

  const tipoOcorrenciaLabel = tipoOcorrencia === "Todos" ? "Todos os tipos" : tipoOcorrencia

  // Função para aplicar o filtro
  const handleApplyFilter = () => {
    setDateRange(tempDateRange)
    setIsPopoverOpen(false)
  }

  // Função para limpar o filtro
  const handleClearFilter = () => {
    setDateRange(undefined)
    setTempDateRange(undefined)
    setIsPopoverOpen(false)
  }

  // Sincronizar tempDateRange quando o popover abrir
  const handleOpenChange = (open: boolean) => {
    setIsPopoverOpen(open)
    if (open) {
      setTempDateRange(dateRange)
    }
  }

  // Atalhos rápidos de data
  const handleQuickSelect = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    setTempDateRange({ from: start, to: end })
  }

  const handleThisMonth = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    setTempDateRange({ from: start, to: end })
  }

  const handleLastMonth = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0)
    setTempDateRange({ from: start, to: end })
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderAdmin />
        <main className="flex flex-col items-center justify-center px-4 py-8 min-h-[60vh]">
          <div className="text-center">
            <p className="text-destructive text-lg mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      
      <HeaderAdmin />
      <main className="flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-7xl">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-foreground hover:text-primary mb-6 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium">Voltar</span>
          </button>
          <div className="bg-primary rounded-t-3xl p-8 overflow-visible">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <div className="flex gap-4 relative z-10">
                <Button
                  onClick={handleExport}
                  disabled={loading}
                  className="bg-white hover:bg-white/90 text-primary gap-2 flex-col h-auto py-2"
                >
                  <div className="flex items-center gap-2">
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span>Baixar Relatório</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {data?.periodo.inicio && data?.periodo.fim
                      ? `${data.periodo.inicio} - ${data.periodo.fim}`
                      : "Período"}
                  </span>
                </Button>
                <Popover open={isPopoverOpen} onOpenChange={handleOpenChange}>
                  <PopoverTrigger asChild>
                    <Button 
                      type="button"
                      className="bg-white hover:bg-white/90 text-primary gap-2 flex-col h-auto py-2"
                    >
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Filtro Período</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {selectedPeriodLabel}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-auto p-0 !z-[9999] bg-white shadow-xl border-2" 
                    align="end"
                    sideOffset={8}
                    side="bottom"
                    avoidCollisions={true}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onEscapeKeyDown={() => {
                      setIsPopoverOpen(false)
                    }}
                    onPointerDownOutside={(e) => {
                      // Não fechar se clicar no botão trigger
                      const target = e.target as HTMLElement
                      if (target.closest('[data-slot="popover-trigger"]')) {
                        e.preventDefault()
                      }
                    }}
                  >
                    <div className="p-4">
                      {/* Atalhos rápidos */}
                      <div className="mb-4 space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Atalhos Rápidos
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickSelect(0)}
                            className="text-xs h-8"
                            type="button"
                          >
                            Hoje
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickSelect(6)}
                            className="text-xs h-8"
                            type="button"
                          >
                            Últimos 7 dias
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickSelect(29)}
                            className="text-xs h-8"
                            type="button"
                          >
                            Últimos 30 dias
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleThisMonth}
                            className="text-xs h-8"
                            type="button"
                          >
                            Este mês
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLastMonth}
                            className="text-xs h-8"
                            type="button"
                          >
                            Mês passado
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickSelect(89)}
                            className="text-xs h-8"
                            type="button"
                          >
                            Últimos 90 dias
                          </Button>
                        </div>
                      </div>

                      {/* Calendário */}
                      <div className="border rounded-lg p-2 bg-accent/30">
                        <Calendar
                          initialFocus
                          mode="range"
                          selected={tempDateRange}
                          onSelect={setTempDateRange}
                          numberOfMonths={2}
                          className="rounded-md"
                        />
                      </div>

                      {/* Informação do período selecionado */}
                      {tempDateRange?.from && tempDateRange?.to && (
                        <div className="mt-3 p-2 bg-primary/10 rounded-md border border-primary/20">
                          <div className="text-xs font-medium text-primary mb-1">Período selecionado:</div>
                          <div className="text-sm text-foreground">
                            {formatDateLabel(tempDateRange.from)} até {formatDateLabel(tempDateRange.to)}
                          </div>
                        </div>
                      )}

                      {/* Botões de ação */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleClearFilter}
                          type="button"
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          Limpar
                        </Button>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => setIsPopoverOpen(false)}
                            type="button"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            size="sm"
                            onClick={handleApplyFilter}
                            disabled={!tempDateRange?.from || !tempDateRange?.to}
                            type="button"
                            className="bg-primary hover:bg-primary/90"
                          >
                            Aplicar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Popover open={isTipoPopoverOpen} onOpenChange={setIsTipoPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      type="button"
                      className="bg-white hover:bg-white/90 text-primary gap-2 flex-col h-auto py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span>Tipo Ocorrência</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {tipoOcorrenciaLabel}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-80 p-4 !z-[9999] bg-white shadow-xl border-2" 
                    align="end"
                    sideOffset={8}
                  >
                    <div className="space-y-3">
                      <div className="text-sm font-semibold mb-2">Selecione o tipo de ocorrência</div>
                      <div className="grid gap-2">
                        {[
                          { value: "Todos", label: "Todos os tipos" },
                          { value: "ASSÉDIO MORAL", label: "Assédio Moral" },
                          { value: "ASSÉDIO SEXUAL", label: "Assédio Sexual" },
                          { value: "AMEAÇA / AGRESSÃO", label: "Ameaça / Agressão" },
                          { value: "CONFLITO DE INTERESSES", label: "Conflito de Interesses" },
                          { value: "DISCRIMINAÇÃO", label: "Discriminação" },
                          { value: "FRAUDE", label: "Fraude" },
                          { value: "SAUDE E SEGURANÇA", label: "Saúde e Segurança" },
                          { value: "VAZAMENTO DE DADOS", label: "Vazamento de Dados" },
                          { value: "OUTROS", label: "Outros" },
                        ].map((tipo) => (
                          <Button
                            key={tipo.value}
                            variant={tipoOcorrencia === tipo.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setTipoOcorrencia(tipo.value)
                              setIsTipoPopoverOpen(false)
                            }}
                            className={tipoOcorrencia === tipo.value ? "bg-primary" : ""}
                          >
                            {tipo.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mb-8">
              {/* Total de Relatos */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    {loading ? (
                      <>
                        <Skeleton className="h-10 w-16 mb-2" />
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-20" />
                      </>
                    ) : (
                      <>
                        <div className="text-4xl font-bold">{data?.kpis.total || 0}</div>
                        <div className="text-sm text-muted-foreground mt-1">Total de Relatos</div>
                        {data?.kpis.variacaoTotal && (
                          <div
                            className={`flex items-center gap-1 text-xs mt-2 ${
                              formatVariacao(data.kpis.variacaoTotal.percentual).isPositive
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatVariacao(data.kpis.variacaoTotal.percentual).isPositive ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {formatVariacao(data.kpis.variacaoTotal.percentual).percentual}% (
                            {data.kpis.variacaoTotal.periodo})
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Novos */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-red-50 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    {loading ? (
                      <>
                        <Skeleton className="h-10 w-16 mb-2" />
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-20" />
                      </>
                    ) : (
                      <>
                        <div className="text-4xl font-bold">{data?.kpis.novos || 0}</div>
                        <div className="text-sm text-muted-foreground mt-1">Novos</div>
                        {data?.kpis.variacaoNovos && (
                          <div
                            className={`flex items-center gap-1 text-xs mt-2 ${
                              formatVariacao(data.kpis.variacaoNovos.percentual).isPositive
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatVariacao(data.kpis.variacaoNovos.percentual).isPositive ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {formatVariacao(data.kpis.variacaoNovos.percentual).percentual}% (
                            {data.kpis.variacaoNovos.periodo})
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Em Andamento */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-50 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    {loading ? (
                      <>
                        <Skeleton className="h-10 w-16 mb-2" />
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-20" />
                      </>
                    ) : (
                      <>
                        <div className="text-4xl font-bold">{data?.kpis.emAndamento || 0}</div>
                        <div className="text-sm text-muted-foreground mt-1">Em Andamento</div>
                        {data?.kpis.variacaoEmAndamento && (
                          <div
                            className={`flex items-center gap-1 text-xs mt-2 ${
                              formatVariacao(data.kpis.variacaoEmAndamento.percentual).isPositive
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatVariacao(data.kpis.variacaoEmAndamento.percentual).isPositive ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {formatVariacao(data.kpis.variacaoEmAndamento.percentual).percentual}% (
                            {data.kpis.variacaoEmAndamento.periodo})
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Finalizados */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-50 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    {loading ? (
                      <>
                        <Skeleton className="h-10 w-16 mb-2" />
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-20" />
                      </>
                    ) : (
                      <>
                        <div className="text-4xl font-bold">{data?.kpis.finalizados || 0}</div>
                        <div className="text-sm text-muted-foreground mt-1">Finalizados</div>
                        {data?.kpis.variacaoFinalizados && (
                          <div
                            className={`flex items-center gap-1 text-xs mt-2 ${
                              formatVariacao(data.kpis.variacaoFinalizados.percentual).isPositive
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatVariacao(data.kpis.variacaoFinalizados.percentual).isPositive ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {formatVariacao(data.kpis.variacaoFinalizados.percentual).percentual}% (
                            {data.kpis.variacaoFinalizados.periodo})
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-accent rounded-b-3xl p-8 border-4 border-t-0 border-primary">
            <div className="bg-white rounded-2xl p-8">
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data?.serieTemporal || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="novos" fill="#EAB308" radius={[8, 8, 0, 0]} name="Novos" />
                    <Bar dataKey="finalizados" fill="#F87171" radius={[8, 8, 0, 0]} name="Finalizados" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}