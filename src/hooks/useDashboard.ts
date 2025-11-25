import { useState, useEffect, useCallback, useMemo } from "react"
import { getDashboardResumo, exportDashboardReport } from "@/services/dashboardApi"
import type { DashboardResumo, DashboardFilters } from "@/types/dashboard"

interface UseDashboardReturn {
  data: DashboardResumo | null
  loading: boolean
  error: string | null
  refetch: () => void
  exportReport: () => Promise<void>
}

/**
 * Hook customizado para buscar dados do dashboard
 */
export function useDashboard(filters?: DashboardFilters): UseDashboardReturn {
  const [data, setData] = useState<DashboardResumo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estabiliza o objeto filters para evitar re-renders desnecessários
  const stableFilters = useMemo(() => filters, [
    filters?.groupBy,
    filters?.dataInicio,
    filters?.dataFim,
  ])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getDashboardResumo(stableFilters)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados do dashboard")
      console.error("Erro ao buscar dashboard:", err)
    } finally {
      setLoading(false)
    }
  }, [stableFilters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const exportReport = useCallback(async () => {
    try {
      const blob = await exportDashboardReport(stableFilters)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `relatorio-dashboard-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Erro ao exportar relatório:", err)
      alert("Erro ao exportar relatório. Tente novamente.")
    }
  }, [stableFilters])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    exportReport,
  }
}

