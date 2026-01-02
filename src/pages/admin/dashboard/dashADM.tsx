import { useMemo, useState } from "react"
import { HeaderAdmin } from "@/components/headerAdmin"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Calendar as CalendarIcon, BarChart3, TrendingUp, TrendingDown, Loader2, X, ChevronLeft, Filter, FileSpreadsheet, FileJson, FileText, ChevronDown } from "lucide-react"
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

  const { data, loading, error, exportAsCSV, exportAsExcel, exportAsJSON } = useDashboard(filters)
  const [showExportMenu, setShowExportMenu] = useState(false)

  const handleExportCSV = async () => {
    await exportAsCSV()
    setShowExportMenu(false)
  }

  const handleExportExcel = async () => {
    await exportAsExcel()
    setShowExportMenu(false)
  }

  const handleExportJSON = async () => {
    await exportAsJSON()
    setShowExportMenu(false)
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
                <div className="relative">
                  <Button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    disabled={loading}
                    className="bg-white hover:bg-white/90 text-primary gap-2 flex items-center h-auto py-3 px-4"
                  >
                    <Download className="h-4 w-4" />
                    <span>Exportar</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                  
                  {showExportMenu && !loading && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <button
                        onClick={handleExportExcel}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors"
                      >
                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="font-medium text-sm">Excel (.xlsx)</div>
                          <div className="text-xs text-muted-foreground">Recomendado para análise</div>
                        </div>
                      </button>
                      <button
                        onClick={handleExportCSV}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors"
                      >
                        <FileText className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-medium text-sm">CSV (.csv)</div>
                          <div className="text-xs text-muted-foreground">Compatível com Excel</div>
                        </div>
                      </button>
                      <button
                        onClick={handleExportJSON}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors"
                      >
                        <FileJson className="h-4 w-4 text-purple-600" />
                        <div>
                          <div className="font-medium text-sm">JSON (.json)</div>
                          <div className="text-xs text-muted-foreground">Para desenvolvedores</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
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
                    className="w-auto p-5 !z-[9999] bg-white shadow-2xl border-2 border-primary/20 rounded-2xl max-w-3xl max-h-[90vh] overflow-y-auto" 
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
                    <div className="bg-white">
                      {/* Título */}
                      <div className="mb-5 pb-3 border-b-2 border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Selecione o Período</h3>
                        <p className="text-xs text-gray-600">Escolha um atalho rápido ou selecione as datas no calendário abaixo</p>
                      </div>

                      {/* Atalhos rápidos */}
                      <div className="mb-5">
                        <div className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <div className="w-1 h-4 bg-primary rounded-full"></div>
                          Atalhos Rápidos
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { handleQuickSelect(0); handleApplyFilter(); }}
                            className="text-xs h-10 border-2 border-primary/30 hover:border-primary hover:bg-primary hover:text-white transition-all font-medium"
                            type="button"
                          >
                            Hoje
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { handleQuickSelect(6); handleApplyFilter(); }}
                            className="text-xs h-10 border-2 border-primary/30 hover:border-primary hover:bg-primary hover:text-white transition-all font-medium"
                            type="button"
                          >
                            Últimos 7 dias
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { handleQuickSelect(29); handleApplyFilter(); }}
                            className="text-xs h-10 border-2 border-primary/30 hover:border-primary hover:bg-primary hover:text-white transition-all font-medium"
                            type="button"
                          >
                            Últimos 30 dias
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { handleThisMonth(); handleApplyFilter(); }}
                            className="text-xs h-10 border-2 border-primary/30 hover:border-primary hover:bg-primary hover:text-white transition-all font-medium"
                            type="button"
                          >
                            Este Mês
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { handleLastMonth(); handleApplyFilter(); }}
                            className="text-xs h-10 border-2 border-primary/30 hover:border-primary hover:bg-primary hover:text-white transition-all font-medium"
                            type="button"
                          >
                            Mês Passado
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { handleQuickSelect(89); handleApplyFilter(); }}
                            className="text-xs h-10 border-2 border-primary/30 hover:border-primary hover:bg-primary hover:text-white transition-all font-medium"
                            type="button"
                          >
                            Últimos 90 dias
                          </Button>
                        </div>
                      </div>

                      <div className="my-4 border-t-2 border-gray-200"></div>

                      {/* Calendário */}
                      <div className="mb-5">
                        <div className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <div className="w-1 h-4 bg-primary rounded-full"></div>
                          Ou selecione datas manualmente
                        </div>
                        <div className="border-2 border-primary/20 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white shadow-inner">
                          <Calendar
                            initialFocus
                            mode="range"
                            selected={tempDateRange}
                            onSelect={setTempDateRange}
                            numberOfMonths={2}
                            className="rounded-lg"
                            classNames={{
                              months: "flex flex-col sm:flex-row gap-6",
                              month: "space-y-3",
                            }}
                          />
                        </div>
                      </div>

                      {/* Informação do período selecionado */}
                      {tempDateRange?.from && tempDateRange?.to && (
                        <div className="mb-5 p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border-2 border-primary/30 shadow-sm">
                          <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wide">Período Selecionado</div>
                          <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <CalendarIcon className="h-3 w-3 text-primary" />
                            {formatDateLabel(tempDateRange.from)} até {formatDateLabel(tempDateRange.to)}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {Math.ceil((tempDateRange.to.getTime() - tempDateRange.from.getTime()) / (1000 * 60 * 60 * 24))} dias
                          </div>
                        </div>
                      )}

                      {/* Botões de ação */}
                      <div className="flex items-center justify-between pt-3 border-t-2 border-gray-200 gap-3 sticky bottom-0 bg-white pb-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleClearFilter}
                          type="button"
                          className="gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                          <X className="h-4 w-4" />
                          Limpar Filtro
                        </Button>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => setIsPopoverOpen(false)}
                            type="button"
                            className="border-2 border-gray-300 hover:border-gray-400 px-4"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            size="sm"
                            onClick={handleApplyFilter}
                            disabled={!tempDateRange?.from || !tempDateRange?.to}
                            type="button"
                            className="bg-primary hover:bg-primary/90 text-white px-4 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Aplicar Filtro
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