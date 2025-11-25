// Tipos para os dados do dashboard

export type DashboardPeriod = "semana" | "mes" | "ano"

export interface DashboardKPI {
  total: number
  novos: number
  emAndamento: number
  finalizados: number
  variacaoTotal: {
    percentual: number
    periodo: string
  }
  variacaoNovos: {
    percentual: number
    periodo: string
  }
  variacaoEmAndamento: {
    percentual: number
    periodo: string
  }
  variacaoFinalizados: {
    percentual: number
    periodo: string
  }
}

export interface DashboardChartData {
  name: string
  novos: number
  finalizados: number
}

export interface DashboardResumo {
  kpis: DashboardKPI
  serieTemporal: DashboardChartData[]
  periodo: {
    inicio: string
    fim: string
  }
}

export interface DashboardFilters {
  groupBy?: DashboardPeriod
  dataInicio?: string
  dataFim?: string
}

