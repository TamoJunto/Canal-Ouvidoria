// Serviço mockado de API para dashboard
// TODO: Substituir por chamadas reais quando backend estiver pronto

import type { DashboardResumo, DashboardFilters, DashboardPeriod } from "@/types/dashboard"

// Simula delay de rede
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Dados mockados para diferentes períodos
const mockDataSemana: DashboardResumo = {
  kpis: {
    total: 95,
    novos: 35,
    emAndamento: 40,
    finalizados: 20,
    variacaoTotal: { percentual: 4, periodo: "30 dias" },
    variacaoNovos: { percentual: 4, periodo: "30 dias" },
    variacaoEmAndamento: { percentual: -25, periodo: "30 dias" },
    variacaoFinalizados: { percentual: -12, periodo: "30 dias" },
  },
  serieTemporal: [
    { name: "Seg", novos: 12, finalizados: 8 },
    { name: "Ter", novos: 8, finalizados: 5 },
    { name: "Qua", novos: 15, finalizados: 10 },
    { name: "Qui", novos: 10, finalizados: 6 },
    { name: "Sex", novos: 9, finalizados: 7 },
    { name: "Sáb", novos: 6, finalizados: 4 },
    { name: "Dom", novos: 5, finalizados: 3 },
  ],
  periodo: {
    inicio: "15 Maio 2025",
    fim: "26 Jun 2025",
  },
}

const mockDataMes: DashboardResumo = {
  kpis: {
    total: 420,
    novos: 156,
    emAndamento: 180,
    finalizados: 84,
    variacaoTotal: { percentual: 12, periodo: "30 dias" },
    variacaoNovos: { percentual: 8, periodo: "30 dias" },
    variacaoEmAndamento: { percentual: -5, periodo: "30 dias" },
    variacaoFinalizados: { percentual: 15, periodo: "30 dias" },
  },
  serieTemporal: [
    { name: "Jan", novos: 45, finalizados: 20 },
    { name: "Fev", novos: 52, finalizados: 28 },
    { name: "Mar", novos: 48, finalizados: 25 },
    { name: "Abr", novos: 55, finalizados: 30 },
    { name: "Mai", novos: 59, finalizados: 35 },
    { name: "Jun", novos: 61, finalizados: 38 },
  ],
  periodo: {
    inicio: "01 Jan 2025",
    fim: "30 Jun 2025",
  },
}

const mockDataAno: DashboardResumo = {
  kpis: {
    total: 1850,
    novos: 720,
    emAndamento: 680,
    finalizados: 450,
    variacaoTotal: { percentual: 18, periodo: "12 meses" },
    variacaoNovos: { percentual: 22, periodo: "12 meses" },
    variacaoEmAndamento: { percentual: 5, periodo: "12 meses" },
    variacaoFinalizados: { percentual: 25, periodo: "12 meses" },
  },
  serieTemporal: [
    { name: "2023", novos: 580, finalizados: 320 },
    { name: "2024", novos: 650, finalizados: 380 },
    { name: "2025", novos: 720, finalizados: 450 },
  ],
  periodo: {
    inicio: "01 Jan 2023",
    fim: "31 Dez 2025",
  },
}

/**
 * Busca resumo do dashboard
 * @param filters Filtros opcionais (período, datas)
 * @returns Promise com dados do dashboard
 */
export async function getDashboardResumo(
  filters?: DashboardFilters
): Promise<DashboardResumo> {
  // Simula delay de rede
  await delay(800)

  const resolvedGroupBy = resolveGroupBy(filters)
  const baseData = pickDatasetByGroup(resolvedGroupBy)
  const response = cloneResumo(baseData)

  response.periodo = formatPeriodo(filters, baseData.periodo)

  return response
}

/**
 * Exporta relatório do dashboard (mockado)
 * @param filters Filtros do relatório
 * @returns Promise com URL do arquivo ou blob
 */
export async function exportDashboardReport(
  filters?: DashboardFilters
): Promise<Blob> {
  await delay(1200)

  // Simula geração de relatório
  const data = await getDashboardResumo(filters)
  const reportContent = JSON.stringify(data, null, 2)
  return new Blob([reportContent], { type: "application/json" })
}

function pickDatasetByGroup(groupBy: DashboardPeriod): DashboardResumo {
  switch (groupBy) {
    case "mes":
      return mockDataMes
    case "ano":
      return mockDataAno
    case "semana":
    default:
      return mockDataSemana
  }
}

function resolveGroupBy(filters?: DashboardFilters): DashboardPeriod {
  if (filters?.groupBy) return filters.groupBy

  if (filters?.dataInicio && filters?.dataFim) {
    const start = new Date(filters.dataInicio)
    const end = new Date(filters.dataFim)
    const diffDays = Math.abs(
      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    ) + 1

    if (diffDays <= 10) return "semana"
    if (diffDays <= 150) return "mes"
    return "ano"
  }

  return "semana"
}

function cloneResumo(data: DashboardResumo): DashboardResumo {
  return {
    kpis: {
      ...data.kpis,
      variacaoTotal: { ...data.kpis.variacaoTotal },
      variacaoNovos: { ...data.kpis.variacaoNovos },
      variacaoEmAndamento: { ...data.kpis.variacaoEmAndamento },
      variacaoFinalizados: { ...data.kpis.variacaoFinalizados },
    },
    serieTemporal: data.serieTemporal.map((item) => ({ ...item })),
    periodo: { ...data.periodo },
  }
}

function formatPeriodo(
  filters?: DashboardFilters,
  fallback?: DashboardResumo["periodo"]
): DashboardResumo["periodo"] {
  if (filters?.dataInicio && filters?.dataFim) {
    return {
      inicio: formatDateLabel(new Date(filters.dataInicio)),
      fim: formatDateLabel(new Date(filters.dataFim)),
    }
  }

  return fallback ?? { inicio: "", fim: "" }
}

const periodFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function formatDateLabel(date: Date) {
  return periodFormatter.format(date)
}

